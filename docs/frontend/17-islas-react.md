# 17 · Islas React

Stack: **Astro + React**. Astro genera todas las páginas como HTML estático; React se usa solo en componentes interactivos ("islas") dentro de `src/components/islands/`, hidratados con directivas `client:*`.

| Isla | Dónde | Directiva | Por qué React |
| --- | --- | --- | --- |
| `ContactForm.tsx` | `/contacto` (y opcional en `FinalCta`) | `client:visible` | Validación, estados de envío, errores |
| `ReclamoForm.tsx` | `/legal/libro-de-reclamaciones` | `client:load` | Formulario largo con secciones condicionales |
| `CookieBanner.tsx` | `PageLayout` (fase 2) | `client:idle` | Estado de consentimiento y carga diferida de analítica |

Menú móvil, header con scroll, filtros de la tabla y acordeones **no** usan React: son HTML nativo y scripts inline pequeños.

Librerías: `react-hook-form` + `zod` + `@hookform/resolvers/zod`. Estilos con CSS Modules (`ContactForm.module.css`) usando las variables de tokens.

## 1. ContactForm

### Campos

| Campo | Tipo | Validación | Mensaje de error |
| --- | --- | --- | --- |
| `name` | texto | 2 a 80 caracteres | "Escribe tu nombre" |
| `phone` | tel | 9 dígitos que empiecen en 9 (celular Perú), se aceptan espacios | "Escribe un celular válido de 9 dígitos" |
| `service` | select | uno de los slugs de servicios u "otro" | "Elige un servicio" |
| `message` | textarea | 10 a 1000 caracteres | "Cuéntanos un poco más (mínimo 10 caracteres)" |
| `consent` | checkbox | debe estar marcado | "Necesitamos tu autorización para responderte" |
| `website` | texto oculto | debe estar vacío (anti-spam) | Sin mensaje; se descarta en silencio |

Texto del consentimiento: "Autorizo a Neolutions Tecnology a usar mis datos para responder mi solicitud, según la [Política de privacidad](/legal/privacidad)."

### Esquema (`features/leads/schema.ts`)

```ts
import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  phone: z.string().transform((v) => v.replace(/\s/g, "")).pipe(
    z.string().regex(/^9\d{8}$/, "Escribe un celular válido de 9 dígitos"),
  ),
  service: z.string().min(1, "Elige un servicio"),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(1000),
  consent: z.literal(true, { errorMap: () => ({ message: "Necesitamos tu autorización para responderte" }) }),
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
```

### Envío (`features/leads/submitLead.ts`)

- Si `PUBLIC_API_URL` está vacío (fase frontend): simula el envío (espera 800 ms, devuelve éxito) y escribe en consola en desarrollo.
- Si existe: `POST {PUBLIC_API_URL}/api/v1/leads` con JSON. Respuesta esperada `201`.
- Errores de red o `5xx`: mensaje "No pudimos enviar tu solicitud. Escríbenos por WhatsApp." con `WhatsAppButton`.

### Estados de la interfaz

| Estado | Qué se ve |
| --- | --- |
| Inicial | Formulario |
| Enviando | Botón deshabilitado con texto "Enviando..." y `aria-busy` |
| Error de campo | Mensaje bajo el campo, `aria-invalid` y `aria-describedby` |
| Error de envío | Alerta con `role="alert"` y botón de WhatsApp |
| Éxito | Redirección a `/gracias` |

### Props

```ts
type Props = {
  services: { slug: string; title: string }[]; // se pasan desde Astro (getCollection)
  defaultService?: string;
};
```

Los servicios se pasan como props desde la página Astro; la isla no lee colecciones.

## 2. ReclamoForm (Libro de Reclamaciones)

Campos según el formato del Libro de Reclamaciones virtual (`TODO:` validar la lista final con INDECOPI):

1. **Consumidor:** nombres y apellidos, tipo y número de documento, domicilio, teléfono, correo. Si es menor de edad, datos del padre, madre o apoderado.
2. **Bien contratado:** tipo (producto o servicio), monto, descripción.
3. **Detalle:** tipo (Reclamo o Queja, con explicación de cada uno), detalle, pedido del consumidor.
4. **Consentimiento** y fecha (automática).

Al enviar: número correlativo y mensaje de confirmación (simulado hasta el backend). Botón para imprimir la hoja.

## 3. CookieBanner (fase 2)

- Aparece solo si `PUBLIC_GA4_ID` o `PUBLIC_META_PIXEL_ID` tienen valor.
- Opciones: "Aceptar", "Solo necesarias" y enlace a `/legal/cookies`.
- Guarda la elección en `localStorage` (envuelto en `try/catch`).
- La analítica se carga **solo** tras aceptar (ver `18-seo-analitica-rendimiento.md`).

## Uso desde Astro

```astro
---
import { getCollection } from "astro:content";
import ContactForm from "@/components/islands/ContactForm";
const services = (await getCollection("servicios", ({ data }) => data.published))
  .sort((a, b) => a.data.order - b.data.order)
  .map((s) => ({ slug: s.id, title: s.data.title }));
---
<ContactForm client:visible services={services} />
```

## Criterios de aceptación

- El formulario se puede llenar y enviar solo con teclado.
- Cada error se anuncia a lectores de pantalla.
- Con el campo trampa lleno, no se envía nada.
- El JavaScript total de la página `/contacto` no supera 60 KB comprimido.
