import type { AnswerValue, Answers, CalculatorDefinition } from "@/calculators/types";

export type CalculatorValidation =
  | { ok: true; answers: Answers }
  | { ok: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswerNumber(value: AnswerValue | undefined): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
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
      const numeric = parseAnswerNumber(answer);
      if (numeric === null) {
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

  // Validaciones de dependencias entre respuestas.
  const elements = Array.isArray(answers.elements) ? (answers.elements as string[]) : [];
  if (elements.includes("pintura_especial")) {
    const area = parseAnswerNumber(answers.area);
    const specialArea = parseAnswerNumber(answers.special_area);
    if (specialArea === null || specialArea <= 0) {
      errors.special_area = "Indica cuántos m² de baño o cocina vas a pintar con pintura especial.";
    } else if (area !== null && specialArea > area) {
      errors.special_area = "La superficie especial no puede ser mayor que la superficie total.";
    }
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, answers };
}
