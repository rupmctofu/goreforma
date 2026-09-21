import { getPriceEntry } from "./catalog";
import type {
  Answers,
  CalculatorDefinition,
  EstimationResult,
  Quality,
} from "./types";
import { DISCLAIMER_ESTIMACION } from "./types";

function toNumber(value: Answers[string]): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function resolveQuality(
  calculator: CalculatorDefinition,
  answers: Answers,
): Quality {
  const selected = answers[calculator.qualityStepId];
  if (selected === "BASICA" || selected === "PREMIUM") return selected;
  return "MEDIA";
}

export function getArea(
  calculator: CalculatorDefinition,
  answers: Answers,
): number {
  const area = toNumber(answers[calculator.areaStepId]);
  if (area === null || area <= 0) {
    const step = calculator.steps.find((s) => s.id === calculator.areaStepId);
    return step?.min ?? 1;
  }
  return area;
}

/**
 * Motor de cálculo. Es independiente de la interfaz y de la base de datos:
 * recibe las respuestas del formulario y devuelve una estimación acotada.
 */
export function calculate(
  calculator: CalculatorDefinition,
  answers: Answers,
): EstimationResult {
  const quality = resolveQuality(calculator, answers);
  const factor = calculator.qualityFactors[quality];
  const area = getArea(calculator, answers);

  const lineItems = calculator.buildLineItems(answers);
  const breakdown = lineItems.map((line) => {
    const price = getPriceEntry(calculator.category, line.subcategory);
    if (!price) {
      throw new Error(
        `Precio no encontrado en el catálogo para ${calculator.category}:${line.subcategory}`,
      );
    }
    return {
      label: line.label,
      subcategory: line.subcategory,
      unit: line.unit,
      quantity: line.quantity,
      min: price.minPrice * line.quantity * factor,
      avg: price.averagePrice * line.quantity * factor,
      max: price.maxPrice * line.quantity * factor,
    };
  });

  const sum = (key: "min" | "avg" | "max") =>
    breakdown.reduce((acc, item) => acc + item[key], 0);
  const min = sum("min");
  const avg = sum("avg");
  const max = sum("max");

  return {
    currency: "EUR",
    min,
    avg,
    max,
    perM2: { min: min / area, avg: avg / area, max: max / area },
    area,
    quality,
    breakdown,
    assumptions: calculator.buildAssumptions(answers),
    updatedAt: calculator.updatedAt,
    disclaimer: DISCLAIMER_ESTIMACION,
  };
}

/**
 * Comprueba si las respuestas actuales permiten calcular la estimación.
 * Las opciones obligatorias deben estar respondidas y el área debe ser > 0.
 */
export function canCalculate(
  calculator: CalculatorDefinition,
  answers: Answers,
): boolean {
  for (const step of calculator.steps) {
    const value = answers[step.id];
    if (value === undefined || value === null || value === "") return false;
    if (step.fieldType === "number" && step.id === calculator.areaStepId) {
      const n = toNumber(value);
      if (n === null || n <= 0) return false;
    }
  }
  return true;
}