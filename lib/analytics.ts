// Capa de analítica estructurada. Todos los eventos se emiten a `window.dataLayer`
// y a los adaptadores registrados (GA4, Plausible, etc.) para no tocar componentes
// cuando se conecta un proveedor. No se recogen datos personales.

export type AnalyticsEvent =
  | "calculator_started"
  | "calculator_step_completed"
  | "calculator_completed"
  | "result_viewed"
  | "lead_cta_clicked"
  | "lead_form_started"
  | "lead_submitted";

export interface AnalyticsProps {
  calculator?: string;
  step?: string;
  stepIndex?: number;
  totalSteps?: number;
  progress?: number;
  [key: string]: string | number | boolean | undefined;
}

export type AnalyticsPayload = { event: AnalyticsEvent; timestamp: string } & AnalyticsProps;

export type AnalyticsAdapter = (payload: AnalyticsPayload) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

const adapters = new Set<AnalyticsAdapter>();
let autoAdaptersInitialized = false;

/**
 * Registra un adaptador que recibe cada payload emitido. Útil para conectar
 * GA4, Plausible u otro proveedor sin tocar los componentes.
 */
export function registerAnalyticsAdapter(adapter: AnalyticsAdapter): void {
  adapters.add(adapter);
}

/** Conecta automáticamente adaptadores de proveedores presentes en `window`. */
function initAutoAdapters(): void {
  if (autoAdaptersInitialized) return;
  autoAdaptersInitialized = true;

  registerAnalyticsAdapter((payload) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const { event, timestamp: _timestamp, ...props } = payload;
      void _timestamp;
      window.gtag("event", event, props);
    }
  });

  registerAnalyticsAdapter((payload) => {
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      const { event, timestamp: _timestamp, ...props } = payload;
      void _timestamp;
      window.plausible(event, { props });
    }
  });
}

/**
 * Emite un evento. En desarrollo y cuando no hay `dataLayer` se registra en
 * consola para poder inspeccionar el flujo.
 */
export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;

  initAutoAdapters();

  const payload: AnalyticsPayload = { event, timestamp: new Date().toISOString(), ...props };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  for (const adapter of adapters) {
    adapter(payload);
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }
}

// Helpers tipados para que los componentes no emitan eventos sueltos.

export function trackCalculatorStarted(calculator: string): void {
  track("calculator_started", { calculator });
}

export function trackCalculatorStepCompleted(input: {
  calculator: string;
  step: string;
  stepIndex: number;
  totalSteps: number;
  progress: number;
}): void {
  track("calculator_step_completed", {
    calculator: input.calculator,
    step: input.step,
    stepIndex: input.stepIndex,
    totalSteps: input.totalSteps,
    progress: input.progress,
  });
}

export function trackCalculatorCompleted(calculator: string): void {
  track("calculator_completed", { calculator });
}

export function trackResultViewed(calculator: string): void {
  track("result_viewed", { calculator });
}

export function trackLeadCtaClicked(calculator: string): void {
  track("lead_cta_clicked", { calculator });
}

export function trackLeadFormStarted(calculator: string): void {
  track("lead_form_started", { calculator });
}

export function trackLeadSubmitted(calculator: string): void {
  track("lead_submitted", { calculator });
}