export type Quality = "BASICA" | "MEDIA" | "PREMIUM";

export type Unit = "m2" | "ml" | "unidad" | "global";

export interface PriceRange {
  min: number;
  avg: number;
  max: number;
}

export type PriceSource = "PLACEHOLDER" | "TODO" | "PROTOTYPE";

// Estructura central de precios (espejo del modelo Prisma `Price`).
export interface PriceEntry {
  category: string;
  subcategory: string;
  unit: Unit;
  minPrice: number;
  averagePrice: number;
  maxPrice: number;
  quality: Quality | "ALL";
  region: string;
  source: PriceSource;
  updatedAt: string | null; // ISO 8601 cuando exista una fecha real
}

export interface PriceCatalog {
  name: string;
  region: string;
  updatedAt: string | null;
  entries: PriceEntry[];
}

export type AnswerValue = string | number | string[];

export type Answers = Record<string, AnswerValue>;

export type StepFieldType = "single_choice" | "multi_choice" | "number";

export interface StepOption {
  id: string;
  label: string;
  description?: string;
}

export interface CalculatorStep {
  id: string;
  title: string; // etiqueta corta, p. ej. "Alcance"
  question: string;
  fieldType: StepFieldType;
  options?: StepOption[];
  // Configuración para el campo numérico.
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  help?: string;
  optional?: boolean;
}

export interface LinearQuantity {
  label: string;
  subcategory: string;
  unit: Unit;
  quantity: number;
  note?: string;
}

export interface QualityFactors {
  BASICA: number;
  MEDIA: number;
  PREMIUM: number;
}

export interface CalculatorDefinition {
  id: string;
  slug: string; // URL, p. ej. "calculadora-reforma-bano"
  name: string;
  category: string; // clave del catálogo, p. ej. "banio"
  shortDescription: string;
  icon: "bathtub" | "kitchen" | "home" | "roller";
  areaStepId: string;
  qualityStepId: string;
  qualityFactors: QualityFactors;
  steps: CalculatorStep[];
  buildLineItems: (answers: Answers) => LinearQuantity[];
  buildAssumptions: (answers: Answers) => string[];
  getDefaultElements?: (answers: Answers) => string[];
  updatedAt: string | null; // fecha oficial si existe una actualización real
}

export interface BreakdownItem extends PriceRange {
  label: string;
  subcategory: string;
  unit: Unit;
  quantity: number;
}

export interface EstimationResult {
  currency: "EUR";
  min: number;
  avg: number;
  max: number;
  perM2: PriceRange;
  area: number;
  quality: Quality;
  breakdown: BreakdownItem[];
  assumptions: string[];
  updatedAt: string | null;
  catalogVersion: string;
  catalogSource: PriceSource;
  disclaimer: string;
}

export const QUALITY_LABELS: Record<Quality, string> = {
  BASICA: "Básica",
  MEDIA: "Media",
  PREMIUM: "Premium",
};

export const DISCLAIMER_ESTIMACION =
  "Estimación orientativa generada con datos provisionales del prototipo. No es un presupuesto ni debe utilizarse para tomar decisiones económicas.";
