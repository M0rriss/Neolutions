# 12 · Layout global

Elementos presentes en todas las páginas: barra superior, header, footer y botón flotante de WhatsApp. Se ensamblan en `layouts/PageLayout.astro`.

```text
<BaseLayout>                 ← <head>, SEO, fuentes, analítica
  <AnnouncementBar />        ← barra fina superior
  <Header />                 ← fijo (sticky) al hacer scroll
  <main id="contenido">
    <slot />
  </main>
  <Footer />
  <WhatsAppFloat />          ← botón flotante
  <CookieBanner client:idle /> ← fase 2, cuando haya analítica
</BaseLayout>
```

Primer elemento del `<body>`: enlace "Saltar al contenido" (`#contenido`), visible solo con foco.

## 1. AnnouncementBar

Barra fina sobre el header que invita a la acción principal.

| Propiedad | Valor |
| --- | --- |
| Alto | 40px |
| Fondo | `--color-brand-900` |
| Texto | `--text-sm`, centrado |
| Contenido | "Cotización gratis y sin compromiso" + enlace "Escríbenos por WhatsApp" con flecha |
| Enlace | `lib/whatsapp.ts` con mensaje general |
| Móvil | Un solo texto corto: "Cotiza gratis por WhatsApp" |

Debe poder ocultarse desde `data/site.ts` (`announcement.enabled`).

## 2. Header

| Propiedad | Valor |
| --- | --- |
| Posición | `position: sticky; top: 0` |
| Alto | 72px (64px en móvil) |
| Fondo | Transparente sobre el hero; al hacer scroll pasa a `--color-brand-800` con `backdrop-filter: blur(12px)` y borde inferior `--color-border` |
| Izquierda | Logo claro, enlazado a `/` |
| Centro (≥1024px) | Menú: Inicio, Servicios (desplegable), Proyectos*, Nosotros, Blog*, Contacto |
| Derecha (≥1024px) | `WhatsAppButton` tamaño `md` |
| Móvil | Logo + botón hamburguesa (`IconMenu`) |

\* Proyectos y Blog solo aparecen cuando `navigation.ts` los marque como `enabled: true` (fase 2).

El cambio de fondo al hacer scroll se hace con un script inline de pocas líneas que agrega la clase `is-scrolled` cuando `window.scrollY > 8`.

### ServicesMenu (desplegable)

- Escritorio: panel de dos columnas con los 7 servicios agrupados por bloque (`data/serviceGroups.ts`). Cada ítem: ícono, nombre y una línea de beneficio.
- Se abre al pasar el mouse y con teclado (Enter o Espacio). Se cierra con Escape.
- Usa `aria-expanded` y `aria-controls`.
- Pie del panel: enlace "Ver todos los servicios" a `/servicios`.

### MobileMenu

- Panel a pantalla completa, fondo `--color-brand-800`.
- Enlaces grandes (`--text-xl`), Servicios como lista desplegable con `<details>`.
- Abajo: `WhatsAppButton` a todo el ancho y enlaces a TikTok y Facebook.
- Bloquea el scroll del body mientras está abierto. Cierra con Escape y al tocar un enlace.

## 3. Footer

Fondo `--color-brand-900`, padding vertical `--space-8`.

| Columna | Contenido |
| --- | --- |
| Marca | Logo, frase corta ("Tecnología para hacer crecer tu negocio"), redes (TikTok, Facebook) |
| Servicios | Los 7 servicios enlazados |
| Empresa | Nosotros, Proyectos*, Blog*, Contacto |
| Legal | Privacidad, Términos, Cookies, Libro de Reclamaciones |
| Contacto | WhatsApp, zona de atención, horario (`data/site.ts`) |

Franja inferior separada por `--color-border`:

- "© {año} Neolutions Tecnology. Todos los derechos reservados."
- Razón social y RUC: `TODO:` (mostrar solo cuando existan en `site.ts`).
- Icono y enlace del Libro de Reclamaciones.

Móvil: columnas apiladas; Servicios, Empresa y Legal como `<details>` plegables.

## 4. WhatsAppFloat

| Propiedad | Valor |
| --- | --- |
| Posición | Fija, abajo a la derecha, `bottom: 20px; right: 20px` |
| Forma | Círculo de 56px, fondo `--color-accent-500`, ícono de WhatsApp en `--color-text-on-accent` |
| Etiqueta | `aria-label="Cotiza gratis por WhatsApp"`; en escritorio, tooltip con el mismo texto al pasar el mouse |
| Mensaje | En páginas de servicio, mensaje prellenado de ese servicio; en el resto, mensaje general |
| Aparición | Visible tras 300px de scroll (no tapa el botón del hero) |
| Evento | `analytics.track("whatsapp_click", { origen: "flotante", servicio })` |

No debe cubrir el banner de cookies: si el banner está visible, el botón sube por encima de él.

## 5. Datos de navegación

`src/data/navigation.ts`:

```ts
export const mainNav = [
  { label: "Inicio", href: "/", enabled: true },
  { label: "Servicios", href: "/servicios", enabled: true, hasMenu: true },
  { label: "Proyectos", href: "/proyectos", enabled: false },
  { label: "Nosotros", href: "/nosotros", enabled: true },
  { label: "Blog", href: "/blog", enabled: false },
  { label: "Contacto", href: "/contacto", enabled: true },
] as const;

export const legalNav = [
  { label: "Política de privacidad", href: "/legal/privacidad" },
  { label: "Términos y condiciones", href: "/legal/terminos" },
  { label: "Política de cookies", href: "/legal/cookies" },
  { label: "Libro de Reclamaciones", href: "/legal/libro-de-reclamaciones" },
] as const;
```

## Criterios de aceptación

- El header se queda fijo y cambia de fondo al hacer scroll.
- El menú móvil abre, cierra con Escape y no deja scroll detrás.
- El desplegable de servicios funciona con teclado.
- Todos los botones de WhatsApp abren `https://wa.me/51913578930?text=...` en pestaña nueva.
- Lighthouse Accesibilidad ≥ 95 en una página vacía con solo el layout.
