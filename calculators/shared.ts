import type { CalculatorStep } from "./types";

export function qualityStep(): CalculatorStep {
  return {
    id: "quality",
    title: "Calidad",
    question: "¿Qué calidad buscas?",
    fieldType: "single_choice",
    help: "La calidad afecta al precio de los materiales y al acabado. Es un factor clave en el coste final.",
    options: [
      {
        id: "BASICA",
        label: "Básica",
        description: "Materiales funcionales y económicos.",
      },
      {
        id: "MEDIA",
        label: "Media",
        description: "Buen equilibrio entre calidad y precio.",
      },
      {
        id: "PREMIUM",
        label: "Premium",
        description: "Gama alta y acabados cuidados.",
      },
    ],
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}