import { describe, expect, it } from "vitest";
import {
  bathCalculator,
  kitchenCalculator,
  fullRenovationCalculator,
  paintingCalculator,
} from "../calculators/registry";
import { calculate, canCalculate, resolveQuality } from "../calculators/engine";
import { getPriceEntry } from "../calculators/catalog";
import type { AnswerValue, CalculatorDefinition } from "../calculators/types";

const calculators: Record<string, CalculatorDefinition> = {
  bath: bathCalculator,
  kitchen: kitchenCalculator,
  integral: fullRenovationCalculator,
  painting: paintingCalculator,
};

function completeAnswers(
  calculatorId: string,
  overrides: Record<string, AnswerValue> = {},
): Record<string, AnswerValue> {
  const base: Record<string, AnswerValue> = {};
  for (const step of calculators[calculatorId].steps) {
    if (step.fieldType === "single_choice") {
      base[step.id] = step.options?.[0]?.id ?? "";
    } else if (step.fieldType === "number") {
      base[step.id] =
        calculatorId === "bath"
          ? "5"
          : calculatorId === "kitchen"
            ? "12"
            : calculatorId === "integral"
              ? "80"
              : "90";
    } else {
      base[step.id] = step.options?.map((o) => o.id) ?? [];
    }
  }
  return { ...base, ...overrides };
}

describe("canCalculate", () => {
  it("devuelve false si falta cualquier respuesta obligatoria", () => {
    const answers = completeAnswers("bath");
    delete answers["area"];
    expect(canCalculate(bathCalculator, answers)).toBe(false);
  });

  it("devuelve false si el área es 0 o negativa", () => {
    expect(canCalculate(bathCalculator, completeAnswers("bath", { area: 0 }))).toBe(false);
    expect(canCalculate(bathCalculator, completeAnswers("bath", { area: "-3" }))).toBe(false);
  });

  it("devuelve true con respuestas completas", () => {
    expect(canCalculate(bathCalculator, completeAnswers("bath"))).toBe(true);
  });
});

describe("quality", () => {
  it.each(["BASICA", "MEDIA", "PREMIUM"])("resuelve la calidad %s", (quality) => {
    const answers = completeAnswers("bath", { quality });
    expect(resolveQuality(bathCalculator, answers)).toBe(quality);
  });
});

describe("cálculo genérico", () => {
  it.each(Object.keys(calculators))(
    "la estimación de %s es coherente (min <= avg <= max)",
    (id) => {
      const calculator = calculators[id];
      const result = calculate(calculator, completeAnswers(id));
      expect(result.min).toBeLessThanOrEqual(result.avg);
      expect(result.avg).toBeLessThanOrEqual(result.max);
      expect(result.currency).toBe("EUR");
      expect(result.disclaimer.length).toBeGreaterThan(10);
      expect(result.breakdown.length).toBeGreaterThan(0);
    },
  );

  it("la suma del desglose coincide con el total", () => {
    const result = calculate(kitchenCalculator, completeAnswers("kitchen"));
    const sum = (key: "min" | "avg" | "max") =>
      result.breakdown.reduce((acc, item) => acc + item[key], 0);
    expect(result.min).toBeCloseTo(sum("min"), 2);
    expect(result.avg).toBeCloseTo(sum("avg"), 2);
    expect(result.max).toBeCloseTo(sum("max"), 2);
  });

  it("el precio por m² es el total dividido por el área", () => {
    const answers = completeAnswers("integral", { area: 80 });
    const result = calculate(fullRenovationCalculator, answers);
    expect(result.perM2.avg / 80).toBeCloseTo(result.avg / 6400, 4);
    expect(result.perM2.avg * result.area).toBeCloseTo(result.avg, 2);
  });
});

describe("factor de calidad", () => {
  it("Premium es más caro que Media para el mismo baño", () => {
    const base = calculate(bathCalculator, completeAnswers("bath", { quality: "MEDIA" }));
    const premium = calculate(bathCalculator, completeAnswers("bath", { quality: "PREMIUM" }));
    expect(premium.min).toBeGreaterThan(base.min);
    expect(premium.max).toBeGreaterThan(base.max);
  });

  it("Básica es más barata que Media", () => {
    const base = calculate(bathCalculator, completeAnswers("bath", { quality: "MEDIA" }));
    const basica = calculate(bathCalculator, completeAnswers("bath", { quality: "BASICA" }));
    expect(basica.max).toBeLessThan(base.max);
  });
});

describe("alcance -> elementos por defecto", () => {
  it("una reforma completa de cocina incluye muebles y encimera", () => {
    const result = calculate(
      kitchenCalculator,
      completeAnswers("kitchen", { scope: "completa", elements: [] }),
    );
    const labels = result.breakdown.map((item) => item.label);
    expect(labels.join(", ")).toContain("Muebles bajos y altos");
    expect(labels.join(", ")).toContain("Encimera");
  });

  it("pintar solo techos no incluye pintura de paredes", () => {
    const result = calculate(
      paintingCalculator,
      completeAnswers("painting", { scope: "techos", elements: [] }),
    );
    const labels = result.breakdown.map((item) => item.label);
    expect(labels.join(", ")).toContain("Pintura de techos");
    expect(labels.join(", ")).not.toContain("Pintura de paredes");
  });

  it("una reforma integral completa incluye cocina y baño", () => {
    const result = calculate(
      fullRenovationCalculator,
      completeAnswers("integral", { scope: "completa", elements: [] }),
    );
    const labels = result.breakdown.map((item) => item.label);
    expect(labels.join(", ")).toContain("Cocina completa");
    expect(labels.join(", ")).toContain("Baño(s)");
  });
});

describe("catálogo", () => {
  it("cada opción de elementos existe como subcategoría del catálogo", () => {
    for (const calculator of Object.values(calculators)) {
      const elementStep = calculator.steps.find((s) => s.fieldType === "multi_choice");
      for (const option of elementStep?.options ?? []) {
        expect(getPriceEntry(calculator.category, option.id)).toBeDefined();
      }
    }
  });
});

describe("áreas y unidades", () => {
  it("el alicatado del baño se estima a partir de los m²", () => {
    const a = calculate(bathCalculator, completeAnswers("bath", { area: 5 }));
    const b = calculate(bathCalculator, completeAnswers("bath", { area: 8 }));
    const lineA = a.breakdown.find((i) => i.subcategory === "alicatado");
    const lineB = b.breakdown.find((i) => i.subcategory === "alicatado");
    expect(lineA!.quantity).toBe(16); // 5 * 3.2
    expect(lineB!.quantity).toBe(26); // 8 * 3.2
  });

  it("los metros lineales de cocina están acotados", () => {
    const small = calculate(kitchenCalculator, completeAnswers("kitchen", { area: 6 }));
    const big = calculate(kitchenCalculator, completeAnswers("kitchen", { area: 80 }));
    const qtySmall = small.breakdown.find((i) => i.subcategory === "cocina_muebles")!.quantity;
    const qtyBig = big.breakdown.find((i) => i.subcategory === "cocina_muebles")!.quantity;
    expect(qtySmall).toBe(2);
    expect(qtyBig).toBe(6);
  });
});