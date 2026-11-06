# 16 · Contenido y datos

Regla: **ningún texto de negocio vive dentro de un componente.** Los textos largos van en `src/content/` (Markdown) y los datos cortos en `src/data/` (TypeScript).

## 1. Colecciones (`src/content.config.ts`)

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const grupos = ["soporte-infraestructura", "seguridad", "desarrollo-digital"] as const;

const servicios = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/servicios" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),                 // "Cámaras de seguridad"
      headline: z.string(),              // H1 de su página
      tagline: z.string(),               // subtítulo en la tabla
      description: z.string(),           // párrafo del hero del servicio
      group: z.enum(grupos),
      icon: z.enum(["support", "network", "camera", "web", "mobile", "automation", "search"]),
      order: z.number(),
      available: z.boolean().default(true),
      published: z.boolean().default(true),
      audienceShort: z.string(),
      includesShort: z.string(),
      problem: z.string(),
      includes: z.array(z.string()).min(3),
      benefits: z.array(z.object({ title: z.string(), text: z.string() })).min(3).max(4),
      audience: z.array(z.string()),
      whatsappMessage: z.string(),       // mensaje prellenado
      image: image().optional(),
      seoTitle: z.string().max(60),
      seoDescription: z.string().max(160),
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    scope: z.string(),                   // "general" o el slug de un servicio
    order: z.number(),
    published: z.boolean().default(true),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proyectos" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      service: z.string(),
      client: z.string(),
      clientConsent: z.literal(true),    // obligatorio: permiso del cliente
      problem: z.string(),
      result: z.string(),
      cover: image(),
      published: z.boolean().default(false),
    }),
});

const testimonios = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonios" }),
  schema: z.object({
    name: z.string(),
    business: z.string(),
    quote: z.string(),
    clientConsent: z.literal(true),
    published: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(false),
  }),
});

export const collections = { servicios, faq, proyectos, testimonios, blog };
```

## 2. Ejemplo de servicio (`src/content/servicios/camaras-de-seguridad.md`)

```markdown
---
title: Cámaras de seguridad
headline: Cuida tu negocio las 24 horas
tagline: Vigilancia que revisas desde tu celular
description: Instalamos y configuramos cámaras para que veas tu negocio en vivo desde cualquier lugar.
group: seguridad
icon: camera
order: 3
audienceShort: Tiendas, oficinas y almacenes
includesShort: Instalación, grabador y vista en el celular
problem: No sabes qué pasa en tu local cuando no estás, y ante un incidente no tienes cómo revisar lo ocurrido.
includes:
  - Instalación de cámaras
  - Grabador y configuración de grabación
  - Visualización desde el celular
  - Mantenimiento
benefits:
  - title: Tranquilidad
    text: Revisa tu negocio en vivo desde donde estés.
  - title: Evidencia
    text: Grabaciones disponibles cuando las necesites.
  - title: Control
    text: Supervisa ingresos, caja y almacén.
audience: [Tiendas, Restaurantes, Oficinas, Almacenes]
whatsappMessage: Hola Neolutions, quiero cotizar la instalación de cámaras de seguridad para mi negocio.
seoTitle: Instalación de cámaras de seguridad en Lima y Callao
seoDescription: Cámaras para negocios con vista en el celular. Instalación, configuración y mantenimiento. Cotización gratis por WhatsApp.
---
```

Crear los 7 archivos con los textos de `01-vision-y-reglas.md` y del documento de contenidos. Lo que no esté definido va como `TODO:`.

## 3. Datos (`src/data/`)

### `site.ts`

```ts
export const site = {
  name: "Neolutions Tecnology",
  shortName: "Neolutions",
  tagline: "Tecnología para hacer crecer tu negocio",
  url: import.meta.env.PUBLIC_SITE_URL,
  whatsapp: {
    number: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? "51913578930",
    display: "913 578 930",
    defaultMessage: "Hola Neolutions, quiero una cotización para mi negocio.",
  },
  social: {
    tiktok: "https://www.tiktok.com/@neo.soluciones",
    facebook: "https://www.facebook.com/NeolutionsTecnology",
  },
  area: "Lima y Callao",
  schedule: "TODO: horario de atención",
  legal: { businessName: "", ruc: "" }, // TODO: completar cuando existan
  announcement: { enabled: true },
} as const;
```

### `serviceGroups.ts`

```ts
export const serviceGroups = [
  { id: "soporte-infraestructura", title: "Soporte e infraestructura", description: "Equipos y redes funcionando para que tu negocio no se detenga.", icon: "support" },
  { id: "seguridad", title: "Seguridad", description: "Vigila tu local y revisa todo desde el celular.", icon: "camera" },
  { id: "desarrollo-digital", title: "Desarrollo y marketing digital", description: "Web, apps y sistemas para vender más y trabajar mejor.", icon: "web" },
] as const;
```

`trust.ts`, `process.ts`, `whyUs.ts` y `navigation.ts`: contenido en `13-home.md` y `12-layout-global.md`.

## 4. `lib/whatsapp.ts`

```ts
import { site } from "@/data/site";

type Options = { message?: string; service?: { title: string; whatsappMessage: string } };

export function whatsappLink({ message, service }: Options = {}): string {
  const text = message ?? service?.whatsappMessage ?? site.whatsapp.defaultMessage;
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(text)}`;
}
```

Prueba unitaria con Vitest: el enlace contiene el número y el mensaje codificado.
