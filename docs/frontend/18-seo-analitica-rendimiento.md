# 18 · SEO, analítica, accesibilidad y rendimiento

## 1. SEO (`lib/seo.ts` + `BaseLayout.astro`)

Cada página recibe por props: `title`, `description`, `image?`, `noindex?`, `jsonLd?`.

| Etiqueta | Regla |
| --- | --- |
| `<title>` | `{title} · Neolutions`, máximo 60 caracteres |
| `meta description` | Única por página, máximo 160 caracteres |
| `link rel="canonical"` | URL absoluta sin barra final |
| Open Graph / Twitter | `og:title`, `og:description`, `og:image` (1200x630), `og:locale=es_PE` |
| `html lang` | `es-PE` |
| `robots` | `noindex` en `/gracias` y `/404` |

### Datos estructurados (JSON-LD)

| Página | Tipo |
| --- | --- |
| Todas (en BaseLayout) | `Organization` + `LocalBusiness` (nombre, url, logo, teléfono, `areaServed`: Lima, Callao; redes en `sameAs`) |
| Servicio | `Service` + `BreadcrumbList` |
| Inicio y servicios con preguntas | `FAQPage` |

### Otros

- `@astrojs/sitemap` genera `sitemap-index.xml`; excluir `/gracias`.
- `public/robots.txt` apunta al sitemap.
- Un solo `<h1>` por página; jerarquía de encabezados sin saltos.
- Imágenes con `alt` descriptivo en español.

## 2. Analítica (fase 2, `lib/analytics.ts`)

- GA4 y píxel de Meta se cargan **solo después** del consentimiento del `CookieBanner`.
- API única:

```ts
export function track(event: string, params: Record<string, string | number> = {}) {
  // envía a gtag y fbq si están cargados; si no, no hace nada
}
```

| Evento | Cuándo | Parámetros |
| --- | --- | --- |
| `whatsapp_click` | Clic en cualquier botón de WhatsApp | `origen` (hero, tabla, flotante, cta-final, header, servicio), `servicio` |
| `lead_submitted` | Carga de `/gracias` | `servicio` |
| `service_view` | Carga de página de servicio | `servicio` |

Los botones de WhatsApp llevan `data-track="whatsapp_click"` y `data-origen` / `data-servicio`; un script delegado en BaseLayout los escucha.

## 3. Accesibilidad

- Contraste AA en todos los textos.
- Foco visible en todos los elementos interactivos.
- Navegación completa con teclado (menú, desplegable, filtros, acordeones, formularios).
- `prefers-reduced-motion` respetado.
- Íconos decorativos con `aria-hidden="true"`; botones con solo ícono llevan `aria-label`.

## 4. Rendimiento

| Meta (móvil, Lighthouse) | Valor |
| --- | --- |
| Rendimiento | ≥ 90 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| JS en la portada | < 30 KB comprimido (la portada no lleva islas React) |

- Imágenes con `<Image />` / `<Picture />` de `astro:assets`, formatos AVIF/WebP, `width` y `height` siempre.
- Imagen o visual del hero con `loading="eager"` y `fetchpriority="high"`; el resto `lazy`.
- Fuente Inter autoalojada con `font-display: swap`; precargar solo el peso usado en el H1.
- Sin librerías de animación ni carruseles.

## Criterios de aceptación

- Validación sin errores en https://validator.schema.org para Inicio y una página de servicio.
- Lighthouse móvil de Inicio, una página de servicio y Contacto cumple las metas.
