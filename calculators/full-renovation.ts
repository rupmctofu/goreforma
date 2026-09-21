import { CATALOG_UPDATED_AT } from "./catalog";
import { qualityStep, clamp } from "./shared";
import type {
  Answers,
  CalculatorDefinition,
  LinearQuantity,
  StepOption,
} from "./types";

export const AREA_FLOOR_FACTOR = 0.85; // superficie de suelo respecto a m² construidos (PLACEHOLDER)
export const AREA_PAINT_FACTOR = 3.0; // m² de pared/techo a pintar por m² de vivienda (PLACEHOLDER)
export const AREA_PLUMBING_FACTOR = 0.5; // zonas con instalaciones (cocina + baños) (PLACEHOLDER)

const SCOPE_OPTIONS: StepOption[] = [
  {
    id: "completa",
    label: "Reforma integral completa",
    description: "Toda la vivienda: acabados e instalaciones.",
  },
  {
    id: "acabados",
    label: "Solo acabados",
    description: "Suelos, pintura y carpintería interior.",
  },
  {
    id: "instalaciones",
    label: "Solo instalaciones",
    description: "Electricidad, fontanería y derribos.",
  },
];

const ELEMENT_OPTIONS: StepOption[] = [
  { id: "derribos", label: "Derribos de tabiquería" },
  { id: "electricidad_integral", label: "Instalación eléctrica completa" },
  { id: "fontaneria_integral", label: "Instalación de fontanería" },
  { id: "suelos", label: "Suelos nuevos" },
  { id: "pintura_integral", label: "Pintura de toda la vivienda" },
  { id: "carpinteria_interior", label: "Puertas interiores" },
  { id: "cocina_completa", label: "Cocina completa" },
  { id: "banyo_completo", label: "Baño(s) completo(s)" },
];

const SCOPE_DEFAULTS: Record<string, string[]> = {
  completa: ELEMENT_OPTIONS.map((o) => o.id),
  acabados: ["suelos", "pintura_integral", "carpinteria_interior"],
  instalaciones: ["derribos", "electricidad_integral", "fontaneria_integral"],
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
  return Number.isFinite(n) && n > 0 ? n : 80;
}

/** Nº de puertas interiores aproximado según superficie (PLACEHOLDER). */
function getDoors(area: number): number {
  return clamp(Math.round(area / 12), 2, 12);
}

export const fullRenovationCalculator: CalculatorDefinition = {
  id: "integral",
  slug: "calculadora-reforma-integral",
  name: "Reforma integral",
  category: "integral",
  shortDescription:
    "Calcula cuánto puede costar reformar una vivienda por completo según metros y acabados.",
  icon: "home",
  areaStepId: "area",
  qualityStepId: "quality",
  qualityFactors: { BASICA: 0.8, MEDIA: 1, PREMIUM: 1.45 },
  steps: [
    {
      id: "scope",
      title: "Alcance",
      question: "¿Qué tipo de reforma te planteas?",
      fieldType: "single_choice",
      options: SCOPE_OPTIONS,
    },
    {
      id: "area",
      title: "Metros",
      question: "¿Cuántos metros tiene la vivienda?",
      fieldType: "number",
      unit: "m²",
      min: 20,
      max: 500,
      placeholder: "P. ej. 80",
      help: "Indica los metros cuadrados construidos de la vivienda.",
    },
    qualityStep(),
    {
      id: "elements",
      title: "Elementos",
      question: "¿Qué elementos quieres incluir?",
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
    const doors = getDoors(area);
    const bathrooms = area > 100 ? 2 : 1;

    const items: LinearQuantity[] = [];
    if (selected.includes("derribos")) {
      items.push({
        label: "Derribos de tabiquería",
        subcategory: "derribos",
        unit: "m2",
        quantity: Math.round(area * 0.6),
        note: "Superficie estimada de tabiques a eliminar.",
      });
    }
    if (selected.includes("electricidad_integral")) {
      items.push({
        label: "Instalación eléctrica completa",
        subcategory: "electricidad_integral",
        unit: "m2",
        quantity: area,
        note: "Precio por m² de vivienda, incluye puntos de luz y enchufes.",
      });
    }
    if (selected.includes("fontaneria_integral")) {
      items.push({
        label: "Instalación de fontanería",
        subcategory: "fontaneria_integral",
        unit: "m2",
        quantity: Math.round(area * AREA_PLUMBING_FACTOR),
        note: "Zonas con instalaciones (cocina y baños).",
      });
    }
    if (selected.includes("suelos")) {
      items.push({
        label: "Suelos nuevos",
        subcategory: "suelos",
        unit: "m2",
        quantity: Math.round(area * AREA_FLOOR_FACTOR),
      });
    }
    if (selected.includes("pintura_integral")) {
      items.push({
        label: "Pintura de toda la vivienda",
        subcategory: "pintura_integral",
        unit: "m2",
        quantity: Math.round(area * AREA_PAINT_FACTOR),
        note: "Paredes y techos.",
      });
    }
    if (selected.includes("carpinteria_interior")) {
      items.push({
        label: `Puertas interiores (${doors})`,
        subcategory: "carpinteria_interior",
        unit: "unidad",
        quantity: doors,
        note: "Número estimado según la superficie de la vivienda.",
      });
    }
    if (selected.includes("cocina_completa")) {
      items.push({
        label: "Cocina completa",
        subcategory: "cocina_completa",
        unit: "global",
        quantity: 1,
      });
    }
    if (selected.includes("banyo_completo")) {
      items.push({
        label: `Baño(s) completo(s) (${bathrooms})`,
        subcategory: "banyo_completo",
        unit: "global",
        quantity: bathrooms,
        note: "Número estimado según la superficie de la vivienda.",
      });
    }
    return items;
  },
  buildAssumptions(answers): string[] {
    const area = getArea(answers);
    const doors = getDoors(area);
    const bathrooms = area > 100 ? 2 : 1;
    return [
      `Se estiman ${doors} puertas interiores y ${bathrooms} baño(s) para una vivienda de ${area} m².`,
      "La instalación eléctrica se calcula por m² e incluye puntos de luz, enchufes y cuadro.",
      "No se incluyen muebles a medida, climatización ni imprevistos estructurales.",
    ];
  },
  updatedAt: CATALOG_UPDATED_AT,
};