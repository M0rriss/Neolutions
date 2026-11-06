# 10 · Estructura de carpetas del frontend

Árbol completo de `apps/web`. Crea las carpetas en la Tarea F01 y los archivos a medida que cada tarea los pida.

```text
apps/web/
├── astro.config.mjs
├── package.json                      # "name": "@neolutions/web"
├── tsconfig.json
├── .prettierrc
├── eslint.config.js
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── og-default.jpg                # TODO: imagen 1200x630 de la marca
│   ├── logo/
│   │   ├── neolutions-claro.svg      # para fondos oscuros
│   │   └── neolutions-oscuro.svg     # para fondos claros
│   └── images/
│       ├── hero/                     # fotos reales de trabajos
│       ├── servicios/                # una imagen por servicio (<slug>.webp)
│       ├── proyectos/                # fase 2
│       └── equipo/
└── src/
    ├── env.d.ts
    ├── content.config.ts             # esquemas de las colecciones
    │
    ├── pages/
    │   ├── index.astro                       # Inicio
    │   ├── servicios/
    │   │   ├── index.astro                   # tabla completa de servicios
    │   │   └── [slug].astro                  # página de cada servicio
    │   ├── nosotros.astro
    │   ├── contacto.astro
    │   ├── gracias.astro                     # tras enviar formulario
    │   ├── proyectos/                        # fase 2
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   ├── blog/                             # fase 2
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   ├── legal/
    │   │   ├── privacidad.astro
    │   │   ├── terminos.astro
    │   │   ├── cookies.astro
    │   │   └── libro-de-reclamaciones.astro
    │   └── 404.astro
    │
    ├── layouts/
    │   ├── BaseLayout.astro          # <html>, <head>, SEO, fuentes, analítica
    │   ├── PageLayout.astro          # AnnouncementBar + Header + main + Footer + WhatsAppFloat
    │   └── ServiceLayout.astro       # plantilla de página de servicio
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.astro
    │   │   ├── WhatsAppButton.astro
    │   │   ├── Badge.astro
    │   │   ├── Card.astro
    │   │   ├── SectionHeading.astro
    │   │   ├── Container.astro
    │   │   ├── Accordion.astro       # <details> nativo, sin JS
    │   │   └── icons/                # SVG propios como componentes .astro
    │   │       ├── IconWhatsApp.astro
    │   │       ├── IconSupport.astro
    │   │       ├── IconNetwork.astro
    │   │       ├── IconCamera.astro
    │   │       ├── IconWeb.astro
    │   │       ├── IconMobile.astro
    │   │       ├── IconAutomation.astro
    │   │       ├── IconSearch.astro
    │   │       ├── IconCheck.astro
    │   │       ├── IconArrowRight.astro
    │   │       └── IconMenu.astro
    │   ├── layout/
    │   │   ├── AnnouncementBar.astro
    │   │   ├── Header.astro
    │   │   ├── MobileMenu.astro      # <dialog> o <details>, sin framework
    │   │   ├── ServicesMenu.astro    # desplegable de servicios
    │   │   ├── Footer.astro
    │   │   └── WhatsAppFloat.astro
    │   ├── sections/                 # bloques de la portada, en orden
    │   │   ├── Hero.astro
    │   │   ├── TrustBar.astro
    │   │   ├── ServicesTable.astro
    │   │   ├── Process.astro
    │   │   ├── ServiceGroups.astro
    │   │   ├── WhyUs.astro
    │   │   ├── ProjectsPreview.astro # fase 2, se oculta sin datos
    │   │   ├── Testimonials.astro    # fase 2, se oculta sin datos
    │   │   ├── Faq.astro
    │   │   └── FinalCta.astro
    │   ├── service/                  # bloques de la página de servicio
    │   │   ├── ServiceHero.astro
    │   │   ├── ServiceProblem.astro
    │   │   ├── ServiceIncludes.astro
    │   │   ├── ServiceBenefits.astro
    │   │   ├── ServiceAudience.astro
    │   │   └── RelatedServices.astro
    │   └── islands/                  # React
    │       ├── ContactForm.tsx
    │       ├── ReclamoForm.tsx
    │       └── CookieBanner.tsx
    │
    ├── features/
    │   ├── leads/
    │   │   ├── schema.ts             # zod del formulario de contacto
    │   │   ├── submitLead.ts         # simulado hasta que exista el backend
    │   │   └── messages.ts           # textos de error y éxito
    │   └── compliance/
    │       ├── reclamoSchema.ts
    │       └── submitReclamo.ts
    │
    ├── content/
    │   ├── servicios/                # 7 archivos .md
    │   ├── faq/                      # preguntas generales y por servicio
    │   ├── proyectos/                # fase 2
    │   ├── testimonios/              # fase 2
    │   └── blog/                     # fase 2
    │
    ├── data/
    │   ├── site.ts                   # nombre, contacto, redes, horario
    │   ├── navigation.ts             # menú y footer
    │   ├── trust.ts                  # cifras reales de la barra de confianza
    │   ├── process.ts                # pasos de "Cómo trabajamos"
    │   ├── whyUs.ts                  # razones de "Por qué elegirnos"
    │   └── serviceGroups.ts          # 3 bloques de servicios
    │
    ├── lib/
    │   ├── whatsapp.ts               # arma enlaces wa.me
    │   ├── analytics.ts              # eventos GA4 y Meta (fase 2)
    │   ├── seo.ts                    # títulos, descripciones, JSON-LD
    │   └── format.ts
    │
    └── styles/
        ├── global.css                # reset, base, utilidades mínimas
        └── fonts.css
```

## Convenciones

| Tema | Regla |
| --- | --- |
| Nombres de componentes | PascalCase (`ServicesTable.astro`) |
| Rutas y slugs | kebab-case en español (`/servicios/camaras-de-seguridad`) |
| Imports | Alias `@/` para `src/` |
| Estilos | `<style>` con alcance en cada `.astro`, usando variables de tokens |
| JavaScript en cliente | Solo en `islands/` y scripts pequeños inline (menú móvil) |
| Datos | Nunca escritos dentro de un componente: vienen de `data/` o `content/` |
