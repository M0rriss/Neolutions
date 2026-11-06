const GA4_ID = import.meta.env.PUBLIC_GA4_ID;
const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID;
const CONSENT_KEY = "neo-cookie-consent";

export type Consent = "accepted" | "necessary";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: unknown };
  }
}

export const analyticsConfigured = Boolean(GA4_ID || PIXEL_ID);

export function getConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "necessary" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Sin almacenamiento la elección dura solo esta visita.
  }
}

function addScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.append(script);
}

/** Solo debe llamarse tras el consentimiento. Es idempotente. */
export function loadAnalytics(): void {
  if (GA4_ID && !window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag() {
      // gtag.js exige el objeto arguments, no un array.
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
    addScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  }
  if (PIXEL_ID && !window.fbq) {
    const fbq: NonNullable<Window["fbq"]> = (...args: unknown[]) => {
      fbq.queue?.push(args);
    };
    fbq.queue = [];
    window.fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
}

/** Envía a gtag y fbq si están cargados; si no, no hace nada. */
export function track(event: string, params: Record<string, string | number> = {}): void {
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
}
