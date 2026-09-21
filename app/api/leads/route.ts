import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateLead } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    estimatedBudget:
      typeof body.estimatedBudget === "string" ? body.estimatedBudget : "",
  };

  const { ok, errors } = validateLead(input);
  if (!ok) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        postalCode: input.postalCode.trim() || null,
        projectType: input.projectType.trim(),
        estimatedBudget: input.estimatedBudget.trim() || "Sin estimación",
        status: "NUEVO",
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