import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateLead } from "@/lib/validate";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 32_000) {
    return NextResponse.json({ error: "Petición demasiado grande." }, { status: 413 });
  }
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`lead:${clientKey}`, 5, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición no válido." },
      { status: 400 },
    );
  }

  const input = {
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    postalCode: typeof body.postalCode === "string" ? body.postalCode : "",
    projectType: typeof body.projectType === "string" ? body.projectType : "",
    estimationId: typeof body.estimationId === "string" ? body.estimationId : "",
    consentGiven: body.consentGiven === true,
  };

  if (body.website !== undefined && body.website !== "") {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  const { ok, errors } = validateLead(input);
  if (!ok) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const estimation = input.estimationId
    ? await prisma.estimation.findUnique({ where: { id: input.estimationId } })
    : null;
  if (input.estimationId && !estimation) {
    return NextResponse.json({ error: "La estimación no existe." }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        name: input.name.trim() || "Sin nombre",
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        postalCode: input.postalCode.trim() || null,
        projectType: input.projectType.trim(),
        estimatedBudget: estimation ? String(Math.round(estimation.averageAmount)) : "Sin estimación",
        status: "NUEVO",
        estimationId: estimation?.id,
        consentGiven: true,
        consentVersion: "privacy-v1",
        consentAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la solicitud. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
