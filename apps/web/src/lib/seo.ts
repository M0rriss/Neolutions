import { site } from "@/data/site";

const SUFFIX = " · Neolutions";
const MAX_TITLE = 60;

/** Agrega la marca solo si el título sigue dentro del máximo de 60 caracteres. */
export function pageTitle(title: string): string {
  const full = title + SUFFIX;
  return full.length <= MAX_TITLE ? full : title;
}

/**
 * Ruta pública de la página. Con build.format "file", Astro.url.pathname trae
 * "/ayuda.html" o "/index.html" al compilar; el sitio publica "/ayuda" y "/".
 */
export function cleanPath(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/$/, "");
  return path || "/";
}

export function absoluteUrl(path: string, base: string | URL): string {
  const url = new URL(path, base).href;
  return url.length > new URL(base).origin.length + 1
    ? url.replace(/\/$/, "")
    : url.replace(/\/$/, "");
}

export function jsonLdString(data: unknown): string {
  // "<" escapado para que el contenido nunca pueda cerrar la etiqueta <script>.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(base: string | URL) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${absoluteUrl("/", base)}/#organizacion`,
    name: site.name,
    url: absoluteUrl("/", base),
    logo: absoluteUrl("/logo/neolutions-oscuro.svg", base),
    image: absoluteUrl("/og-default.jpg", base),
    telephone: `+${site.whatsapp.number}`,
    areaServed: [
      { "@type": "City", name: "Lima" },
      { "@type": "City", name: "Callao" },
    ],
    sameAs: [site.social.tiktok, site.social.facebook],
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], base: string | URL) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, path }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path, base),
    })),
  };
}

export function serviceJsonLd(
  service: { name: string; description: string; path: string },
  base: string | URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path, base),
    provider: { "@id": `${absoluteUrl("/", base)}/#organizacion` },
    areaServed: [
      { "@type": "City", name: "Lima" },
      { "@type": "City", name: "Callao" },
    ],
  };
}
