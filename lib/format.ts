export function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maxDecimals = 0): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/** Redondeo a múltiplo que evita falsa precisión (p. ej. a 100 €). */
export function roundToStep(value: number, step = 100): number {
  return Math.round(value / step) * step;
}

export function formatRange(min: number, max: number, step = 100): string {
  return `${formatEUR(roundToStep(min, step))} – ${formatEUR(roundToStep(max, step))}`;
}

export function formatISODate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}