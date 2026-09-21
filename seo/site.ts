import type { CalculatorDefinition } from "../calculators/types";

// Configuración del sitio. `url` es la URL pública; en producción se debe
// definir NEXT_PUBLIC_SITE_URL. El valor local es un placeholder.
function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && env.trim() !== "") return env.replace(/\/$/, "");
  return "https://goreforma.es"; // TODO: confirmar el dominio definitivo al publicar
}

export const siteConfig = {
  name: "GoReforma",
  tagline: "¿Cuánto puede costar tu reforma?",
  description:
    "Calcula una estimación orientativa del coste de tu reforma en minutos. Precios de referencia del mercado español para baños, cocinas, reformas integrales y pintura.",
  url: siteUrl(),
  locale: "es_ES",
  language: "es",
} as const;

export function calculatorUrl(calculator: Pick<CalculatorDefinition, "slug">): string {
  return `${siteConfig.url}/${calculator.slug}`;
}

export function relativeCalculatorPath(
  calculator: Pick<CalculatorDefinition, "slug">,
): string {
  return `/${calculator.slug}`;
}