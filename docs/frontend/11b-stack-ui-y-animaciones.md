# 11b · Stack de UI y animaciones

Tecnologías visuales del frontend, elegidas a partir del stack que usa el sitio de referencia y adaptadas a **Astro + React**. Se usan las mismas librerías (todas públicas y de licencia libre), pero las animaciones, escenas 3D y estilos son propios de Neolutions. No se copia código, shaders, modelos 3D ni assets de ningún sitio.

> Recordatorio: dependencias con `pnpm`; herramientas puntuales con `npx`. Nunca `npm`.

## 1. Qué se usa y para qué

| Tecnología | Rol en Neolutions | Dónde corre |
| --- | --- | --- |
| **Astro** | Rutas, páginas estáticas, SEO | Servidor (build) |
| **React** | Islas interactivas: formularios, escena 3D, componentes de UI | Cliente, solo donde se hidrata |
| **Tailwind CSS** | Estilos con utilidades; los tokens de marca viven en `@theme` | Build |
| **shadcn/ui** | Componentes React listos (Button, Dialog, Select, Accordion, Sheet, Tooltip) que se copian al repo y se editan | Islas React |
| **Radix UI** | Base accesible de shadcn/ui (foco, teclado, ARIA) | Islas React |
| **GSAP** + **ScrollTrigger** + **SplitText** | Animaciones de entrada, textos, scroll y líneas que se dibujan | Scripts en `.astro` e islas |
| **@gsap/react** (`useGSAP`) | GSAP dentro de componentes React con limpieza automática | Islas React |
| **Lenis** | Scroll suave sincronizado con ScrollTrigger | Global (script en BaseLayout) |
| **Three.js** + **@react-three/fiber** + **@react-three/drei** | Fondo 3D del hero | Isla React diferida |

### Lo que NO se adopta del stack de referencia

| Tecnología | Por qué no |
| --- | --- |
| React Router | Astro ya maneja las rutas por archivos |
| Intercom (chat y CRM) | El canal de atención es WhatsApp |
| Hyros, Tinybird | Analítica de pago para otro tipo de negocio; usamos GA4 y píxel de Meta (`18-seo-analitica-rendimiento.md`) |
| Cloudflare Bot Management | Se evalúa al desplegar; la web arranca sin él |
| Cloudflare CDN, PWA, Priority Hints, Open Graph | Sí aplican, pero son de despliegue y SEO: ver sección 9 |

## 2. Instalación

Desde la raíz del repo:

```bash
# Tailwind CSS (integración oficial de Astro)
pnpm --filter @neolutions/web astro add tailwind --yes

# Animación y scroll
pnpm --filter @neolutions/web add gsap @gsap/react lenis

# 3D
pnpm --filter @neolutions/web add three @react-three/fiber @react-three/drei
pnpm --filter @neolutions/web add -D @types/three

# Utilidades que usa shadcn/ui
pnpm --filter @neolutions/web add clsx tailwind-merge class-variance-authority
```

shadcn/ui (se ejecuta con npx dentro de `apps/web`):

```bash
cd apps/web
npx shadcn@latest init
npx shadcn@latest add button dialog sheet select accordion tooltip input textarea checkbox label
cd ../..
pnpm install
```

Después de cada comando de shadcn, revisa que **no** se haya creado `package-lock.json`. Si apareció, bórralo y ejecuta `pnpm install` en la raíz.

### `apps/web/components.json` (alias de shadcn)

Los componentes de shadcn son React (`.tsx`). Van en su propia carpeta para no mezclarse con los componentes `.astro`:

```json
{
  "style": "new-york",
  "tsx": true,
  "tailwind": { "css": "src/styles/global.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components/react",
    "ui": "@/components/react/ui",
    "utils": "@/lib/utils",
    "hooks": "@/hooks",
    "lib": "@/lib"
  }
}
```

## 3. Tailwind con los tokens de marca

`src/styles/global.css` importa Tailwind y define la marca en `@theme`. Los valores son los de `11-design-system.md`; desde ahora los tokens viven aquí (el paquete `@neolutions/design-tokens` exporta este mismo archivo).

```css
@import "tailwindcss";

@theme {
  --color-brand-900: #1a1030;
  --color-brand-800: #2A1B4A;
  --color-brand-700: #362560;
  --color-brand-600: #45317a;
  --color-accent-500: #00A999;
  --color-accent-400: #1fc4b3;
  --color-muted: #c9c2dc;
  --color-subtle: #9b92b4;

  --font-sans: "Inter Variable", system-ui, sans-serif;

  --radius-card: 20px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Variables que espera shadcn/ui, mapeadas a la marca */
:root {
  --background: var(--color-brand-800);
  --foreground: #ffffff;
  --primary: var(--color-accent-500);
  --primary-foreground: #0d0a17;
  --card: var(--color-brand-700);
  --card-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.10);
  --input: rgba(255, 255, 255, 0.18);
  --ring: var(--color-accent-400);
  --radius: 12px;
}

html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
```

Uso: `bg-brand-800`, `text-accent-500`, `rounded-card`, `ease-out-expo`. Nada de colores hexadecimales escritos en las clases.

## 4. Estructura de archivos nueva

```text
apps/web/src/
├── components/
│   ├── react/
│   │   ├── ui/                 # shadcn/ui (button.tsx, dialog.tsx, ...)
│   │   └── three/
│   │       ├── HeroScene.tsx   # isla: <Canvas> de react-three-fiber
│   │       └── NetworkMesh.tsx # malla de nodos y conexiones (propia)
│   └── motion/
│       ├── Reveal.astro        # envoltorio: data-reveal para entradas
│       └── SplitHeading.astro  # H1/H2 con data-split para SplitText
├── lib/
│   ├── utils.ts                # cn() de shadcn
│   └── motion/
│       ├── gsap.ts             # registro único de plugins
│       ├── lenis.ts            # inicio de Lenis + sincronía con ScrollTrigger
│       ├── reveal.ts           # animaciones de [data-reveal]
│       ├── split.ts            # animaciones de [data-split]
│       └── reducedMotion.ts    # detecta prefers-reduced-motion
└── styles/global.css
```

## 5. Núcleo de movimiento

### `lib/motion/gsap.ts`

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: "power3.out", duration: 0.8 });

export { gsap, ScrollTrigger, SplitText };
```

### `lib/motion/reducedMotion.ts`

```ts
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

### `lib/motion/lenis.ts`

```ts
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { prefersReducedMotion } from "./reducedMotion";

export function initLenis() {
  if (prefersReducedMotion()) return null;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Los enlaces de ancla (#servicios) usan lenis.scrollTo
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href")!);
      if (target) { e.preventDefault(); lenis.scrollTo(target as HTMLElement, { offset: -80 }); }
    }),
  );
  return lenis;
}
```

### Carga global (en `BaseLayout.astro`)

```astro
<script>
  import { initLenis } from "@/lib/motion/lenis";
  import { initReveals } from "@/lib/motion/reveal";
  import { initSplits } from "@/lib/motion/split";
  initLenis();
  initSplits();
  initReveals();
</script>
```

Astro empaqueta este script una sola vez y lo carga como módulo.

### `lib/motion/reveal.ts` (entradas al hacer scroll)

```ts
import { gsap, ScrollTrigger } from "./gsap";
import { prefersReducedMotion } from "./reducedMotion";

export function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (prefersReducedMotion()) { gsap.set(items, { opacity: 1, y: 0 }); return; }

  ScrollTrigger.batch(items, {
    start: "top 85%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(batch, { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08 }),
  });
}
```

Para evitar parpadeos, en CSS: `[data-reveal] { opacity: 0; }` dentro de `@media (prefers-reduced-motion: no-preference)`, y un `<noscript>` que lo anule.

## 6. Catálogo de animaciones de Neolutions

Todas son propias. Duraciones cortas, una sola idea por sección.

| Sección | Animación | Técnica | Detalle |
| --- | --- | --- | --- |
| Header | Fondo aparece al bajar; se oculta al bajar rápido y vuelve al subir | ScrollTrigger `onUpdate` + clase CSS | Solo en ≥1024px |
| Hero: H1 | Las líneas suben desde una máscara, con 0.1 s entre líneas | SplitText (`type: "lines"`, `mask: "lines"`) | `data-split="lines"` en `SplitHeading.astro` |
| Hero: frase turquesa | Fade + desplazamiento de 12px, 0.3 s después del H1 | GSAP timeline | |
| Hero: botones y TrustBar | Entrada escalonada | `data-reveal` | |
| Hero: fondo | Malla 3D de nodos conectados que rota lento y reacciona al mouse | Three.js con react-three-fiber (sección 7) | Representa redes y conexión; no es un modelo copiado |
| Hero: tarjeta de vista previa | Flota ±6px en Y de forma continua | GSAP `yoyo: true, repeat: -1` | Se pausa fuera de pantalla |
| TrustBar | Los números cuentan desde 0 (solo valores numéricos reales) | GSAP sobre un objeto `{ val }` + `snap` | Una vez, al entrar |
| Tabla de servicios | Filas entran escalonadas; al filtrar, salen y entran con fade | `ScrollTrigger.batch` + `gsap.to` al cambiar filtro | Usar `Flip` de GSAP si se reordena |
| Cómo trabajamos | Línea que une los pasos se dibuja con el scroll; cada paso se ilumina al llegar | ScrollTrigger `scrub: true` sobre `scaleX` (escritorio) o `scaleY` (móvil) | |
| Bloques de servicios | Tarjetas suben escalonadas; en hover, borde con brillo turquesa que sigue el cursor | `data-reveal` + CSS con variables `--x` `--y` actualizadas en `pointermove` | Hover solo en dispositivos con puntero fino |
| Por qué elegirnos | Íconos con trazo SVG que se dibuja | `stroke-dasharray` animado con GSAP | |
| FAQ | Apertura suave del acordeón | Accordion de shadcn/Radix (isla) o `<details>` con transición de altura en CSS | |
| Llamado final | Degradado de fondo que se desplaza lentamente | CSS `@keyframes` en `background-position` | |
| Botón de WhatsApp principal | Efecto magnético leve (se acerca al cursor hasta 6px) | `gsap.quickTo` en `pointermove` | Solo puntero fino |

### Reglas de animación

1. Duración entre 0.4 y 1.0 s; easing `power3.out` o `ease-out-expo`.
2. Solo se animan `transform` y `opacity` (y `clip-path` en máscaras). Nunca `width`, `height`, `top` o `left`.
3. Ninguna animación bloquea leer o pulsar un botón: el contenido es visible si el JavaScript falla.
4. Con `prefers-reduced-motion: reduce`: sin Lenis, sin 3D (imagen estática), sin SplitText, sin parallax. Solo cambios de opacidad instantáneos.
5. Cada animación de React usa `useGSAP` para que se limpie al desmontar.
6. Nada de carruseles automáticos ni animaciones que se repitan sin fin a la vista, salvo el flotado suave de la tarjeta del hero.

## 7. Escena 3D del hero

### Concepto

Una red de unos 120 nodos (esferas pequeñas) unidos por líneas finas, en turquesa sobre el morado de la marca. Representa redes, conexión y tecnología, que es lo que vende Neolutions. Gira despacio sobre su eje Y y se inclina unos grados hacia el cursor.

### Carga

```astro
---
import HeroScene from "@/components/react/three/HeroScene";
---
<div class="absolute inset-0 -z-10" aria-hidden="true">
  <!-- Respaldo estático: se ve mientras carga y en móvil/reduced-motion -->
  <img src="/images/hero/red-estatica.webp" alt="" class="h-full w-full object-cover opacity-60" />
  <HeroScene client:only="react" />
</div>
```

`HeroScene` decide si dibuja o no:

- No dibuja si `prefers-reduced-motion`, si la pantalla mide menos de 1024px, o si el navegador no soporta WebGL. En esos casos queda la imagen estática.
- `dpr={[1, 1.5]}`, `frameloop="demand"` cuando no está visible (IntersectionObserver), `gl={{ antialias: false, powerPreference: "low-power" }}`.
- Geometría con `InstancedMesh` para los nodos y un solo `LineSegments` para las conexiones.
- Se importa con `React.lazy` dentro de la isla para que Three.js se descargue después del contenido principal.

### Esqueleto

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function NetworkMesh() {
  const group = useRef<THREE.Group>(null!);
  const { positions, lines } = useMemo(() => buildNetwork(120, 2.4), []); // función propia
  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.05;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.15, 0.05);
  });
  return (
    <group ref={group}>
      {/* InstancedMesh de nodos con color #00A999 y LineSegments con opacidad 0.25 */}
    </group>
  );
}

export default function HeroScene() {
  // aquí: comprobaciones de reduced-motion, ancho y WebGL; si no pasa, return null
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: false, alpha: true }}>
      <NetworkMesh />
    </Canvas>
  );
}
```

La imagen `red-estatica.webp` se genera con una captura de la propia escena (`TODO:` crear tras implementar).

## 8. Componentes shadcn/ui que se usan

| Componente | Dónde | Sustituye a |
| --- | --- | --- |
| `Button` | Dentro de islas React (formularios) | `Button.astro` en páginas estáticas |
| `Sheet` | Menú móvil (isla `MobileMenu.tsx`, `client:media="(max-width: 1023px)"`) | `MobileMenu.astro` |
| `NavigationMenu` | Desplegable de servicios en escritorio (isla, `client:idle`) | `ServicesMenu.astro` |
| `Accordion` | FAQ si se quiere animación de altura | `Accordion.astro` |
| `Select`, `Input`, `Textarea`, `Checkbox`, `Label` | `ContactForm`, `ReclamoForm` | Campos nativos |
| `Dialog` | Confirmaciones y vista ampliada de proyectos | |
| `Tooltip` | Botón flotante de WhatsApp en escritorio | |

Regla: si un bloque no necesita estado, sigue siendo `.astro`. shadcn/ui solo entra donde ya hay una isla React o donde su accesibilidad (Radix) ahorra trabajo, como el menú y el desplegable.

## 9. Despliegue y rendimiento (lo que sí se toma del stack)

| Tecnología | Uso en Neolutions |
| --- | --- |
| Cloudflare (CDN) | Hospedar el sitio estático en Cloudflare Pages o poner Cloudflare delante del servidor. Caché de `/_astro/*` por 1 año (archivos con hash) |
| Priority Hints | `fetchpriority="high"` en la imagen o recurso LCP del hero; `fetchpriority="low"` en lo que está bajo el pliegue |
| Open Graph | Ya definido en `18-seo-analitica-rendimiento.md` |
| PWA | Opcional fase 2: `manifest.webmanifest` con nombre, íconos y colores de la marca para "agregar a inicio". Sin service worker al inicio |

### Presupuesto de JavaScript (portada, comprimido)

| Paquete | Máximo | Cuándo se carga |
| --- | --- | --- |
| Núcleo (GSAP + ScrollTrigger + SplitText + Lenis + scripts propios) | 60 KB | Al cargar |
| Islas de menú (React + Radix) | 50 KB | `client:idle` / `client:media` |
| Escena 3D (Three + fiber) | 200 KB | Después de cargar, solo escritorio |

Metas de Lighthouse móvil sin cambios: Rendimiento ≥ 90, LCP < 2.5 s, CLS < 0.1. En móvil no se descarga Three.js.

## 10. Criterios de aceptación

- `pnpm build` sin errores y sin `package-lock.json` en el repo.
- Lenis y ScrollTrigger sincronizados: las animaciones con `scrub` no tiemblan.
- Con "reducir movimiento" activado en el sistema: sin scroll suave, sin 3D y todo el contenido visible.
- En un celular (375px) no se descarga ningún archivo de Three.js (verificar en la pestaña Red).
- El menú móvil (Sheet) y el desplegable de servicios funcionan con teclado y lector de pantalla.
- Ninguna animación usa código, shaders o assets copiados de otro sitio.
