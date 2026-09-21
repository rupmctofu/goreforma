// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  registerAnalyticsAdapter,
  track,
  type AnalyticsAdapter,
  type AnalyticsPayload,
  trackCalculatorCompleted,
  trackCalculatorStarted,
  trackCalculatorStepCompleted,
  trackLeadCtaClicked,
  trackLeadFormStarted,
  trackLeadSubmitted,
  trackResultViewed,
} from "@/lib/analytics";

beforeEach(() => {
  delete window.dataLayer;
});

describe("track", () => {
  it("emite un payload estructurado a dataLayer", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;

    track("calculator_started", { calculator: "bath" });

    expect(pushes).toHaveLength(1);
    const payload = pushes[0] as unknown as AnalyticsPayload;
    expect(payload.event).toBe("calculator_started");
    expect(payload.calculator).toBe("bath");
    expect(typeof payload.timestamp).toBe("string");
    expect(Date.parse(payload.timestamp)).not.toBeNaN();
  });

  it("no falla si no hay dataLayer", () => {
    expect(() => track("result_viewed", { calculator: "kitchen" })).not.toThrow();
  });

  it("reparte el payload a los adaptadores registrados", () => {
    const adapterLog: AnalyticsPayload[] = [];
    const adapter: AnalyticsAdapter = (payload) => adapterLog.push(payload);
    registerAnalyticsAdapter(adapter);

    track("lead_submitted", { calculator: "painting" });

    expect(adapterLog).toHaveLength(1);
    expect(adapterLog[0].event).toBe("lead_submitted");
    expect(adapterLog[0].calculator).toBe("painting");
  });

  it("emite el evento a GA4 cuando window.gtag está presente", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    track("calculator_completed", { calculator: "integral" });

    expect(gtag).toHaveBeenCalledWith("event", "calculator_completed", {
      calculator: "integral",
    });
  });

  it("emite el evento a Plausible cuando window.plausible está presente", () => {
    const plausible = vi.fn();
    window.plausible = plausible;

    track("result_viewed", { calculator: "bath" });

    expect(plausible).toHaveBeenCalledWith("result_viewed", {
      props: { calculator: "bath" },
    });
  });
});

describe("helpers", () => {
  it("envolver el vocabulario completo con el evento correcto", () => {
    const pushes: unknown[][] = [];
    window.dataLayer = pushes;

    trackCalculatorStarted("bath");
    trackCalculatorStepCompleted({
      calculator: "bath",
      step: "cantidad",
      stepIndex: 1,
      totalSteps: 4,
      progress: 50,
    });
    trackCalculatorCompleted("bath");
    trackResultViewed("bath");
    trackLeadCtaClicked("bath");
    trackLeadFormStarted("bath");
    trackLeadSubmitted("bath");

    const events = pushes.map((p) => (p as unknown as AnalyticsPayload).event);
    expect(events).toEqual([
      "calculator_started",
      "calculator_step_completed",
      "calculator_completed",
      "result_viewed",
      "lead_cta_clicked",
      "lead_form_started",
      "lead_submitted",
    ]);
  });
});