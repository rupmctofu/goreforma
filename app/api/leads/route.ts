import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateLead } from "@/lib/validate";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

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
  if (isRateLimited(`lead:${clientKey}`, 5, 60_000)) {
    return respond({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, 429);
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "Cuerpo de la petición no válido." }, 400);
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
    return respond({ error: "Petición no válida." }, 400);
  }

  const { ok, errors } = validateLead(input);
  if (!ok) {
    return respond({ errors }, 400);
  }

  const estimation = input.estimationId
    ? await prisma.estimation.findUnique({ where: { id: input.estimationId } })
    : null;
  if (input.estimationId && !estimation) {
    return respond({ error: "La estimación no existe." }, 400);
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

    return respond({ ok: true, id: lead.id }, 201);
  } catch (error) {
    console.error("[api/leads] No se pudo guardar el lead", error);
    return respond({ error: "No se pudo guardar la solicitud. Inténtalo de nuevo." }, 500);
  }
}
