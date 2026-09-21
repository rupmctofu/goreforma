import { describe, expect, it } from "vitest";
import { calculate } from "../calculators/engine";
import { paintingCalculator } from "../calculators/registry";
import { validateCalculatorAnswers } from "../lib/validate-calculator";

describe("validación server-side de calculadoras", () => {
  it("rechaza opciones que no pertenecen a la calculadora", () => {
    const result = validateCalculatorAnswers(paintingCalculator, {
      scope: "no-existe",
      area: 90,
      quality: "MEDIA",
      elements: [],
    });

    expect(result.ok).toBe(false);
  });

  it("permite omitir la superficie opcional de pintura especial", () => {
    const result = validateCalculatorAnswers(paintingCalculator, {
      scope: "paredes",
      area: 90,
      quality: "MEDIA",
      elements: [],
    });

    expect(result.ok).toBe(true);
  });
});

describe("superficies de pintura", () => {
  it("no duplica la superficie total entre paredes y techos", () => {
    const result = calculate(paintingCalculator, {
      scope: "paredes_techos",
      area: 90,
      quality: "MEDIA",
      elements: [],
    });
    const walls = result.breakdown.find((item) => item.subcategory === "pintura_paredes");
    const ceilings = result.breakdown.find((item) => item.subcategory === "pintura_techos");

    expect(walls?.quantity).toBe(45);
    expect(ceilings?.quantity).toBe(45);
  });

  it("calcula pintura especial con la superficie indicada", () => {
    const result = calculate(paintingCalculator, {
      scope: "paredes",
      area: 90,
      quality: "MEDIA",
      elements: ["pintura_especial"],
      special_area: 18,
    });
    const special = result.breakdown.find((item) => item.subcategory === "pintura_especial");

    expect(special?.quantity).toBe(18);
  });
});
