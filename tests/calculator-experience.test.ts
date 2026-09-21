import { describe, expect, it } from "vitest";
import {
  bathCalculator,
  kitchenCalculator,
  fullRenovationCalculator,
  paintingCalculator,
} from "../calculators/registry";
import { calculate } from "../calculators/engine";
import { validateCalculatorAnswers } from "../lib/validate-calculator";

describe("validación de dependencias", () => {
  it("rechaza pintura especial sin superficie especial indicada", () => {
    const result = validateCalculatorAnswers(paintingCalculator, {
      scope: "paredes",
      area: 90,
      quality: "MEDIA",
      elements: ["pintura_especial"],
      special_area: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.special_area).toContain("m²");
    }
  });

  it("rechaza superficie especial mayor que la superficie total", () => {
    const result = validateCalculatorAnswers(paintingCalculator, {
      scope: "paredes",
      area: 90,
      quality: "MEDIA",
      elements: ["pintura_especial"],
      special_area: 100,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.special_area).toContain("no puede ser mayor");
    }
  });

  it("permite superficie especial cuando es coherente", () => {
    const result = validateCalculatorAnswers(paintingCalculator, {
      scope: "paredes",
      area: 90,
      quality: "MEDIA",
      elements: ["pintura_especial"],
      special_area: 18,
    });

    expect(result.ok).toBe(true);
  });
});

describe("validación de rangos", () => {
  it("rechaza superficie por debajo del mínimo", () => {
    const result = validateCalculatorAnswers(bathCalculator, {
      scope: "completa",
      area: 0,
      quality: "MEDIA",
      elements: [],
    });

    expect(result.ok).toBe(false);
  });

  it("rechaza superficie por encima del máximo", () => {
    const result = validateCalculatorAnswers(bathCalculator, {
      scope: "completa",
      area: 200,
      quality: "MEDIA",
      elements: [],
    });

    expect(result.ok).toBe(false);
  });
});

describe("elementos por defecto", () => {
  it("la reforma completa de baño incluye todos los elementos por defecto", () => {
    const defaults = bathCalculator.getDefaultElements?.({ scope: "completa" }) ?? [];
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults).toContain("alicatado");
    expect(defaults).toContain("saneamiento");
  });

  it("el alcance 'solo encimera' de cocina solo incluye encimera y demolición", () => {
    const defaults = kitchenCalculator.getDefaultElements?.({ scope: "encimera" }) ?? [];
    expect(defaults).toContain("encimera");
    expect(defaults).not.toContain("electrodomesticos");
  });

  it("una reforma integral completa incluye cocina y baño por defecto", () => {
    const defaults = fullRenovationCalculator.getDefaultElements?.({ scope: "completa" }) ?? [];
    expect(defaults).toContain("cocina_completa");
    expect(defaults).toContain("banyo_completo");
  });

  it("la pintura no tiene elementos por defecto", () => {
    const defaults = paintingCalculator.getDefaultElements?.({ scope: "paredes_techos" }) ?? [];
    expect(defaults).toHaveLength(0);
  });
});

describe("coherencia de importes con lead", () => {
  it("el importe medio de la estimación coincide con el desglose", () => {
    const result = calculate(bathCalculator, {
      scope: "completa",
      area: 5,
      quality: "MEDIA",
      elements: bathCalculator.getDefaultElements?.({ scope: "completa" }) ?? [],
    });

    const sumAvg = result.breakdown.reduce((acc, item) => acc + item.avg, 0);
    expect(result.avg).toBeCloseTo(sumAvg, 2);
  });
});
