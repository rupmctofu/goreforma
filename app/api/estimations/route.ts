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
  const respond = (body: object, status: number) => NextResponse.json(body, { status });

  if (Number(request.headers.get("content-length") ?? 0) > 32_000) {
    return respond({ error: "Petición demasiado grande." }, 413);
  }
  // Detrás de un proxy (Vercel) la IP real llega en x-forwarded-for. Si no existe,
  // se usa el UA como discriminante para no meter a todos los visitantes anónimos
  // en el mismo cubo.
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("user-agent")?.slice(0, 100) ||
    "unknown";
  if (isRateLimited(`estimation:${clientKey}`, 20, 60_000)) {
    return respond({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, 429);
  }
  let body: { calculatorId?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Cuerpo de la petición no válido." }, 400);
  }

  if (typeof body.calculatorId !== "string") {
    return respond({ error: "Falta la calculadora." }, 400);
  }

  const calculator = getCalculatorById(body.calculatorId);
  if (!calculator) {
    return respond({ error: "Calculadora no válida." }, 400);
  }

  const validation = validateCalculatorAnswers(calculator, body.answers);
  if (!validation.ok) {
    return respond({ errors: validation.errors }, 400);
  }

  let result;
  try {
    result = calculate(calculator, validation.answers);
  } catch {
    return respond({ error: "No se pudo calcular la estimación con estos datos." }, 422);
  }

  const token = randomBytes(32).toString("base64url");
  try {
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

    return respond(
      {
        id: estimation.id,
        recoveryUrl: `/estimacion/${token}`,
        result,
        catalogVersion: result.catalogVersion,
        catalogSource: result.catalogSource,
        algorithmVersion: ALGORITHM_VERSION,
      },
      201,
    );
  } catch (error) {
    console.error("[api/estimations] No se pudo guardar la estimación", error);
    return respond({ error: "No se pudo guardar la estimación. Inténtalo de nuevo." }, 500);
  }
}
