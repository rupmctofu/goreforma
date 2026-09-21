import type { Answers, CalculatorDefinition } from "@/calculators/types";

export type CalculatorValidation =
  | { ok: true; answers: Answers }
  | { ok: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCalculatorAnswers(
  calculator: CalculatorDefinition,
  value: unknown,
): CalculatorValidation {
  if (!isRecord(value)) {
    return { ok: false, errors: { answers: "Las respuestas no son válidas." } };
  }

  const answers = value as Answers;
  const errors: Record<string, string> = {};

  for (const step of calculator.steps) {
    const answer = answers[step.id];

    if (step.optional && (answer === undefined || answer === null || answer === "")) {
      continue;
    }

    if (step.fieldType === "single_choice") {
      const valid =
        typeof answer === "string" &&
        step.options?.some((option) => option.id === answer);
      if (!valid) errors[step.id] = "Selecciona una opción válida.";
      continue;
    }

    if (step.fieldType === "number") {
      const numeric =
        typeof answer === "number"
          ? answer
          : typeof answer === "string" && answer.trim() !== ""
            ? Number(answer.replace(",", "."))
            : Number.NaN;
      if (!Number.isFinite(numeric)) {
        errors[step.id] = "Introduce un número válido.";
      } else if (step.min !== undefined && numeric < step.min) {
        errors[step.id] = `El valor mínimo es ${step.min}.`;
      } else if (step.max !== undefined && numeric > step.max) {
        errors[step.id] = `El valor máximo es ${step.max}.`;
      }
      continue;
    }

    if (!Array.isArray(answer) || answer.some((item) => typeof item !== "string")) {
      errors[step.id] = "La selección de elementos no es válida.";
      continue;
    }

    const validOptions = new Set(step.options?.map((option) => option.id));
    if (answer.some((item) => !validOptions.has(item))) {
      errors[step.id] = "Hay elementos seleccionados no válidos.";
    }
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, answers };
}
