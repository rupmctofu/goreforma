import { CATALOG_UPDATED_AT } from "./catalog";
import { qualityStep } from "./shared";
import type {
  Answers,
  CalculatorDefinition,
  LinearQuantity,
  StepOption,
} from "./types";

export const BATH_AREAS_M2_CUT = 3.2; // m² de pared a alicatar aprox. por m² de baño (PLACEHOLDER)

const SCOPE_OPTIONS: StepOption[] = [
  {
    id: "completa",
    label: "Reforma completa",
    description: "Todo el baño de arriba a abajo: acabados e instalaciones.",
  },
  {
    id: "suelo_azulejo",
    label: "Suelo y azulejos",
    description: "Renovar los revestimientos del baño.",
  },
  {
    id: "sanitarios",
    label: "Sanitarios y ducha",
    description: "Cambiar inodoro, lavabo y plato de ducha.",
  },
  {
    id: "mueble",
    label: "Mueble y accesorios",
    description: "Renovar el mueble, la grifería y el espejo.",
  },
];

const ELEMENT_OPTIONS: StepOption[] = [
  { id: "alicatado", label: "Alicatado de paredes" },
  { id: "suelo_banio", label: "Suelo nuevo" },
  { id: "saneamiento", label: "Inodoro y lavabo" },
  { id: "plato_ducha", label: "Plato de ducha" },
  { id: "mueble_bano", label: "Mueble de baño" },
  { id: "griferia", label: "Grifería" },
  { id: "fontaneria_banio", label: "Red de fontanería (puntos de agua)" },
  { id: "electricidad_banio", label: "Electricidad e iluminación" },
  { id: "demolicion_banio", label: "Demolición y retirada de escombros" },
];

const SCOPE_DEFAULTS: Record<string, string[]> = {
  completa: ELEMENT_OPTIONS.map((o) => o.id),
  suelo_azulejo: ["alicatado", "suelo_banio", "demolicion_banio"],
  sanitarios: ["saneamiento", "plato_ducha", "fontaneria_banio"],
  mueble: ["mueble_bano", "griferia"],
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
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export const bathCalculator: CalculatorDefinition = {
  id: "bath",
  slug: "calculadora-reforma-bano",
  name: "Reforma de baño",
  category: "banio",
  shortDescription:
    "Calcula cuánto puede costar reformar tu baño según metros, calidad y elementos a cambiar.",
  icon: "bathtub",
  areaStepId: "area",
  qualityStepId: "quality",
  qualityFactors: { BASICA: 0.75, MEDIA: 1, PREMIUM: 1.55 },
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
      question: "¿Cuántos metros tiene el baño?",
      fieldType: "number",
      unit: "m²",
      min: 1,
      max: 60,
      placeholder: "P. ej. 5",
      help: "Indica la superficie del baño en metros cuadrados.",
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

    const items: LinearQuantity[] = [];
    if (selected.includes("alicatado")) {
      items.push({
        label: "Alicatado de paredes",
        subcategory: "alicatado",
        unit: "m2",
        quantity: Math.round(area * BATH_AREAS_M2_CUT),
        note: "Superficie estimada de paredes a alicatar.",
      });
    }
    if (selected.includes("suelo_banio")) {
      items.push({
        label: "Suelo nuevo",
        subcategory: "suelo_banio",
        unit: "m2",
        quantity: area,
      });
    }
    if (selected.includes("saneamiento")) {
      items.push({
        label: "Inodoro y lavabo",
        subcategory: "saneamiento",
        unit: "unidad",
        quantity: 1,
      });
    }
    if (selected.includes("plato_ducha")) {
      items.push({
        label: "Plato de ducha",
        subcategory: "plato_ducha",
        unit: "unidad",
        quantity: 1,
      });
    }
    if (selected.includes("mueble_bano")) {
      items.push({
        label: "Mueble de baño",
        subcategory: "mueble_bano",
        unit: "unidad",
        quantity: 1,
      });
    }
    if (selected.includes("griferia")) {
      items.push({
        label: "Grifería",
        subcategory: "griferia",
        unit: "unidad",
        quantity: 2, // lavabo + ducha
      });
    }
    if (selected.includes("fontaneria_banio")) {
      items.push({
        label: "Red de fontanería (puntos de agua)",
        subcategory: "fontaneria_banio",
        unit: "global",
        quantity: 1,
      });
    }
    if (selected.includes("electricidad_banio")) {
      items.push({
        label: "Electricidad e iluminación",
        subcategory: "electricidad_banio",
        unit: "global",
        quantity: 1,
      });
    }
    if (selected.includes("demolicion_banio")) {
      items.push({
        label: "Demolición y retirada de escombros",
        subcategory: "demolicion_banio",
        unit: "global",
        quantity: 1,
      });
    }
    return items;
  },
  buildAssumptions(answers): string[] {
    const area = getArea(answers);
    return [
      `Superficie de paredes a alicatar estimada en unos ${Math.round(area * BATH_AREAS_M2_CUT)} m² (baño de ${area} m²).`,
      "Los precios de temperatura, plato de ducha y grifería incluyen instalación.",
      "No se incluyen desplazamientos ni problemas imprevistos (humedades, tuberías en mal estado).",
    ];
  },
  updatedAt: CATALOG_UPDATED_AT,
};