const ATTRIBUTION_KEY = "goreforma:attribution";
const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type Attribution = {
  first_touch?: Record<string, string>;
  last_touch?: Record<string, string>;
  captured_at: number;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function clean(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 100) : undefined;
}

function safeLandingPath(pathname: string): string {
  return pathname.startsWith("/estimacion/") ? "/estimacion/[token]" : pathname;
}

function read(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Attribution;
    if (typeof value?.captured_at !== "number" || !Number.isFinite(value.captured_at)) {
      window.localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    if (Date.now() - value.captured_at > ATTRIBUTION_TTL_MS) {
      window.localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function currentTouch(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const touch: Record<string, string> = { landing_path: safeLandingPath(window.location.pathname) };
  for (const key of UTM_KEYS) {
    const value = clean(params.get(key));
    if (value) touch[key] = value;
  }

  if (document.referrer) {
    try {
      touch.referrer_host = new URL(document.referrer).hostname.slice(0, 100);
    } catch {
      // Ignore malformed referrers.
    }
  }
  return touch;
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const previous = read();
  const touch = currentTouch();
  const hasCampaign = UTM_KEYS.some((key) => Boolean(touch[key]));
  const next: Attribution = {
    first_touch: previous?.first_touch ?? touch,
    last_touch: hasCampaign ? touch : previous?.last_touch ?? touch,
    captured_at: previous?.captured_at ?? Date.now(),
  };
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    // Analytics continues without persisted attribution.
  }
}

export function getAttributionProperties(): Record<string, string> {
  const value = read();
  if (!value) return {};
  const properties: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value.first_touch ?? {})) {
    properties[`first_${key}`] = entry;
  }
  for (const [key, entry] of Object.entries(value.last_touch ?? {})) {
    properties[`last_${key}`] = entry;
  }
  return properties;
}
