import { getCalculatorById, calculators } from "@/calculators/registry";
import { getAttributionProperties } from "./attribution";

export type AnalyticsConsent = "unknown" | "granted" | "denied";

export type AnalyticsEvent =
  | "page_view"
  | "calculator_view"
  | "calculator_start"
  | "calculator_step_completed"
  | "calculator_validation_error"
  | "estimation_created"
  | "estimation_viewed"
  | "estimation_recovery_viewed"
  | "estimation_failed"
  | "lead_started"
  | "lead_submitted"
  | "lead_submission_failed";

export interface AnalyticsProps {
  calculator_id?: string;
  step_id?: string;
  step_index?: number;
  step_count?: number;
  outcome?: "completed" | "skipped";
  field?: string;
  error_type?: string;
  status_class?: "2xx" | "4xx" | "5xx" | "network";
  view_context?: "new" | "recovery";
  recovery_status?: "success";
  recovery_age_bucket?: "same_day" | "1_7_days" | "8_30_days" | "31_90_days";
  catalog_version?: string;
  algorithm_version?: string;
  breakdown_count?: number;
  path?: string;
  page_type?: string;
  device_type?: "mobile" | "tablet" | "desktop";
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_term?: string;
  first_landing_path?: string;
  first_referrer_host?: string;
  last_utm_source?: string;
  last_utm_medium?: string;
  last_utm_campaign?: string;
  last_utm_content?: string;
  last_utm_term?: string;
  last_landing_path?: string;
  last_referrer_host?: string;
}

export type AnalyticsPayload = {
  event: AnalyticsEvent;
  timestamp: string;
} & AnalyticsProps;

export type AnalyticsAdapter = (payload: AnalyticsPayload) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const CONSENT_KEY = "goreforma:analytics-consent";
const adapters = new Set<AnalyticsAdapter>();
let posthogClient: typeof import("posthog-js").default | null = null;
let posthogInitPromise: Promise<void> | null = null;
let posthogAdapterRegistered = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (!isBrowser()) return "unknown";
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unknown">): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(CONSENT_KEY, consent);
  window.dispatchEvent(new Event("goreforma:analytics-consent"));
  if (consent === "granted") void enableAnalytics();
}

export function onAnalyticsConsentChange(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  window.addEventListener("goreforma:analytics-consent", listener);
  return () => window.removeEventListener("goreforma:analytics-consent", listener);
}

export async function enableAnalytics(): Promise<void> {
  if (!isBrowser() || getAnalyticsConsent() !== "granted") return;
  if (posthogInitPromise) return posthogInitPromise;

  posthogInitPromise = (async () => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const { default: posthog } = await import("posthog-js");
    posthogClient = posthog;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      persistence: "memory",
      respect_dnt: true,
    });

    if (!posthogAdapterRegistered) {
      posthogAdapterRegistered = true;
      registerAnalyticsAdapter((payload) => {
        const { event, timestamp, ...properties } = payload; // PostHog stamps its own.
        posthogClient?.capture(event, properties);
      });
    }
  })().catch(() => {
    posthogInitPromise = null;
  });

  return posthogInitPromise;
}

export function registerAnalyticsAdapter(adapter: AnalyticsAdapter): void {
  adapters.add(adapter);
}

function getDeviceType(): AnalyticsProps["device_type"] {
  if (!isBrowser()) return undefined;
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (!isBrowser() || getAnalyticsConsent() !== "granted") return;

  const payload: AnalyticsPayload = {
    event,
    timestamp: new Date().toISOString(),
    device_type: getDeviceType(),
    ...getAttributionProperties(),
    ...props,
  };

  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  for (const adapter of adapters) adapter(payload);

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }
}

export function trackPageView(path: string, pageType: string): void {
  track("page_view", { path, page_type: pageType });
}

const CALCULATOR_SLUGS = new Set(calculators.map((c) => c.slug));

export function trackCalculatorView(calculatorId: string): void {
  const slug = getCalculatorById(calculatorId)?.slug;
  const path = slug && CALCULATOR_SLUGS.has(slug) ? `/${slug}` : "/calculadora";
  track("calculator_view", { calculator_id: calculatorId, path });
}

export function trackCalculatorStart(calculatorId: string): void {
  if (!isBrowser()) return;
  const key = `goreforma:analytics:calculator-started:${calculatorId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  track("calculator_start", { calculator_id: calculatorId });
}

export function trackCalculatorStepCompleted(input: {
  calculatorId: string;
  stepId: string;
  stepIndex: number;
  stepCount: number;
  outcome: "completed" | "skipped";
}): void {
  track("calculator_step_completed", {
    calculator_id: input.calculatorId,
    step_id: input.stepId,
    step_index: input.stepIndex,
    step_count: input.stepCount,
    outcome: input.outcome,
  });
}

export function trackCalculatorValidationError(input: {
  calculatorId: string;
  stepId: string;
  field: string;
  errorType: string;
}): void {
  track("calculator_validation_error", {
    calculator_id: input.calculatorId,
    step_id: input.stepId,
    field: input.field,
    error_type: input.errorType,
  });
}

export function trackEstimationCreated(input: {
  calculatorId: string;
  catalogVersion: string;
  algorithmVersion: string;
  breakdownCount: number;
}): void {
  track("estimation_created", {
    calculator_id: input.calculatorId,
    catalog_version: input.catalogVersion,
    algorithm_version: input.algorithmVersion,
    breakdown_count: input.breakdownCount,
  });
}

export function trackEstimationViewed(calculatorId: string, viewContext: "new" | "recovery"): void {
  track("estimation_viewed", { calculator_id: calculatorId, view_context: viewContext });
}

export function trackEstimationRecoveryViewed(
  calculatorId: string,
  ageBucket: NonNullable<AnalyticsProps["recovery_age_bucket"]>,
): void {
  track("estimation_recovery_viewed", {
    calculator_id: calculatorId,
    recovery_status: "success",
    recovery_age_bucket: ageBucket,
    view_context: "recovery",
  });
}

export function trackEstimationFailed(input: {
  calculatorId: string;
  errorType: string;
  statusClass: AnalyticsProps["status_class"];
}): void {
  track("estimation_failed", {
    calculator_id: input.calculatorId,
    error_type: input.errorType,
    status_class: input.statusClass,
  });
}

export function trackLeadStarted(calculatorId: string, viewContext: "new" | "recovery"): void {
  if (!isBrowser()) return;
  const key = `goreforma:analytics:lead-started:${calculatorId}:${viewContext}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  track("lead_started", { calculator_id: calculatorId, view_context: viewContext });
}

export function trackLeadSubmitted(calculatorId: string, viewContext: "new" | "recovery"): void {
  track("lead_submitted", { calculator_id: calculatorId, view_context: viewContext });
}

export function trackLeadSubmissionFailed(input: {
  calculatorId: string;
  errorType: string;
  statusClass: AnalyticsProps["status_class"];
}): void {
  track("lead_submission_failed", {
    calculator_id: input.calculatorId,
    error_type: input.errorType,
    status_class: input.statusClass,
  });
}
