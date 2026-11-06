# 13 · Portada (Inicio)

La portada sigue un **modelo de referencia de estructura**: barra superior con invitación, hero con un mensaje fuerte y un botón, una tabla con una fila por producto, una nota aclaratoria, pasos numerados y tarjetas de productos. Ese orden se adapta a Neolutions. Todo lo visual y todos los textos son propios; no se copia código, texto ni imagen de ningún otro sitio.

## Orden de secciones

| # | Sección | Componente | Fondo | Fase |
| --- | --- | --- | --- | --- |
| 0 | Barra superior | `layout/AnnouncementBar` | brand-900 | 1 |
| 1 | Header | `layout/Header` | transparente → brand-800 | 1 |
| 2 | Hero + barra de confianza | `sections/Hero` + `sections/TrustBar` | brand-800 con degradado | 1 |
| 3 | Tabla de servicios | `sections/ServicesTable` | brand-800 | 1 |
| 4 | Cómo trabajamos | `sections/Process` | brand-900 | 1 |
| 5 | Bloques de servicios | `sections/ServiceGroups` | brand-800 | 1 |
| 6 | Por qué elegirnos | `sections/WhyUs` | brand-900 | 1 |
| 7 | Proyectos | `sections/ProjectsPreview` | brand-800 | 2 |
| 8 | Testimonios | `sections/Testimonials` | brand-900 | 2 |
| 9 | Preguntas frecuentes | `sections/Faq` | brand-800 | 1 |
| 10 | Llamado final | `sections/FinalCta` | acento con degradado | 1 |
| 11 | Footer | `layout/Footer` | brand-900 | 1 |

`src/pages/index.astro` solo importa y ordena estos componentes dentro de `PageLayout`. Las secciones de fase 2 se renderizan solo si su colección tiene contenido.

---

## 2. Hero

**Función:** que en 5 segundos se entienda qué hace Neolutions y se pulse el botón de WhatsApp.

### Layout

- Móvil: una columna. Orden: badge, H1, frase destacada, párrafo, botones, TrustBar, imagen.
- ≥1024px: dos columnas (55% texto / 45% visual). Alto mínimo `min-height: calc(100svh - 112px)`.

### Contenido

| Elemento | Texto |
| --- | --- |
| Badge (status) | "Cotización gratis · Lima y Callao" |
| H1 | "Tecnología para hacer crecer tu negocio" |
| Frase destacada (turquesa, `--text-2xl`) | "7 servicios, un solo equipo" |
| Párrafo | "Soporte técnico, redes, cámaras, páginas web, apps y sistemas a medida para pequeñas empresas y emprendedores." |
| Botón primario | `WhatsAppButton` tamaño `lg`: "Cotiza gratis por WhatsApp" |
| Botón secundario | `Button` `secondary`: "Ver servicios" → ancla `#servicios` |

### Visual (columna derecha)

Una composición propia, no una foto de banco:

- Tarjeta grande con borde `--color-border` y fondo `--color-brand-700`, que muestra una **vista previa de la tabla de servicios**: 4 filas compactas (ícono, nombre del servicio, badge "Disponible"). Es decorativa (`aria-hidden="true"`), los datos reales están en la sección 3.
- Detrás, un resplandor radial turquesa suave (`radial-gradient` con `--color-accent-100`) y una cuadrícula de líneas muy tenue.
- En escritorio, al fondo: escena 3D de red de nodos (`HeroScene`, ver `11b-stack-ui-y-animaciones.md`, sección 7). En móvil, imagen estática.
- Cuando existan fotos reales de trabajos (`public/images/hero/`), se puede añadir una foto recortada con `--radius-lg` detrás de la tarjeta.

### TrustBar (debajo de los botones)

Fila de 3 o 4 datos desde `data/trust.ts`, separados por líneas verticales `--color-border`.

```ts
export const trustItems = [
  { value: "7", label: "servicios en un solo lugar" },
  { value: "Gratis", label: "cotización sin compromiso" },
  { value: "Lima y Callao", label: "atención directa" },
  { value: "TODO", label: "años de experiencia" }, // confirmar dato real
] as const;
```

Un ítem con `value: "TODO"` no se renderiza en producción y se muestra resaltado en desarrollo.

---

## 3. Tabla de servicios (`id="servicios"`)

**Función:** que el visitante encuentre su necesidad de un vistazo y pida cotización desde la misma fila. Es la pieza central de la portada.

### Encabezado

- Eyebrow: "Servicios"
- H2: "Todo lo que tu negocio necesita en tecnología"
- Subtítulo: "Elige el servicio y te enviamos una cotización clara, sin costo."

### Filtros

Fila de pastillas (botones tipo tab) por bloque: **Todos · Soporte e infraestructura · Seguridad · Desarrollo y marketing digital**. Filtrado con un script inline (atributo `data-group` en cada fila), sin React. Accesible con `role="tablist"` / `role="tab"` / `aria-selected`.

### Columnas (≥768px)

| Columna | Contenido | Origen |
| --- | --- | --- |
| Servicio | Ícono en círculo `--color-accent-100` + nombre (semibold) + subtítulo corto | `content/servicios/*.md` (`title`, `tagline`, `icon`) |
| Para quién | Texto corto | `audienceShort` |
| Incluye | Resumen en una línea | `includesShort` |
| Bloque | `Badge` con el nombre del bloque | `group` |
| Estado | `Badge` variante `status`: "Disponible" | `available` (booleano) |
| Acción | Botón pequeño "Cotizar" (WhatsApp con mensaje del servicio) + enlace "Ver más" a `/servicios/<slug>` | `slug` |

### Estilo

- Cada fila es una "tarjeta horizontal": fondo `--color-brand-700`, `--radius-md`, separación `--space-3` entre filas, hover con borde `--color-border-strong`.
- Móvil (<768px): cada fila se convierte en tarjeta apilada: ícono + nombre arriba, badges en una línea, "Incluye" debajo y botones a todo el ancho.
- Se implementa con `<table>` semántica en escritorio o con lista `<ul>` y roles; en ambos casos los encabezados deben ser legibles por lectores de pantalla.

### Nota bajo la tabla

Texto `--text-sm`, `--color-text-subtle`:

> "Los tiempos y costos dependen del tamaño del local, el equipo existente y el alcance de cada proyecto. Te los detallamos en la cotización."

Enlace al final: "Ver todos los servicios →" a `/servicios`.

---

## 4. Cómo trabajamos

**Función:** quitar el miedo a contratar mostrando un proceso simple.

- Eyebrow: "Proceso" · H2: "Así de simple es trabajar con nosotros"
- 4 pasos desde `data/process.ts`, en una fila (≥1024px) o en columna (móvil) unidos por una línea fina.

| Paso | Etiqueta | Título | Texto |
| --- | --- | --- | --- |
| 1 | Paso 01 | Escuchamos tu necesidad | Nos cuentas qué pasa en tu negocio por WhatsApp o en una visita. |
| 2 | Paso 02 | Te enviamos una cotización clara | Detalle de lo que incluye, plazos y costo, sin letras pequeñas. |
| 3 | Paso 03 | Implementamos la solución | Instalamos, configuramos o desarrollamos lo acordado. |
| 4 | Paso 04 | Te damos soporte | Seguimos contigo después de la entrega. |

Cada paso: número grande en un círculo con borde turquesa, etiqueta "Paso 0X" en `--text-xs` mayúsculas, título H3 y texto. Botón al final de la sección: `WhatsAppButton`.

---

## 5. Bloques de servicios

**Función:** presentar los tres grandes grupos con más detalle visual.

- Eyebrow: "Soluciones" · H2: "Tres frentes, un solo aliado tecnológico"
- 3 tarjetas `Card` (una columna en móvil, tres en ≥1024px), desde `data/serviceGroups.ts`.

| Tarjeta | Título | Descripción | Servicios (enlaces) |
| --- | --- | --- | --- |
| 1 | Soporte e infraestructura | Equipos y redes funcionando para que tu negocio no se detenga. | Soporte técnico, Cableado estructurado |
| 2 | Seguridad | Vigila tu local y revisa todo desde el celular. | Cámaras de seguridad |
| 3 | Desarrollo y marketing digital | Web, apps y sistemas para vender más y trabajar mejor. | Páginas web, Apps móviles, Sistemas y automatización, SEO y SEM |

Cada tarjeta: ícono grande arriba, título H3, descripción, lista de servicios con `IconCheck` enlazados a su página, y enlace "Cotizar este bloque" (WhatsApp con mensaje del bloque).

---

## 6. Por qué elegirnos

- H2: "Por qué elegir Neolutions"
- 4 razones en grilla 2x2 (≥768px), desde `data/whyUs.ts`:
  1. **Trato cercano:** hablas directamente con quien hace el trabajo.
  2. **Soluciones a tu medida:** nada de paquetes que no necesitas.
  3. **Precios justos:** cotizaciones claras, sin costos ocultos.
  4. **Soporte después de la entrega:** no desaparecemos al terminar.

---

## 7 y 8. Proyectos y testimonios (fase 2)

- Solo se muestran si `content/proyectos` o `content/testimonios` tienen al menos un elemento con `published: true`.
- Proyectos: 3 tarjetas con imagen, servicio, problema y resultado.
- Testimonios: 3 tarjetas con cita, nombre, negocio. **Nunca inventar testimonios.**

---

## 9. Preguntas frecuentes

- H2: "Preguntas frecuentes"
- `Accordion` con las preguntas de `content/faq/` que tengan `scope: "general"`:
  1. ¿Cuánto cuesta una cotización? → Es gratis y sin compromiso.
  2. ¿Cuánto demora un proyecto? → Depende del servicio; el plazo va en la cotización.
  3. ¿Atienden en el local? → `TODO:` confirmar en sitio, remoto o ambos.
  4. ¿Dan garantía? → `TODO:` definir condiciones.
  5. ¿Qué formas de pago aceptan? → `TODO:` definir.
  6. ¿Dan soporte después de entregar? → Sí, soporte posterior a la entrega.
- Genera JSON-LD `FAQPage` con las mismas preguntas (ver `18-seo-analitica-rendimiento.md`).

---

## 10. Llamado final

- Fondo: degradado de `--color-brand-700` a un tono con 25% de turquesa, `--radius-lg`, dentro del contenedor.
- H2: "Cuéntanos qué necesita tu negocio"
- Texto: "Te cotizamos gratis y te respondemos por WhatsApp."
- Botones: `WhatsAppButton` `lg` + enlace secundario "Prefiero llenar un formulario" → `/contacto`.

---

## Criterios de aceptación de la portada

- Las 9 secciones de fase 1 aparecen en el orden de la tabla.
- La tabla de servicios lee los 7 servicios desde `content/servicios`; agregar un `.md` agrega una fila sin tocar código.
- Los filtros de la tabla funcionan con mouse y teclado.
- Cada botón "Cotizar" abre WhatsApp con el nombre de su servicio en el mensaje.
- A 375px no hay scroll horizontal y los botones ocupan todo el ancho.
- Lighthouse móvil: Rendimiento ≥ 90, Accesibilidad ≥ 95, SEO ≥ 95.
