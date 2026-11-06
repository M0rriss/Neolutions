# 00 · Índice de la documentación

Esta carpeta describe todo lo que hay que construir. Cada archivo cubre un tema y se puede pasar a Claude Code por separado.

## Cómo usar estos archivos con Claude Code

1. Copia `AGENTS.md`, `CLAUDE.md` y la carpeta `docs/` a la raíz del repositorio vacío.
2. Abre Claude Code en esa carpeta.
3. Pide las tareas en orden, por ejemplo:

```text
Lee AGENTS.md y docs/frontend/19-plan-de-tareas.md. Ejecuta solo la Tarea F01
y verifica sus criterios de aceptación.
```

4. Revisa el resultado en el navegador antes de pedir la siguiente tarea.

## Archivos

| Archivo | Tema | Cuándo usarlo |
| --- | --- | --- |
| `01-vision-y-reglas.md` | Negocio, público, objetivo y tono | Siempre como contexto |
| `02-setup-monorepo.md` | Monorepo con pnpm y configuración base | Tarea F01 |
| `frontend/10-estructura-carpetas.md` | Árbol completo de `apps/web` | Tarea F01 y como referencia |
| `frontend/11-design-system.md` | Colores, tipografía, espaciado, componentes base | Tarea F02 |
| `frontend/11b-stack-ui-y-animaciones.md` | Tailwind, shadcn/ui, Radix, GSAP, Lenis, Three.js | Tareas F02b y F08b |
| `frontend/12-layout-global.md` | Barra superior, header, footer, botón flotante | Tarea F03 |
| `frontend/13-home.md` | Portada sección por sección | Tareas F04 a F07 |
| `frontend/14-paginas-servicio.md` | Plantilla de las 7 páginas de servicio | Tarea F08 |
| `frontend/15-paginas-internas.md` | Nosotros, Contacto, Gracias, legales, 404 | Tareas F09 y F10 |
| `frontend/16-contenido-y-datos.md` | Content Collections y archivos de datos | Tareas F02 y F08 |
| `frontend/17-islas-react.md` | Formularios y banner de cookies | Tarea F10 |
| `frontend/18-seo-analitica-rendimiento.md` | SEO, analítica, accesibilidad y velocidad | Tarea F11 |
| `frontend/19-plan-de-tareas.md` | Tareas numeradas con criterios de aceptación | Siempre |
| `frontend/21-auditoria-frontend.md` | Resultado de F01 a F12, pendientes y bloqueantes | Antes de publicar |
| `backend/20-backend-pendiente.md` | Qué viene después del frontend | Después de F12 |
| `22-actualizar-dependencias.md` | Actualizar el workspace a la última versión | Al retomar el proyecto |
| `decisiones-de-versiones.md` | Versiones fijadas y motivos | En cada actualización |

## Fases

| Fase | Alcance | Archivos |
| --- | --- | --- |
| Frontend | Sitio completo funcionando, formularios con envío simulado | `frontend/` |
| Backend | API Spring hexagonal, RabbitMQ, PostgreSQL; los formularios pasan a enviar de verdad | `backend/` |
