import type { PriceCatalog, PriceEntry, Unit } from "./types";

// ---------------------------------------------------------------------------
// CATÁLOGO CENTRAL DE PRECIOS
// ---------------------------------------------------------------------------
// Todas las cifras de este fichero son PLACEHOLDER/TODO: sirven para construir
// y probar el flujo del producto, pero NO proceden de fuentes reales de
// mercado. Cada entrada marca `source: "PLACEHOLDER"`.
//
// Cuando se disponga de datos reales, se sustituyen estos valores manteniendo
// la misma estructura (espejo del modelo Prisma `Price`) y se rellena el campo
// `updatedAt` con la fecha real de la actualización.
// ---------------------------------------------------------------------------

export const CATALOG_UPDATED_AT = "2026-09-21";

const REGION = "nacional";

type EntryInput = {
  subcategory: string;
  unit: Unit;
  min: number;
  avg: number;
  max: number;
};

function entry(category: string, input: EntryInput): PriceEntry {
  return {
    category,
    subcategory: input.subcategory,
    unit: input.unit,
    minPrice: input.min,
    averagePrice: input.avg,
    maxPrice: input.max,
    quality: "MEDIA",
    region: REGION,
    source: "PLACEHOLDER",
    updatedAt: CATALOG_UPDATED_AT,
  };
}

export const priceCatalog: PriceCatalog = {
  name: "Catálogo de precios de referencia (PLACEHOLDER)",
  region: REGION,
  updatedAt: CATALOG_UPDATED_AT,
  entries: [
    // ----------------------------- BAÑO ----------------------------------
    entry("banio", { subcategory: "alicatado", unit: "m2", min: 35, avg: 60, max: 90 }),
    entry("banio", { subcategory: "suelo_banio", unit: "m2", min: 30, avg: 55, max: 85 }),
    entry("banio", { subcategory: "saneamiento", unit: "unidad", min: 250, avg: 450, max: 750 }),
    entry("banio", { subcategory: "plato_ducha", unit: "unidad", min: 500, avg: 900, max: 1500 }),
    entry("banio", { subcategory: "mueble_bano", unit: "unidad", min: 350, avg: 700, max: 1400 }),
    entry("banio", { subcategory: "griferia", unit: "unidad", min: 130, avg: 250, max: 450 }),
    entry("banio", { subcategory: "fontaneria_banio", unit: "global", min: 400, avg: 700, max: 1100 }),
    entry("banio", { subcategory: "electricidad_banio", unit: "global", min: 250, avg: 400, max: 650 }),
    entry("banio", { subcategory: "demolicion_banio", unit: "global", min: 300, avg: 500, max: 800 }),

    // ----------------------------- COCINA --------------------------------
    entry("cocina", { subcategory: "cocina_muebles", unit: "ml", min: 380, avg: 650, max: 1200 }),
    entry("cocina", { subcategory: "encimera", unit: "ml", min: 120, avg: 240, max: 450 }),
    entry("cocina", { subcategory: "electrodomesticos", unit: "unidad", min: 1800, avg: 3200, max: 6000 }),
    entry("cocina", { subcategory: "fregadero_griferia", unit: "unidad", min: 200, avg: 380, max: 750 }),
    entry("cocina", { subcategory: "alicatado_cocina", unit: "m2", min: 35, avg: 60, max: 90 }),
    entry("cocina", { subcategory: "fontaneria_electricidad_cocina", unit: "global", min: 500, avg: 800, max: 1400 }),
    entry("cocina", { subcategory: "demolicion_cocina", unit: "global", min: 400, avg: 600, max: 1000 }),

    // ------------------------- REFORMA INTEGRAL ---------------------------
    entry("integral", { subcategory: "derribos", unit: "m2", min: 10, avg: 18, max: 30 }),
    entry("integral", { subcategory: "electricidad_integral", unit: "m2", min: 20, avg: 32, max: 55 }),
    entry("integral", { subcategory: "fontaneria_integral", unit: "m2", min: 12, avg: 20, max: 35 }),
    entry("integral", { subcategory: "suelos", unit: "m2", min: 25, avg: 45, max: 80 }),
    entry("integral", { subcategory: "pintura_integral", unit: "m2", min: 6, avg: 9, max: 15 }),
    entry("integral", { subcategory: "carpinteria_interior", unit: "unidad", min: 180, avg: 280, max: 450 }),
    entry("integral", { subcategory: "cocina_completa", unit: "global", min: 6500, avg: 10000, max: 16000 }),
    entry("integral", { subcategory: "banyo_completo", unit: "global", min: 4500, avg: 7000, max: 11000 }),

    // ----------------------------- PINTURA -------------------------------
    entry("pintura", { subcategory: "pintura_paredes", unit: "m2", min: 7, avg: 10, max: 16 }),
    entry("pintura", { subcategory: "pintura_techos", unit: "m2", min: 8, avg: 11, max: 17 }),
    entry("pintura", { subcategory: "imprimacion", unit: "m2", min: 2.5, avg: 3.5, max: 6 }),
    entry("pintura", { subcategory: "preparacion_superficie", unit: "m2", min: 4, avg: 6, max: 10 }),
    entry("pintura", { subcategory: "pintura_especial", unit: "m2", min: 10, avg: 15, max: 28 }),
  ],
};

// ---------------------------------------------------------------------------
// Acceso al catálogo
// ---------------------------------------------------------------------------

const entryIndex = new Map<string, PriceEntry>(
  priceCatalog.entries.map((e) => [`${e.category}:${e.subcategory}`, e]),
);

export function getPriceEntry(
  category: string,
  subcategory: string,
): PriceEntry | undefined {
  return entryIndex.get(`${category}:${subcategory}`);
}

export function getCategoryEntries(category: string): PriceEntry[] {
  return priceCatalog.entries.filter((e) => e.category === category);
}