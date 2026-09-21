import { CATALOG_UPDATED_AT } from "./catalog";
import { qualityStep, clamp } from "./shared";
import type {
  Answers,
  CalculatorDefinition,
  LinearQuantity,
  StepOption,
} from "./types";

const SCOPE_OPTIONS: StepOption[] = [
  {
    id: "completa",
    label: "Cocina completa",
    description: "Muebles, encimera, electrodomésticos e instalaciones.",
  },
  {
    id: "muebles",
    label: "Muebles y encimera",
    description: "Renovar muebles bajos, altos y encimera.",
  },
  {
    id: "electrodomesticos",
    label: "Solo electrodomésticos",
    description: "Cambiar horno, placa, campana y otros.",
  },
  {
    id: "encimera",
    label: "Solo encimera",
    description: "Sustituir la encimera actual.",
  },
];

const ELEMENT_OPTIONS: StepOption[] = [
  { id: "cocina_muebles", label: "Muebles bajos y altos" },
  { id: "encimera", label: "Encimera" },
  { id: "electrodomesticos", label: "Electrodomésticos (horno, placa, campana)" },
  { id: "fregadero_griferia", label: "Fregadero y grifería" },
  { id: "alicatado_cocina", label: "Alicatado (salpicadero)" },
  { id: "fontaneria_electricidad_cocina", label: "Fontanería y electricidad" },
  { id: "demolicion_cocina", label: "Demolición y retirada de escombros" },
];

const SCOPE_DEFAULTS: Record<string, string[]> = {
  completa: ELEMENT_OPTIONS.map((o) => o.id),
  muebles: ["cocina_muebles", "encimera", "demolicion_cocina"],
  electrodomesticos: ["electrodomesticos"],
  encimera: ["encimera"],
};

function getScope(answers: Answers): string {
  const scope = answers["scope"];
  return typeof scope === "string" ? scope : "completa";
}

function getElements(answers: Answers): string[] {
  const value = answers["elements"];
  return Array.isArray(value) ? value : [];
}

function getArea(answers: Answers): number {
  const raw = answers["area"];
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

/** Metros lineales de mueble/encimera aproximados según superficie (PLACEHOLDER). */
function getMeters(area: number): number {
  return clamp(Math.round(area / 4), 2, 6);
}

export const kitchenCalculator: CalculatorDefinition = {
  id: "kitchen",
  slug: "calculadora-reforma-cocina",
  name: "Reforma de cocina",
  category: "cocina",
  shortDescription:
    "Calcula cuánto puede costar reformar tu cocina según metros, acabados y electrodomésticos.",
  icon: "kitchen",
  areaStepId: "area",
  qualityStepId: "quality",
  qualityFactors: { BASICA: 0.75, MEDIA: 1, PREMIUM: 1.5 },
  steps: [
    {
      id: "scope",
      title: "Alcance",
      question: "¿Qué quieres hacer?",
      fieldType: "single_choice",
      options: SCOPE_OPTIONS,
    },
    {
      id: "area",
      title: "Metros",
      question: "¿Cuántos metros tiene la cocina?",
      fieldType: "number",
      unit: "m²",
      min: 1,
      max: 120,
      placeholder: "P. ej. 12",
      help: "Indica la superficie de la cocina en metros cuadrados.",
    },
    qualityStep(),
    {
      id: "elements",
      title: "Elementos",
      question: "¿Qué elementos quieres cambiar?",
      fieldType: "multi_choice",
      help: "Puedes ajustar los elementos que vienen preseleccionados según tu alcance.",
      options: ELEMENT_OPTIONS,
    },
  ],
  buildLineItems(answers): LinearQuantity[] {
    const area = getArea(answers);
    const scopeSelected = getScope(answers);
    const selected =
      getElements(answers).length > 0
        ? getElements(answers)
        : (SCOPE_DEFAULTS[scopeSelected] ?? SCOPE_DEFAULTS.completa);
    const meters = getMeters(area);

    const items: LinearQuantity[] = [];
    if (selected.includes("cocina_muebles")) {
      items.push({
        label: "Muebles bajos y altos",
        subcategory: "cocina_muebles",
        unit: "ml",
        quantity: meters,
        note: "Metros lineales de muebles estimados según la superficie.",
      });
    }
    if (selected.includes("encimera")) {
      items.push({
        label: "Encimera",
        subcategory: "encimera",
        unit: "ml",
        quantity: meters,
      });
    }
    if (selected.includes("electrodomesticos")) {
      items.push({
        label: "Electrodomésticos (horno, placa, campana)",
        subcategory: "electrodomesticos",
        unit: "unidad",
        quantity: 1,
        note: "Se cuenta un conjunto básico de electrodomésticos.",
      });
    }
    if (selected.includes("fregadero_griferia")) {
      items.push({
        label: "Fregadero y grifería",
        subcategory: "fregadero_griferia",
        unit: "unidad",
        quantity: 1,
      });
    }
    if (selected.includes("alicatado_cocina")) {
      items.push({
        label: "Alicatado (salpicadero)",
        subcategory: "alicatado_cocina",
        unit: "m2",
        quantity: Math.round(area * 1.2),
        note: "Salpicadero entre encimera y muebles altos.",
      });
    }
    if (selected.includes("fontaneria_electricidad_cocina")) {
      items.push({
        label: "Fontanería y electricidad",
        subcategory: "fontaneria_electricidad_cocina",
        unit: "global",
        quantity: 1,
      });
    }
    if (selected.includes("demolicion_cocina")) {
      items.push({
        label: "Demolición y retirada de escombros",
        subcategory: "demolicion_cocina",
        unit: "global",
        quantity: 1,
      });
    }
    return items;
  },
  buildAssumptions(answers): string[] {
    const area = getArea(answers);
    const meters = getMeters(area);
    return [
      `Se estiman unos ${meters} metros lineales de muebles y encimera para una cocina de ${area} m².`,
      "Los electrodomésticos se cuentan como un conjunto de gama según la calidad elegida.",
      "No se incluyen desplazamientos ni imprevistos (tabiques con humedades, instalaciones antiguas).",
    ];
  },
  updatedAt: CATALOG_UPDATED_AT,
};