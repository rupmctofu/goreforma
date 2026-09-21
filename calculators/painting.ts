import { CATALOG_UPDATED_AT } from "./catalog";
import { qualityStep } from "./shared";
import type {
  Answers,
  CalculatorDefinition,
  LinearQuantity,
  StepOption,
} from "./types";

const SCOPE_OPTIONS: StepOption[] = [
  {
    id: "paredes",
    label: "Paredes",
    description: "Pintar solo las paredes de la vivienda.",
  },
  {
    id: "techos",
    label: "Techos",
    description: "Pintar solo los techos.",
  },
  {
    id: "paredes_techos",
    label: "Paredes y techos",
    description: "Pintar toda la vivienda.",
  },
];

const ELEMENT_OPTIONS: StepOption[] = [
  { id: "preparacion_superficie", label: "Reparación de grietas e imperfecciones" },
  { id: "imprimacion", label: "Imprimación selladora" },
  { id: "pintura_especial", label: "Pintura especial para baños y cocinas" },
];

function getScope(answers: Answers): string {
  const scope = answers["scope"];
  return typeof scope === "string" ? scope : "paredes";
}

function getElements(answers: Answers): string[] {
  const value = answers["elements"];
  return Array.isArray(value) ? value : [];
}

function getArea(answers: Answers): number {
  const raw = answers["area"];
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 60;
}

export const paintingCalculator: CalculatorDefinition = {
  id: "painting",
  slug: "calculadora-pintar-piso",
  name: "Pintar una vivienda",
  category: "pintura",
  shortDescription:
    "Calcula cuánto puede costar pintar tu piso según la superficie, el acabado y la mano de obra.",
  icon: "roller",
  areaStepId: "area",
  qualityStepId: "quality",
  qualityFactors: { BASICA: 0.85, MEDIA: 1, PREMIUM: 1.6 },
  steps: [
    {
      id: "scope",
      title: "Superficie",
      question: "¿Qué vas a pintar?",
      fieldType: "single_choice",
      options: SCOPE_OPTIONS,
    },
    {
      id: "area",
      title: "Metros",
      question: "¿Cuántos m² vas a pintar en total?",
      fieldType: "number",
      unit: "m²",
      min: 1,
      max: 2000,
      placeholder: "P. ej. 90",
      help: "Introduce los metros cuadrados totales de superficie a pintar (paredes y/o techos).",
    },
    qualityStep(),
    {
      id: "elements",
      title: "Extras",
      question: "¿Qué extras quieres incluir?",
      fieldType: "multi_choice",
      help: "El precio base ya incluye la pintura de la superficie elegida. Marca aquí los trabajos adicionales.",
      options: ELEMENT_OPTIONS,
    },
  ],
  buildLineItems(answers): LinearQuantity[] {
    const area = getArea(answers);
    const scope = getScope(answers);
    const selected = getElements(answers);

    const items: LinearQuantity[] = [];
    if (scope === "paredes" || scope === "paredes_techos") {
      items.push({
        label: "Pintura de paredes",
        subcategory: "pintura_paredes",
        unit: "m2",
        quantity: area,
        note: "Material y mano de obra incluidos.",
      });
    }
    if (scope === "techos" || scope === "paredes_techos") {
      items.push({
        label: "Pintura de techos",
        subcategory: "pintura_techos",
        unit: "m2",
        quantity: area,
        note: "Material y mano de obra incluidos.",
      });
    }
    if (selected.includes("preparacion_superficie")) {
      items.push({
        label: "Reparación de grietas e imperfecciones",
        subcategory: "preparacion_superficie",
        unit: "m2",
        quantity: area,
        note: "Lijado, masillado y tapado de pequeñas grietas.",
      });
    }
    if (selected.includes("imprimacion")) {
      items.push({
        label: "Imprimación selladora",
        subcategory: "imprimacion",
        unit: "m2",
        quantity: area,
      });
    }
    if (selected.includes("pintura_especial")) {
      items.push({
        label: "Pintura especial para baños y cocinas",
        subcategory: "pintura_especial",
        unit: "m2",
        quantity: 20,
        note: "Se estiman 20 m² entre baño y cocina.",
      });
    }
    return items;
  },
  buildAssumptions(answers): string[] {
    const scope = getScope(answers);
    return [
      `La superficie marcada son ${getArea(answers)} m² de ${scope === "paredes_techos" ? "paredes y techos" : scope}.`,
      "El precio por m² incluye pintura y mano de obra de un profesional.",
      "Para techos con mucha altura o trabajos en altura el precio puede aumentar.",
      "Los muebles y el llenado de la vivienda no están incluidos.",
    ];
  },
  updatedAt: CATALOG_UPDATED_AT,
};