import type { EstimationResult } from "@/calculators/types";
import { formatEUR, formatNumber } from "@/lib/format";
import { QUALITY_LABELS } from "@/calculators/types";

const UNIT_LABELS: Record<string, string> = {
  m2: "m²",
  ml: "ml",
  unidad: "unid.",
  global: "global",
};

function StepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-200/70">
      {children}
    </span>
  );
}

export function ResultView({
  estimate,
  calculatorName,
}: {
  estimate: EstimationResult;
  calculatorName: string;
}) {
  return (
    <div className="animate-step-in space-y-6">
      <div className="rounded-[2rem] border border-accent-100 bg-gradient-to-br from-accent-50 to-white p-8 text-center sm:p-10">
        <StepBadge>
          {calculatorName} · {QUALITY_LABELS[estimate.quality]}
        </StepBadge>

        <div className="mt-6 flex items-baseline justify-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {formatEUR(estimate.min)}
          </span>
          <span className="text-xl font-semibold text-slate-400">–</span>
          <span className="text-4xl font-extrabold tracking-tight text-accent-600 sm:text-5xl">
            {formatEUR(estimate.max)}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Rango orientativo · estimación media{" "}
          <span className="font-semibold text-slate-800">{formatEUR(estimate.avg)}</span> ·{" "}
          {formatEUR(estimate.perM2.min)} – {formatEUR(estimate.perM2.max)} por m²
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 text-xs">
          <StepBadge>{formatNumber(estimate.area)} m²</StepBadge>
          <StepBadge>Precios {estimate.updatedAt}</StepBadge>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Desglose estimado</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Concepto</th>
                <th className="py-2 pr-4 font-semibold">Cantidad</th>
                <th className="py-2 text-right font-semibold">Rango</th>
              </tr>
            </thead>
            <tbody>
              {estimate.breakdown.map((item) => (
                <tr key={item.subcategory} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4 text-slate-800">
                    {item.label}
                    <span className="block text-xs text-muted-foreground">
                      {item.unit ? UNIT_LABELS[item.unit] : ""}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-900">
                    {formatEUR(item.min)} – {formatEUR(item.max)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Hipótesis de cálculo</h3>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
          {estimate.assumptions.map((assumption) => (
            <li key={assumption} className="flex gap-2.5">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-400" />
              {assumption}
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-muted-foreground">
          {estimate.disclaimer}
        </p>
      </div>
    </div>
  );
}