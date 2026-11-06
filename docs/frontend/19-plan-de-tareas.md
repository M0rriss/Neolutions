# 19 · Plan de tareas del frontend (Astro + React)

Ejecuta **una tarea por vez**, en orden. Al terminar cada una, verifica sus criterios y reporta: archivos creados o cambiados, comandos ejecutados y `TODO:` pendientes.

Recordatorio: nunca `npm`. Dependencias y scripts con `pnpm`; herramientas puntuales con `npx` o `pnpm dlx`.

Prompt sugerido para Claude Code:

```text
Lee AGENTS.md y docs/frontend/19-plan-de-tareas.md.
Ejecuta solo la tarea F0X, siguiendo los archivos que indica.
Al terminar, verifica sus criterios de aceptación y dime qué quedó pendiente.
```

---

## F01 · Monorepo y proyecto Astro + React

- **Lee:** `02-setup-monorepo.md`, `frontend/10-estructura-carpetas.md`
- **Haz:** archivos raíz, workspace de pnpm, `apps/web` con Astro + integración React + sitemap, alias `@/`, Prettier y ESLint, carpetas vacías del árbol, carpetas reservadas.
- **Criterios:** `pnpm install`, `pnpm dev` y `pnpm build` funcionan; solo existe `pnpm-lock.yaml`; un componente React de prueba se hidrata con `client:load` (luego se borra).

## F02 · Design system y datos

- **Lee:** `frontend/11-design-system.md`, `frontend/16-contenido-y-datos.md`
- **Haz:** `packages/design-tokens/tokens.css`, `styles/global.css` y `fonts.css`; componentes de `components/ui/` e íconos; `content.config.ts`; los 7 `.md` de servicios; archivos de `data/`; `lib/whatsapp.ts` con su prueba.
- **Criterios:** página temporal `/_ui` (no enlazada, `noindex`) que muestra todos los componentes base; `pnpm test` pasa; `astro check` sin errores.

## F02b · Stack de UI y núcleo de movimiento

- **Lee:** `frontend/11b-stack-ui-y-animaciones.md` (secciones 1 a 5)
- **Haz:** instalar Tailwind, shadcn/ui (con los alias indicados), GSAP, Lenis y Three.js; `global.css` con `@theme`; `lib/motion/*`; carga global en `BaseLayout`; `components/motion/Reveal.astro` y `SplitHeading.astro`.
- **Criterios:** la página `/_ui` muestra un botón de shadcn con los colores de marca y un bloque con `data-reveal` que aparece al hacer scroll; con reducir movimiento activado, todo es visible sin animación; no existe `package-lock.json`.

## F03 · Layout global

- **Lee:** `frontend/12-layout-global.md`
- **Haz:** `BaseLayout`, `PageLayout`, `AnnouncementBar`, `Header`, `ServicesMenu`, `MobileMenu`, `Footer`, `WhatsAppFloat`.
- **Criterios:** los de `12-layout-global.md`.

## F04 · Portada: Hero y TrustBar

- **Lee:** `frontend/13-home.md` (sección 2)
- **Haz:** `Hero.astro`, `TrustBar.astro`, visual decorativo del hero; `index.astro` con el layout.
- **Criterios:** a 375px el botón de WhatsApp se ve sin hacer scroll; el H1 es el LCP y carga en menos de 2.5 s en Lighthouse móvil.

## F05 · Portada: tabla de servicios

- **Lee:** `frontend/13-home.md` (sección 3)
- **Haz:** `ServicesTable.astro` con filtros, versión escritorio (tabla) y móvil (tarjetas), nota bajo la tabla.
- **Criterios:** agregar un `.md` de prueba crea una fila nueva; filtros con teclado; cada "Cotizar" lleva el mensaje de su servicio.

## F06 · Portada: Proceso, Bloques y Por qué elegirnos

- **Lee:** `frontend/13-home.md` (secciones 4 a 6)
- **Haz:** `Process.astro`, `ServiceGroups.astro`, `WhyUs.astro`, animaciones de entrada con `prefers-reduced-motion`.
- **Criterios:** sin scroll horizontal a 375px; textos salen de `data/`.

## F07 · Portada: FAQ, Llamado final y secciones de fase 2

- **Lee:** `frontend/13-home.md` (secciones 7 a 10)
- **Haz:** `Faq.astro` + `Accordion`, contenidos de `content/faq/`, `FinalCta.astro`, `ProjectsPreview` y `Testimonials` ocultos sin contenido publicado.
- **Criterios:** todos los criterios de la portada en `13-home.md`.

## F08 · Páginas de servicio

- **Lee:** `frontend/14-paginas-servicio.md`
- **Haz:** `ServiceLayout`, componentes de `components/service/`, `servicios/[slug].astro`, `servicios/index.astro`, FAQ por servicio.
- **Criterios:** los de `14-paginas-servicio.md`.

## F08b · Animaciones y escena 3D

- **Lee:** `frontend/11b-stack-ui-y-animaciones.md` (secciones 6 a 9)
- **Haz:** catálogo de animaciones sección por sección, `HeroScene.tsx` y `NetworkMesh.tsx` con respaldo estático, menú móvil con `Sheet` y desplegable con `NavigationMenu`, efecto magnético del botón principal.
- **Criterios:** los de la sección 10 de `11b-stack-ui-y-animaciones.md` y las metas de Lighthouse de la portada.

## F09 · Nosotros, 404 y legales

- **Lee:** `frontend/15-paginas-internas.md`
- **Haz:** `nosotros.astro`, `404.astro`, `legal/privacidad`, `legal/terminos`, `legal/cookies` con textos base y `TODO:` legales.
- **Criterios:** los de `15-paginas-internas.md`.

## F10 · Contacto, Gracias y formularios React

- **Lee:** `frontend/17-islas-react.md`, `frontend/15-paginas-internas.md`
- **Haz:** `ContactForm.tsx`, `ReclamoForm.tsx`, `features/leads`, `features/compliance`, `contacto.astro`, `gracias.astro`, `legal/libro-de-reclamaciones.astro`. Envío simulado.
- **Criterios:** los de `17-islas-react.md`.

## F11 · SEO, analítica y accesibilidad

- **Lee:** `frontend/18-seo-analitica-rendimiento.md`
- **Haz:** `lib/seo.ts`, JSON-LD, sitemap, robots, `lib/analytics.ts`, `CookieBanner.tsx`, revisión de accesibilidad.
- **Criterios:** los de `18-seo-analitica-rendimiento.md`.

## F12 · Revisión final

- **Haz:** `pnpm lint`, `pnpm build`, `astro check`, Lighthouse en Inicio, un servicio y Contacto; lista completa de `TODO:` pendientes; borra la página `/_ui`.
- **Criterios:** todas las metas cumplidas y un resumen de pendientes para el negocio (datos, fotos, textos legales).

Después de F12 sigue `docs/backend/20-backend-pendiente.md`.
