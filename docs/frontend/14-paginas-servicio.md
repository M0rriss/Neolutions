# 14 · Páginas de servicio

Siete páginas generadas desde `content/servicios/*.md` con una sola plantilla: `pages/servicios/[slug].astro` + `layouts/ServiceLayout.astro`. Cada una es la página destino de su anuncio.

URL: `/servicios/<slug>` (slugs en `01-vision-y-reglas.md`).

## Estructura de la página

| # | Bloque | Componente | Contenido (campo del Markdown) |
| --- | --- | --- | --- |
| 1 | Hero del servicio | `service/ServiceHero` | Migas de pan, ícono, `title`, `headline` (H1), `description`, `WhatsAppButton` del servicio, imagen `image` |
| 2 | Problema | `service/ServiceProblem` | `problem`: 2 o 3 frases en lenguaje del cliente |
| 3 | Qué incluye | `service/ServiceIncludes` | `includes[]`: lista con `IconCheck`, en 2 columnas desde 768px |
| 4 | Beneficios | `service/ServiceBenefits` | `benefits[]`: 3 o 4 tarjetas con título y texto |
| 5 | Para quién es | `service/ServiceAudience` | `audience[]`: tipos de negocio como badges |
| 6 | Cómo trabajamos | `sections/Process` | Reutiliza los 4 pasos generales |
| 7 | Preguntas del servicio | `sections/Faq` | Preguntas de `content/faq` con `scope` = slug |
| 8 | Otros servicios | `service/RelatedServices` | 3 servicios del mismo bloque o los siguientes |
| 9 | Llamado final | `sections/FinalCta` | Con mensaje del servicio |

## Detalles

- **H1 = `headline`** (beneficio), no el nombre del servicio. El nombre va como eyebrow sobre el H1.
- **Migas de pan:** Inicio › Servicios › {title}, con JSON-LD `BreadcrumbList`.
- **WhatsApp:** todos los botones de la página usan `whatsappLink({ service: slug })`.
- **WhatsAppFloat:** recibe el slug para su mensaje.
- **SEO:** `seoTitle` y `seoDescription` propios por servicio; JSON-LD `Service` con `provider` = Neolutions y `areaServed` = Lima, Callao.

## Página índice `/servicios`

- Hero corto: H1 "Servicios de tecnología para tu negocio" + párrafo.
- La misma `ServicesTable` de la portada, sin límite y con filtros.
- `FinalCta`.

## `getStaticPaths`

```ts
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const servicios = await getCollection("servicios", ({ data }) => data.published);
  return servicios.map((s) => ({ params: { slug: s.id }, props: { servicio: s } }));
}
```

## Criterios de aceptación

- Se generan exactamente las páginas de los servicios con `published: true`.
- Cada página tiene título, descripción y H1 únicos.
- Cambiar un texto en el `.md` cambia la página sin tocar componentes.
