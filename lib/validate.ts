export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  postalCode?: string;
  projectType: string;
  estimatedBudget?: string;
  estimationId?: string;
  consentGiven: boolean;
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
  if (name !== "" && name.length < 2) errors.name = "Escribe tu nombre.";
  if (name.length > 100) errors.name = "El nombre es demasiado largo.";

  if (!isEmail(input.email)) errors.email = "Introduce un email válido.";
  if (input.email.trim().length > 254) errors.email = "El email es demasiado largo.";

  const phone = input.phone.trim();
  if (phone !== "" && !isPhone(phone)) errors.phone = "Introduce un teléfono válido.";
  if (phone.length > 30) errors.phone = "El teléfono es demasiado largo.";

  const postalCode = input.postalCode?.trim() ?? "";
  if (postalCode !== "" && !isPostalCode(postalCode))
    errors.postalCode = "El código postal debe tener 5 dígitos.";

  if (!input.projectType) errors.projectType = "Falta el tipo de proyecto.";
  if (input.projectType.trim().length > 100)
    errors.projectType = "El tipo de proyecto es demasiado largo.";
  if (!input.consentGiven) errors.consentGiven = "Debes aceptar la política de privacidad.";

  return { ok: Object.keys(errors).length === 0, errors };
}
