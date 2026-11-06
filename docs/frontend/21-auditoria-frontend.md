# 21 · Auditoría del frontend

Resultado de construir F01 a F12 y revisar cada documento contra lo instalado. Fecha: 6 de noviembre de 2026.

> **El frontend no está completo.** Mientras se construía se agregaron `11b-stack-ui-y-animaciones.md` y las tareas F02b y F08b, que siguen sin hacer. Ver sección 8.

## 1. Estado

| Revisión | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | Correcto |
| `pnpm audit` | Sin vulnerabilidades |
| `pnpm lint` | Sin errores |
| `pnpm test` | 15 pruebas pasan |
| `astro check` | 0 errores (100 archivos) |
| `pnpm build` | 17 páginas, 15 URLs en el sitemap |
| Títulos y descripciones | Únicos, dentro de 60 y 160 caracteres |
| HTML generado | Un `h1` por página, sin saltos de encabezado, JSON-LD válido, sin enlaces internos rotos |
| Comportamiento (Chrome, producción) | Menús, filtros y formularios funcionan con teclado |
| Ancho 375, 768 y 1280 px | Ningún elemento se sale del viewport en 11 páginas |
| Contraste y nombres accesibles | Sin fallos en 9 páginas, a 375 y 1280 px |

Medido en local con 4G lenta y CPU 4x, tres corridas por página. Es optimista frente a un servidor real.

| Página | LCP | CLS | JS comprimido |
| --- | --- | --- | --- |
| Inicio | 0.6 a 0.8 s | 0.003 | 2.1 KB (meta < 30 KB) |
| Servicio | 0.8 s | 0.002 | 1.6 KB |
| Contacto | 0.5 a 0.6 s | 0 | **108.6 KB (meta 60 KB, no se cumple)** |

## 2. Metas sin cumplir o sin verificar

| Punto | Estado | Detalle |
| --- | --- | --- |
| JS de `/contacto` y del Libro | **No cumple** | `react-dom` solo pesa 65.7 KB comprimido, más que toda la meta. Con React no se puede cumplir. Ver sección 5 |
| Lighthouse | **Sin ejecutar** | El control de permisos bloqueó ejecutar `lighthouse@latest` por ser código descargado; también lo exige el doc 22. No hay notas oficiales de Rendimiento, Accesibilidad ni SEO |
| validator.schema.org | **Sin ejecutar** | Se comprobó que el JSON-LD es válido como JSON, no contra el validador |
| Lector de pantalla real | **Sin ejecutar** | Atributos y `role="alert"` comprobados; falta probar con NVDA o TalkBack |
| Barra superior | Diferencia aceptada | Mide 40 px por la spec; el resto de controles cumple 44 px |

## 3. Bloqueantes antes de publicar

1. **Los formularios no envían nada.** Sin backend, `ContactForm` simula el envío y lleva a `/gracias`: el visitante cree que escribió y la solicitud se pierde. Si se publica antes del backend, conviene ocultar el formulario y dejar solo WhatsApp.
2. **El Libro de Reclamaciones es una obligación legal.** Hoy no guarda nada y muestra un aviso de simulación con un número ficticio. No debe publicarse así.
3. **Textos legales.** Llevan el aviso `TODO: revisar con abogado`, visible también en producción a propósito.
4. **Dominio.** `PUBLIC_SITE_URL` y `public/robots.txt` tienen un valor provisional, que afecta a canonical, Open Graph y sitemap.

## 4. Problemas encontrados en los documentos

### Corregidos en el código

| Documento | Problema | Solución |
| --- | --- | --- |
| 02 | `pnpm create astro` se queda esperando respuesta | Agregar `--yes` |
| 02 | No instala `@astrojs/check` ni `typescript`, y sin ellos `astro check` se queda esperando | Instalados |
| 02 | `prettier` no está en la raíz, y faltan los scripts `lint` y `test` en la web | Agregados |
| 02 | `process.env.PUBLIC_SITE_URL` no lee `.env` en `astro.config` | `process.loadEnvFile` |
| 11 | `accent-500` da 4.49:1 sobre `brand-700` y 2.74:1 sobre claro | Texto con `accent-400`; token nuevo `--color-link-on-light` |
| 11, 14, 16 | `WhatsAppButton` recibe un slug, pero `whatsappLink` espera un objeto | El botón busca el servicio por su slug |
| 13 | "Cotizar este bloque" no tiene mensaje definido | `whatsappMessage` en `serviceGroups.ts` |
| 13 | Dice "9 secciones de fase 1", pero la tabla lista 10 | Se siguió la tabla |
| 16 | `z` desde `astro:content` | `astro/zod` |
| 16 | `?? ` no cubre variables de entorno vacías | Se usa `\|\|` |
| 17 | `errorMap` se ignora en Zod 4 y se perdía el mensaje de autorización | `error:`, con prueba |
| 17 | `website.max(0)` bloquea sin aviso, con lo que un bot detecta la trampa | Se descarta en `submitLead` y el bot ve éxito |
| 18 | `seoTitle` de hasta 60 caracteres más ` · Neolutions` supera el máximo | La marca se agrega solo si cabe |
| 18 | Preguntas con `TODO:` entrarían al JSON-LD | Se excluyen, y en producción no se muestran |
| 19 | `/_ui` no puede ser un archivo: Astro ignora los que empiezan con `_` | Ruta dinámica, ya borrada en F12 |
| 10 | Faltaban íconos de cerrar, chevron, más, libro y valores | Agregados |
| 12 | El botón flotante tapaba el enlace del Libro en el footer | Más margen inferior |

### Requieren decisión

| Documento | Problema |
| --- | --- |
| 17 | Meta de 60 KB imposible con React (ver sección 5) |
| 12, 18 | `CookieBanner` es React y está en todas las páginas: al activar la analítica, la portada pasaría de los 30 KB. Hoy no se renderiza. Ver sección 5 |
| 15, 16 | Citan un "documento de contenidos" que no está en la carpeta |
| 20 | Cita un documento "Arquitectura técnica" que no está en la carpeta |
| AGENTS | Pide Java 21 y hay Java 17 instalado (solo afecta al backend) |

Los ejemplos de código de 02, 16 y 17 quedaron desactualizados frente a Astro 7 y Zod 4. No se editaron: el código es la referencia actual.

## 5. Recomendaciones

- **Peso de formularios:** la idea inicial de cambiar a Preact queda **descartada**: la escena 3D de 11b exige React 19. Lo razonable es subir la meta de `/contacto` a unos 110 KB. La página sigue rápida porque el formulario carga con `client:visible`.
- **Banner de cookies:** queda por decidir junto con el presupuesto de la sección 8. Si la portada ya carga React por los menús, reescribirlo sin React deja de ahorrar.

## 6. Dependencias fijadas a propósito

El detalle, con motivos y cuándo revisar cada una, está en `docs/decisiones-de-versiones.md`.

## 7. Datos pendientes del negocio

Todo lo marcado `TODO` queda fuera de producción, salvo los avisos legales.

| Dato | Dónde |
| --- | --- |
| Logo oficial | `public/logo/*.svg`, `components/layout/Logo.astro`, `public/favicon.svg` |
| Imagen para redes (1200x630), hoy provisional | `public/og-default.jpg` |
| Dominio | `.env`, `public/robots.txt` |
| Años de experiencia | `data/trust.ts` |
| Horario de atención | `data/site.ts` |
| Razón social, RUC y domicilio | `data/site.ts`, `pages/legal/privacidad.astro` |
| Zona de atención: ¿solo Lima y Callao? | `data/site.ts`, `docs/01` |
| ¿Atienden en el local, remoto o ambos? | `content/faq/general-atencion.md` |
| Garantía | `content/faq/general-garantia.md`, `pages/legal/terminos.astro` |
| Formas de pago | `content/faq/general-pagos.md`, `pages/legal/terminos.astro` |
| Vigencia de las cotizaciones | `pages/legal/terminos.astro` |
| Plazo de conservación de datos y canal ARCO | `pages/legal/privacidad.astro` |
| Validar qué incluye cada servicio (6 borradores) | `content/servicios/*.md`, excepto cámaras |
| Validar las preguntas por servicio | `content/faq/<servicio>-*.md` |
| Textos de los 5 valores | `data/about.ts` |
| Foto y frase del fundador, y colaboradores | `data/about.ts`, `public/images/equipo/` |
| Campos del Libro de Reclamaciones con INDECOPI | `features/compliance/reclamoSchema.ts` |
| Fotos reales de trabajos y servicios | `public/images/` |

## 8. Pendiente por 11b, 13 y 19 (actualizados durante la construcción)

Sin hacer:

- **F02b:** Tailwind con `@theme`, shadcn/ui, GSAP, Lenis, `lib/motion/*`, `Reveal` y `SplitHeading`.
- **F08b:** catálogo de animaciones, `HeroScene` y `NetworkMesh`, `Sheet`, `NavigationMenu` y efecto magnético.
- **Imagen `public/images/hero/red-estatica.webp`:** se genera al terminar la escena 3D.

Lo ya construido que incumple 11b y debe cambiar en F08b:

| Archivo | Problema | Regla de 11b |
| --- | --- | --- |
| `sections/Process.astro` | La señal del "cable" anima `top` y `left`, y se repite sin fin | Reglas 2 y 6 |
| `sections/Hero.astro` | El punto de la tarjeta pulsa sin fin | Regla 6 |

Conflictos entre documentos que hay que resolver antes de F02b:

| Documentos | Conflicto |
| --- | --- |
| 18 y 11b | 18 pide menos de 30 KB de JS en la portada y "sin islas React". 11b permite 60 KB de núcleo, 50 KB de menús y 200 KB de 3D |
| 11b | Reserva 50 KB para las islas de menú (React + Radix), pero `react-dom` solo pesa 65.7 KB comprimido. Ese límite no se puede cumplir |
| 19 y 18 | Hoy la portada usa 2.1 KB y tiene LCP de 0.6 a 0.8 s. Hay que confirmar que las metas se mantienen con todo el stack |
| 11 y 11b | 11 anima con 12 px y un script propio; 11b usa 24 px con GSAP. Los tokens pasan de `tokens.css` a `@theme` |
| 12 y 11b | `MobileMenu.astro` y `ServicesMenu.astro` funcionan sin React; 11b los cambia por islas. Es la mayor causa del peso nuevo |

## 9. Actualización de dependencias (doc 22)

Ejecutada en la rama `chore/actualizar-dependencias`. `main` no cambió.

| Paquete | Antes | Después |
| --- | --- | --- |
| `pnpm` | 10.32.1 | **12.18.0** |
| `astro` y demás directas | Ya en su última versión | Sin cambios |
| `typescript` | 6.0.3 | 6.0.3 (fijada, última 7.0.2) |
| `eslint-plugin-astro` | 1.7.0 | 1.7.0 (fijada, última 3.2.1) |

Cambios necesarios: ajustes de `.npmrc` movidos a `pnpm-workspace.yaml`, `.npmrc` eliminado, y lockfile regenerado para cumplir la política de antigüedad de pnpm 12.

Lo que el doc 22 pide y no se hizo:

| Paso | Motivo |
| --- | --- |
| 2: `npx @astrojs/upgrade` | El control de permisos bloqueó ejecutar código descargado. No hacía falta: Astro ya estaba en su última versión |
| 5: componentes de shadcn | shadcn aún no está instalado (F02b) |
| 7: SplitText, 3D, Lenis, Sheet | Aún no existen (F02b y F08b) |
| 7: Lighthouse | Bloqueado, igual que en la sección 2 |

Correcciones para el doc 22: el prompt cita `docs/frontend/22-...`, pero el archivo está en `docs/22-...`; menciona una Tarea F13 que no existe en el plan; `02-setup-monorepo.md` todavía pide crear `.npmrc`; y exige repositorio git, que no existía.
