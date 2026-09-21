import { createHash } from "node:crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCalculatorById } from "@/calculators/registry";
import type { EstimationResult } from "@/calculators/types";
import { ResultView } from "@/components/calculator/result-view";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Estimación de reforma",
  robots: { index: false, follow: false },
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function formatExpiry(date: Date | null): string {
  if (!date) return "no caduca";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EstimationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const estimation = await prisma.estimation.findUnique({
    where: { recoveryTokenHash: hashToken(token) },
  });

  if (
    !estimation ||
    (estimation.recoveryTokenExpiresAt && estimation.recoveryTokenExpiresAt < new Date())
  ) {
    notFound();
  }

  const calculator = getCalculatorById(estimation.calculatorId);
  if (!calculator) notFound();

  return (
    <section className="py-12">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold text-accent-700">Estimación guardada</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Tu estimación de {calculator.name.toLowerCase()}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Este enlace muestra el cálculo guardado con el catálogo {estimation.catalogVersion}.
          Válido hasta el {formatExpiry(estimation.recoveryTokenExpiresAt)}.
        </p>
        <div className="mt-8">
          <ResultView
            estimate={estimation.result as unknown as EstimationResult}
            calculatorName={calculator.name}
            recoveryUrl={`/estimacion/${token}`}
          />
        </div>
      </Container>
    </section>
  );
}
