import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { calculate } from "@/calculators/engine";
import { CATALOG_VERSION } from "@/calculators/catalog";
import { getCalculatorById } from "@/calculators/registry";
import { prisma } from "@/lib/db";
import { validateCalculatorAnswers } from "@/lib/validate-calculator";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const ALGORITHM_VERSION = "prototype-0";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 90;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 32_000) {
    return NextResponse.json({ error: "Petición demasiado grande." }, { status: 413 });
  }
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`estimation:${clientKey}`, 20, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }
  let body: { calculatorId?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición no válido." }, { status: 400 });
  }

  if (typeof body.calculatorId !== "string") {
    return NextResponse.json({ error: "Falta la calculadora." }, { status: 400 });
  }

  const calculator = getCalculatorById(body.calculatorId);
  if (!calculator) {
    return NextResponse.json({ error: "Calculadora no válida." }, { status: 400 });
  }

  const validation = validateCalculatorAnswers(calculator, body.answers);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  let result;
  try {
    result = calculate(calculator, validation.answers);
  } catch {
    return NextResponse.json(
      { error: "No se pudo calcular la estimación con estos datos." },
      { status: 422 },
    );
  }

  const token = randomBytes(32).toString("base64url");
  const catalog = await prisma.priceCatalog.findUnique({
    where: { version: CATALOG_VERSION },
  });
  const estimation = await prisma.estimation.create({
    data: {
      calculatorId: calculator.id,
      calculatorSlug: calculator.slug,
      answers: validation.answers,
      result: JSON.parse(JSON.stringify(result)),
      breakdown: JSON.parse(JSON.stringify(result.breakdown)),
      assumptions: result.assumptions,
      minAmount: result.min,
      averageAmount: result.avg,
      maxAmount: result.max,
      catalogId: catalog?.id,
      catalogVersion: result.catalogVersion,
      catalogSource: result.catalogSource,
      algorithmVersion: ALGORITHM_VERSION,
      recoveryTokenHash: hashToken(token),
      recoveryTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return NextResponse.json(
    {
      id: estimation.id,
      recoveryUrl: `/estimacion/${token}`,
      result,
      catalogVersion: result.catalogVersion,
      catalogSource: result.catalogSource,
      algorithmVersion: ALGORITHM_VERSION,
    },
    { status: 201 },
  );
}
