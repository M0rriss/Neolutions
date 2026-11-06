# AGENTS.md · Neolutions Platform

Instrucciones para cualquier agente de IA (Claude Code, Codex, Cursor u otro) que trabaje en este repositorio. Léelas completas antes de crear o modificar archivos.

## Orden de lectura

1. Este archivo.
2. `docs/00-indice.md`: mapa de toda la documentación y orden de trabajo.
3. El archivo de la tarea que te pidan (por ejemplo `docs/frontend/13-home.md`).
4. `docs/frontend/19-plan-de-tareas.md`: tareas numeradas con criterios de aceptación.

## 1. Qué es este proyecto

Sitio web de **Neolutions Tecnology**, empresa de tecnología de Callao, Perú, que atiende a pequeñas empresas y emprendedores.

- **Objetivo principal:** convertir visitas en cotizaciones por WhatsApp (+51 913 578 930).
- **Servicios (7):** soporte técnico, cableado estructurado, cámaras de seguridad, páginas web, apps móviles, sistemas y automatización, SEO y SEM.
- **Público:** dueños de pequeños negocios sin área de sistemas.
- **Idioma de la interfaz:** español (Perú).
- **Orden de construcción:** primero el frontend (`apps/web`), después el backend (`backend/`).

## 2. Reglas obligatorias

1. **Nunca uses `npm`.** Ni `npm install`, ni `npm run`, ni `npm init`.
   - Instalar, agregar o quitar dependencias y ejecutar scripts: **`pnpm`**.
   - Ejecutar una herramienta puntual sin instalarla: **`npx`** está permitido (también `pnpm dlx`).
   - El único lockfile válido es `pnpm-lock.yaml`. Si aparece `package-lock.json` o `yarn.lock`, bórralo.
2. **Marca propia.** La estructura de la portada sigue un modelo de referencia (orden de secciones y tipo de bloques), descrito en `docs/frontend/13-home.md`. Todo el diseño visual, los textos, las imágenes y el código son de Neolutions. No descargues, copies ni reproduzcas código, textos, imágenes, logos, fuentes o estilos de sitios de terceros.
3. **Datos reales.** No inventes cifras, testimonios, clientes, logos, plazos ni precios. Si falta un dato, usa un `TODO:` visible en el contenido y avisa en tu respuesta.
4. **Celular primero.** Diseña y prueba primero a 375 px de ancho.
5. **Tokens de diseño.** Ningún color, tamaño de fuente o espaciado suelto en componentes: todo sale de `docs/frontend/11-design-system.md`.
6. **Sin secretos en el código.** Claves y tokens van en `.env` (no se versiona). Documenta cada variable en `.env.example`.
7. **Una tarea a la vez.** Sigue `docs/frontend/19-plan-de-tareas.md` en orden. Al terminar cada tarea, verifica sus criterios de aceptación antes de pasar a la siguiente.

## 3. Requisitos del entorno

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | 22 LTS o superior | Frontend |
| pnpm | La fijada en `packageManager` del `package.json` raíz | Dependencias y scripts |
| Java (JDK) | 21 LTS | Backend (fase posterior) |
| Docker y Docker Compose | Recientes | PostgreSQL y RabbitMQ (fase posterior) |

Instalar pnpm una vez por máquina:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

## 4. Comandos frecuentes

| Tarea | Comando |
| --- | --- |
| Instalar dependencias | `pnpm install` |
| Levantar la web | `pnpm dev` (http://localhost:4321) |
| Agregar dependencia a la web | `pnpm --filter @neolutions/web add <paquete>` |
| Agregar dependencia de desarrollo | `pnpm --filter @neolutions/web add -D <paquete>` |
| Integración de Astro | `pnpm --filter @neolutions/web astro add <integración>` |
| Herramienta puntual | `npx <paquete>` o `pnpm dlx <paquete>` |
| Build | `pnpm build` |
| Lint y formato | `pnpm lint` · `pnpm format` |
| Pruebas | `pnpm test` |
| Revisar tipos de Astro | `pnpm --filter @neolutions/web astro check` |

## 5. Antes de dar una tarea por terminada

- [ ] `pnpm lint`, `pnpm build` y `pnpm --filter @neolutions/web astro check` pasan sin errores.
- [ ] La página se ve bien a 375 px, 768 px y 1280 px.
- [ ] No hay `package-lock.json` ni `yarn.lock`.
- [ ] No hay textos, cifras ni imágenes inventados o tomados de otros sitios.
- [ ] Cada `TODO:` nuevo está listado en tu respuesta.
