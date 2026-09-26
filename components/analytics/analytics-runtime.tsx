"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  enableAnalytics,
  getAnalyticsConsent,
  onAnalyticsConsentChange,
  setAnalyticsConsent,
  trackPageView,
} from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

function sanitizePath(pathname: string): { path: string; pageType: string } {
  if (pathname.startsWith("/estimacion/")) {
    return { path: "/estimacion/[token]", pageType: "estimation_recovery" };
  }
  if (pathname.startsWith("/calculadora-")) {
    return { path: pathname, pageType: "calculator" };
  }
  return { path: pathname, pageType: pathname === "/" ? "home" : "content" };
}

export function AnalyticsRuntime() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(getAnalyticsConsent);

  useEffect(() => {
    if (getAnalyticsConsent() === "granted") {
      captureAttribution();
      void enableAnalytics();
    }
    return onAnalyticsConsentChange(() => {
      const nextConsent = getAnalyticsConsent();
      if (nextConsent === "granted") {
        captureAttribution();
        void enableAnalytics();
      }
      setConsent(nextConsent);
    });
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !pathname) return;
    const { path, pageType } = sanitizePath(pathname);
    trackPageView(path, pageType);
  }, [consent, pathname]);

  if (consent !== "unknown") return null;

  return (
    <aside className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white p-4 shadow-2xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-slate-700">
          Usamos analytics opcional para entender qué partes de GoReforma funcionan mejor.
          No enviamos tus respuestas ni datos personales. Más información en{" "}
          <Link href="/privacidad" className="font-semibold underline underline-offset-2">
            privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setAnalyticsConsent("denied")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsConsent("granted")}
            className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Aceptar analytics
          </button>
        </div>
      </div>
    </aside>
  );
}
