import { bathCalculator } from "./bath";
import { kitchenCalculator } from "./kitchen";
import { fullRenovationCalculator } from "./full-renovation";
import { paintingCalculator } from "./painting";
import type { CalculatorDefinition } from "./types";

export { bathCalculator, kitchenCalculator, fullRenovationCalculator, paintingCalculator };

export const calculators: CalculatorDefinition[] = [
  bathCalculator,
  kitchenCalculator,
  fullRenovationCalculator,
  paintingCalculator,
];

const byId = new Map<string, CalculatorDefinition>(
  calculators.map((c) => [c.id, c]),
);

const bySlug = new Map<string, CalculatorDefinition>(
  calculators.map((c) => [c.slug, c]),
);

export function getCalculatorById(id: string): CalculatorDefinition | undefined {
  return byId.get(id);
}

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return bySlug.get(slug);
}