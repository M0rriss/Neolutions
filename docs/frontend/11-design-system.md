# 11 · Design system de Neolutions

Estilo general: **oscuro, tecnológico y limpio**. Fondos en el morado oscuro de la marca, acentos en turquesa, tipografía grande y mucho espacio. Las secciones alternan entre fondo oscuro y una variante un poco más clara para separar bloques.

Todo valor visual sale de estas variables. Van en `packages/design-tokens/tokens.css`.

## 1. Colores

```css
:root {
  /* Marca */
  --color-brand-900: #1a1030;   /* fondo más profundo (footer, barra superior) */
  --color-brand-800: #2A1B4A;   /* fondo principal de la marca */
  --color-brand-700: #362560;   /* superficies: tarjetas, filas de tabla */
  --color-brand-600: #45317a;   /* bordes y hover de superficies */

  --color-accent-500: #00A999;  /* botones, enlaces, acentos */
  --color-accent-400: #1fc4b3;  /* hover del acento */
  --color-accent-100: rgba(0, 169, 153, 0.14); /* fondo de badges y resaltes */

  /* Texto */
  --color-text: #ffffff;
  --color-text-muted: #c9c2dc;
  --color-text-subtle: #9b92b4;
  --color-text-on-accent: #0d0a17;

  /* Estados */
  --color-success: #2ecc8f;
  --color-warning: #f2b544;
  --color-danger: #ff6b6b;

  /* Líneas */
  --color-border: rgba(255, 255, 255, 0.10);
  --color-border-strong: rgba(255, 255, 255, 0.18);

  /* Secciones claras (legales, formularios largos) */
  --color-surface-light: #f7f6fb;
  --color-text-dark: #1d1530;
}
```

Reglas:

- Texto principal siempre `--color-text` sobre fondos de marca.
- El turquesa se reserva para acciones y resaltes. Si todo es turquesa, nada destaca.
- Contraste mínimo WCAG AA (4.5:1 para texto normal). Verifica `--color-text-muted` sobre `--color-brand-700`.

## 2. Tipografía

Fuente: **Inter Variable** (`@fontsource-variable/inter`), importada en `styles/fonts.css`.

```css
:root {
  --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;

  --text-xs: 0.75rem;     /* 12 */
  --text-sm: 0.875rem;    /* 14 */
  --text-base: 1rem;      /* 16 */
  --text-lg: 1.125rem;    /* 18 */
  --text-xl: 1.25rem;     /* 20 */
  --text-2xl: 1.5rem;     /* 24 */
  --text-3xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem);
  --text-4xl: clamp(2.25rem, 1.6rem + 3vw, 3.5rem);
  --text-5xl: clamp(2.5rem, 1.6rem + 4.5vw, 4.5rem);  /* titular del hero */

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.6;
}
```

| Uso | Tamaño | Peso |
| --- | --- | --- |
| Titular del hero (H1) | `--text-5xl` | bold, `--leading-tight` |
| Títulos de sección (H2) | `--text-4xl` | bold |
| Títulos de tarjeta (H3) | `--text-xl` | semibold |
| Párrafo | `--text-base` o `--text-lg` en hero | regular, `--leading-normal` |
| Etiquetas, badges, notas | `--text-xs` o `--text-sm` | medium |

## 3. Espaciado, radios y sombras

```css
:root {
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.5rem;   --space-6: 2rem;
  --space-7: 3rem;     --space-8: 4rem;     --space-9: 6rem;

  --section-padding-y: clamp(4rem, 3rem + 4vw, 7rem);
  --container-max: 1200px;
  --container-padding-x: 1rem;  /* 1.5rem desde 768px */

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  --shadow-card: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.25);
  --shadow-accent: 0 8px 24px rgba(0, 169, 153, 0.35);

  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

## 4. Breakpoints

| Nombre | Desde | Uso |
| --- | --- | --- |
| móvil | 0 | Diseño base (una columna) |
| `md` | 768px | Dos columnas, tabla visible como tabla |
| `lg` | 1024px | Menú de escritorio, hero en dos columnas |
| `xl` | 1280px | Ancho máximo del contenedor |

Usa media queries `min-width` (celular primero).

## 5. Componentes base (`components/ui/`)

### Button

| Prop | Tipo | Valores |
| --- | --- | --- |
| `variant` | string | `primary` (turquesa, texto oscuro), `secondary` (borde blanco, fondo transparente), `ghost` (solo texto) |
| `size` | string | `md` (alto 44px), `lg` (alto 52px) |
| `href` | string | Si existe se renderiza `<a>`, si no `<button>` |
| `icon` | slot | Ícono opcional a la derecha |

- `primary` en hover: `--color-accent-400` y `--shadow-accent`.
- Área táctil mínima 44 x 44 px.
- Foco visible: `outline: 2px solid var(--color-accent-400); outline-offset: 3px`.

### WhatsAppButton

Envuelve `Button` variante `primary` con `IconWhatsApp`. Props: `service?: string` (slug) y `label?: string` (por defecto "Cotiza gratis por WhatsApp"). El `href` siempre sale de `lib/whatsapp.ts`. Abre en pestaña nueva con `rel="noopener"`.

### Badge

Pastilla pequeña: fondo `--color-accent-100`, texto `--color-accent-400`, `--radius-pill`, `--text-xs` medium. Variante `status` con un punto verde (`--color-success`) delante, para el texto "Disponible".

### Card

Fondo `--color-brand-700`, borde `--color-border`, `--radius-lg`, padding `--space-6`. Hover: borde `--color-border-strong` y desplazamiento `translateY(-2px)`.

### SectionHeading

Props: `eyebrow?` (texto corto en turquesa, mayúsculas, `--text-sm`), `title`, `subtitle?`, `align` (`left` | `center`). El `title` es un `<h2>`.

### Container

`max-width: var(--container-max)`, centrado, padding lateral `--container-padding-x`.

### Accordion

`<details>` + `<summary>` nativos. Ícono de "+" que rota 45° al abrir. Sin JavaScript.

## 6. Movimiento

- Animaciones suaves de entrada (fade + 12px hacia arriba) al hacer scroll, con `IntersectionObserver` en un script inline pequeño.
- Respeta `prefers-reduced-motion: reduce` desactivando todas las animaciones.
- Nada de carruseles automáticos.

## 7. Íconos

SVG propios, trazo de 1.75px, 24x24, `currentColor`. Uno por servicio (ver `10-estructura-carpetas.md`). No copies íconos de otros sitios; si se usa una librería, que sea de licencia libre (por ejemplo Lucide, ISC) y se convierte a componente `.astro`.
