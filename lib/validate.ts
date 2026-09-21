export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  postalCode?: string;
  projectType: string;
  estimatedBudget: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof LeadInput, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{9,15}$/;
const POSTAL_CODE_RE = /^\d{5}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

export function isPostalCode(value: string): boolean {
  return POSTAL_CODE_RE.test(value.trim());
}

export function validateLead(input: LeadInput): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const name = input.name.trim();
  if (name.length < 2) errors.name = "Escribe tu nombre.";

  if (!isEmail(input.email)) errors.email = "Introduce un email válido.";

  if (!isPhone(input.phone))
    errors.phone = "Introduce un teléfono válido.";

  const postalCode = input.postalCode?.trim() ?? "";
  if (postalCode !== "" && !isPostalCode(postalCode))
    errors.postalCode = "El código postal debe tener 5 dígitos.";

  if (!input.projectType) errors.projectType = "Falta el tipo de proyecto.";

  return { ok: Object.keys(errors).length === 0, errors };
}