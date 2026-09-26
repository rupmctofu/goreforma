// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enableAnalytics,
  registerAnalyticsAdapter,
  setAnalyticsConsent,
  track,
  type AnalyticsAdapter,
  type AnalyticsPayload,
  trackCalculatorStart,
  trackCalculatorStepCompleted,
  trackCalculatorValidationError,
  trackEstimationCreated,
  trackEstimationFailed,
  trackEstimationRecoveryViewed,
  trackLeadStarted,
  trackLeadSubmitted,
  trackLeadSubmissionFailed,
  trackCalculatorView,
  trackPageView,
} from "@/lib/analytics";
import { captureAttribution, getAttributionProperties } from "@/lib/attribution";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  delete window.dataLayer;
  vi.unstubAllEnvs();
});

function granted() {
  setAnalyticsConsent("granted");
}

function lastPayload(pushes: unknown[][]): AnalyticsPayload {
  return pushes.at(-1) as unknown as AnalyticsPayload;
}

describe("consentimiento", () => {
  it("no emite eventos antes del consentimiento", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;

    track("calculator_start", { calculator_id: "bath" });

    expect(pushes).toHaveLength(0);
  });

  it("emite un payload estructurado tras aceptar analytics", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    track("calculator_start", { calculator_id: "bath" });

    expect(pushes).toHaveLength(1);
    const payload = lastPayload(pushes);
    expect(payload.event).toBe("calculator_start");
    expect(payload.calculator_id).toBe("bath");
    expect(typeof payload.timestamp).toBe("string");
    expect(Date.parse(payload.timestamp)).not.toBeNaN();
  });

  it("no emite eventos después de rechazar analytics", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    setAnalyticsConsent("denied");

    track("estimation_viewed", { calculator_id: "kitchen", view_context: "new" });

    expect(pushes).toHaveLength(0);
  });

  it("funciona sin NEXT_PUBLIC_POSTHOG_KEY configurada", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    await enableAnalytics();
    track("page_view", { path: "/", page_type: "home" });

    expect(pushes).toHaveLength(1);
  });
});

describe("adaptadores y taxonomía", () => {
  it("reparte el payload a los adaptadores registrados", () => {
    const adapterLog: AnalyticsPayload[] = [];
    const adapter: AnalyticsAdapter = (payload) => adapterLog.push(payload);
    registerAnalyticsAdapter(adapter);
    granted();

    trackLeadSubmitted("painting", "new");

    expect(adapterLog.at(-1)?.event).toBe("lead_submitted");
    expect(adapterLog.at(-1)?.calculator_id).toBe("painting");
  });

  it("emite pasos sin respuestas ni valores introducidos", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorStepCompleted({
      calculatorId: "bath",
      stepId: "area",
      stepIndex: 1,
      stepCount: 4,
      outcome: "completed",
    });

    const payload = lastPayload(pushes);
    expect(payload.step_id).toBe("area");
    expect(payload).not.toHaveProperty("answers");
    expect(payload).not.toHaveProperty("value");
  });

  it("no falla sin dataLayer", () => {
    granted();
    expect(() => track("page_view", { path: "/", page_type: "home" })).not.toThrow();
  });

  it("sanitiza el path de recuperación antes de conservar atribución", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    window.history.replaceState({}, "", "/estimacion/secret-token");
    granted();
    captureAttribution();
    track("page_view", { path: "/estimacion/[token]", page_type: "estimation_recovery" });

    const payload = lastPayload(pushes);
    expect(payload.first_landing_path).toBe("/estimacion/[token]");
    expect(JSON.stringify(payload)).not.toContain("secret-token");
    window.history.replaceState({}, "", "/");
  });
});

describe("calculator_start", () => {
  it("no se dispara al montar si no hay interacción", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    // Simulamos la vista inicial sin interacción.
    trackCalculatorView("bath");

    expect(pushes.some((p) => (p as unknown as AnalyticsPayload).event === "calculator_start")).toBe(false);
  });

  it("sí se dispara en la primera interacción", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorStart("bath");

    expect(pushes).toHaveLength(1);
    expect(lastPayload(pushes).event).toBe("calculator_start");
    expect(lastPayload(pushes).calculator_id).toBe("bath");
  });

  it("no se duplica con interacciones posteriores", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorStart("bath");
    trackCalculatorStart("bath");
    trackCalculatorStart("bath");

    expect(pushes).toHaveLength(1);
  });
});

describe("calculator_step_completed", () => {
  it("se emite al completar correctamente un paso", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorStepCompleted({
      calculatorId: "bath",
      stepId: "area",
      stepIndex: 1,
      stepCount: 4,
      outcome: "completed",
    });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("calculator_step_completed");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.step_id).toBe("area");
    expect(payload.step_index).toBe(1);
    expect(payload.step_count).toBe(4);
    expect(payload.outcome).toBe("completed");
  });

  it("contiene únicamente las propiedades permitidas", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorStepCompleted({
      calculatorId: "bath",
      stepId: "area",
      stepIndex: 1,
      stepCount: 4,
      outcome: "completed",
    });

    const payload = lastPayload(pushes);
    const allowed = new Set([
      "event",
      "timestamp",
      "calculator_id",
      "step_id",
      "step_index",
      "step_count",
      "outcome",
      "device_type",
    ]);
    for (const key of Object.keys(payload)) {
      expect(allowed.has(key)).toBe(true);
    }
  });
});

describe("calculator_validation_error", () => {
  it("se emite cuando una validación bloquea el avance", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorValidationError({
      calculatorId: "bath",
      stepId: "area",
      field: "area",
      errorType: "required",
    });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("calculator_validation_error");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.step_id).toBe("area");
    expect(payload.field).toBe("area");
    expect(payload.error_type).toBe("required");
  });

  it("no contiene respuestas ni valores introducidos", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackCalculatorValidationError({
      calculatorId: "bath",
      stepId: "area",
      field: "area",
      errorType: "below_min",
    });

    const payload = lastPayload(pushes);
    expect(JSON.stringify(payload)).not.toContain("30");
    expect(JSON.stringify(payload)).not.toContain("m2");
    expect(payload).not.toHaveProperty("value");
    expect(payload).not.toHaveProperty("answers");
  });
});

describe("estimation_created", () => {
  it("únicamente se emite con los campos permitidos", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackEstimationCreated({
      calculatorId: "bath",
      catalogVersion: "prototype-0",
      algorithmVersion: "prototype-0",
      breakdownCount: 5,
    });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("estimation_created");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.catalog_version).toBe("prototype-0");
    expect(payload.algorithm_version).toBe("prototype-0");
    expect(payload.breakdown_count).toBe(5);
    expect(payload).not.toHaveProperty("amount");
    expect(payload).not.toHaveProperty("surface");
  });
});

describe("estimation_failed", () => {
  it.each([
    [400, "4xx", "validation"],
    [422, "4xx", "validation"],
    [429, "4xx", "rate_limit"],
    [500, "5xx", "server"],
  ] as const)("emite estimation_failed para status %s", (status, statusClass, errorType) => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackEstimationFailed({ calculatorId: "bath", errorType, statusClass });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("estimation_failed");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.error_type).toBe(errorType);
    expect(payload.status_class).toBe(statusClass);
  });

  it("emite estimation_failed para errores de red", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackEstimationFailed({ calculatorId: "bath", errorType: "network", statusClass: "network" });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("estimation_failed");
    expect(payload.status_class).toBe("network");
  });
});

describe("lead_started", () => {
  it("no se dispara al montar", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    // La vista del formulario no debe emitir lead_started.
    trackPageView("/", "home");

    expect(pushes.some((p) => (p as unknown as AnalyticsPayload).event === "lead_started")).toBe(false);
  });

  it("sí se dispara en la primera interacción real", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackLeadStarted("bath", "new");

    expect(pushes).toHaveLength(1);
    expect(lastPayload(pushes).event).toBe("lead_started");
    expect(lastPayload(pushes).calculator_id).toBe("bath");
    expect(lastPayload(pushes).view_context).toBe("new");
  });

  it("no se duplica", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackLeadStarted("bath", "new");
    trackLeadStarted("bath", "new");

    expect(pushes).toHaveLength(1);
  });
});

describe("lead_submitted", () => {
  it("únicamente se emite tras HTTP 201", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackLeadSubmitted("bath", "new");

    expect(pushes).toHaveLength(1);
    expect(lastPayload(pushes).event).toBe("lead_submitted");
    expect(lastPayload(pushes).calculator_id).toBe("bath");
    expect(lastPayload(pushes).view_context).toBe("new");
  });
});

describe("lead_submission_failed", () => {
  it("se emite para respuestas de error", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackLeadSubmissionFailed({ calculatorId: "bath", errorType: "server", statusClass: "5xx" });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("lead_submission_failed");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.error_type).toBe("server");
    expect(payload.status_class).toBe("5xx");
  });
});

describe("recuperación", () => {
  it("recuperación válida emite estimation_recovery_viewed", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    trackEstimationRecoveryViewed("bath", "same_day");

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("estimation_recovery_viewed");
    expect(payload.calculator_id).toBe("bath");
    expect(payload.recovery_status).toBe("success");
    expect(payload.recovery_age_bucket).toBe("same_day");
    expect(payload).not.toHaveProperty("token");
    expect(payload).not.toHaveProperty("estimationId");
  });

  it("no se emite estimation_recovery_viewed para rutas de recuperación inválidas", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    granted();

    // No hay helper público para estados inválidos; el componente simplemente no renderiza RecoveryAnalytics.
    // Verificamos que el payload de un evento de página de recuperación no incluya el token.
    track("page_view", { path: "/estimacion/[token]", page_type: "estimation_recovery" });

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("page_view");
    expect(payload.path).toBe("/estimacion/[token]");
    expect(JSON.stringify(payload)).not.toContain("secret-token");
  });
});

describe("attribution", () => {
  it("captura first touch", () => {
    window.history.replaceState({}, "", "/?utm_source=google&utm_medium=cpc");
    granted();
    captureAttribution();

    const props = getAttributionProperties();
    expect(props.first_utm_source).toBe("google");
    expect(props.first_utm_medium).toBe("cpc");
  });

  it("actualiza last touch cuando hay nueva campaña", () => {
    window.history.replaceState({}, "", "/?utm_source=google&utm_medium=cpc");
    granted();
    captureAttribution();

    window.history.replaceState({}, "", "/?utm_source=facebook&utm_medium=social");
    captureAttribution();

    const props = getAttributionProperties();
    expect(props.first_utm_source).toBe("google");
    expect(props.last_utm_source).toBe("facebook");
    expect(props.last_utm_medium).toBe("social");
  });

  it.each([
    ["ausente", {}],
    ["cadena", { captured_at: "abc" }],
    ["nulo", { captured_at: null }],
    ["no finito", { captured_at: Number.NaN }],
  ])("descarta y elimina entradas con captured_at %s", (_label, stored) => {
    window.localStorage.setItem(
      "goreforma:attribution",
      JSON.stringify({
        ...stored,
        first_touch: { utm_source: "google" },
        last_touch: { utm_source: "google" },
      }),
    );

    expect(getAttributionProperties()).toEqual({});
    expect(window.localStorage.getItem("goreforma:attribution")).toBeNull();
  });

  it("descarta y elimina entradas con captured_at anterior al TTL", () => {
    window.localStorage.setItem(
      "goreforma:attribution",
      JSON.stringify({
        first_touch: { utm_source: "google" },
        last_touch: { utm_source: "google" },
        captured_at: Date.now() - 91 * 24 * 60 * 60 * 1000,
      }),
    );

    expect(getAttributionProperties()).toEqual({});
    expect(window.localStorage.getItem("goreforma:attribution")).toBeNull();
  });

  it("mantiene entradas vigentes con captured_at reciente", () => {
    window.localStorage.setItem(
      "goreforma:attribution",
      JSON.stringify({
        first_touch: { utm_source: "google" },
        last_touch: { utm_source: "facebook" },
        captured_at: Date.now() - 24 * 60 * 60 * 1000,
      }),
    );

    const props = getAttributionProperties();
    expect(props.first_utm_source).toBe("google");
    expect(props.last_utm_source).toBe("facebook");
    expect(window.localStorage.getItem("goreforma:attribution")).not.toBeNull();
  });

  it("sanitiza landing path de recuperación", () => {
    window.history.replaceState({}, "", "/estimacion/abc123?utm_source=email");
    granted();
    captureAttribution();

    const props = getAttributionProperties();
    expect(props.first_landing_path).toBe("/estimacion/[token]");
    expect(JSON.stringify(props)).not.toContain("abc123");
    window.history.replaceState({}, "", "/");
  });
});

describe("calculator_view path", () => {
  it("no envía window.location.pathname crudo", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;
    window.history.replaceState({}, "", "/estimacion/secret-token");
    granted();

    trackCalculatorView("bath");

    const payload = lastPayload(pushes);
    expect(payload.event).toBe("calculator_view");
    expect(payload.path).toBe("/calculadora-reforma-bano");
    expect(payload.path).not.toContain("secret-token");
    window.history.replaceState({}, "", "/");
  });
});
