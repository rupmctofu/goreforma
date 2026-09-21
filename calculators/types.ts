export type Quality = "BASICA" | "MEDIA" | "PREMIUM";

export type Unit = "m2" | "ml" | "unidad" | "global";

export interface PriceRange {
  min: number;
  avg: number;
  max: number;
}

export type PriceSource = "PLACEHOLDER" | "TODO";

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
  updatedAt: string; // ISO 8601
}

export interface PriceCatalog {
  name: string;
  region: string;
  updatedAt: string;
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
  updatedAt: string; // fecha oficial de la estimación (los precios no cambian a diario)
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
  updatedAt: string;
  disclaimer: string;
}

export const QUALITY_LABELS: Record<Quality, string> = {
  BASICA: "Básica",
  MEDIA: "Media",
  PREMIUM: "Premium",
};

export const DISCLAIMER_ESTIMACION =
  "Estimación orientativa calculada con precios de referencia del mercado español. No es un presupuesto: el precio final depende del profesional, la zona y las características concretas de tu vivienda.";