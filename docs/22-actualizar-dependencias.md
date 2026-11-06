# 22 · Actualizar todas las dependencias a la última versión

Ejecutar **al terminar el frontend** (Tarea F13) y repetir cada vez que se retome el proyecto después de un tiempo. Objetivo: todo el workspace en la última versión estable, sin romper el build.

> Nunca `npm`. Actualizaciones con `pnpm`; herramientas puntuales con `npx` o `pnpm dlx`.

## 1. Versiones de referencia (consultadas el 6 de noviembre de 2026)

Son la línea base mínima. Si `pnpm outdated` muestra algo más nuevo, manda lo más nuevo.

| Paquete | Última versión | Nota |
| --- | --- | --- |
| `pnpm` | 12.18.0 | Fijar en `packageManager` |
| `astro` | 7.4.7 | Actualizar con `@astrojs/upgrade` |
| `@astrojs/react` | 7.1.4 | Debe ir junto con Astro |
| `react` / `react-dom` | 19.3.1 | **No usar 18.x.** Fiber 9 y Drei 10 exigen React 19 |
| `@types/react` / `@types/react-dom` | última 19.x | Deben coincidir con React 19 |
| `tailwindcss` / `@tailwindcss/vite` | 4.3.5 | Misma versión en ambos |
| `gsap` | 3.15.1 | |
| `@gsap/react` | 2.1.2 | |
| `lenis` | 1.3.27 | |
| `three` | 0.187.0 | `@types/three` a la misma versión menor |
| `@react-three/fiber` | 9.8.2 | Requiere React 19 |
| `@react-three/drei` | 10.7.9 | Requiere Fiber 9 |
| `shadcn` (CLI) | 4.23.0 | Se usa con `npx shadcn@latest` |
| `zod` | 4.6.7 | Ver cambios de API en la sección 5 |
| `react-hook-form` | 7.91.0 | `@hookform/resolvers` en su última versión |
| `typescript` | 7.0.2 | Usar la versión que acepte `astro check`; ver sección 5 |

## 2. Instrucción para Claude Code

Copia este prompt tal cual:

```text
Lee AGENTS.md y docs/frontend/22-actualizar-dependencias.md.
Actualiza todas las dependencias del workspace a la última versión estable
siguiendo los pasos del archivo, en orden. Nunca uses npm.
Después de cada paso ejecuta las verificaciones. Si algo se rompe,
corrígelo antes de continuar. Al final dame la tabla "antes / después"
de cada paquete y la lista de cambios de código que tuviste que hacer.
```

## 3. Pasos

### Paso 0 · Respaldo

```bash
git status                      # debe estar limpio
git checkout -b chore/actualizar-dependencias
pnpm outdated -r                # guardar la salida para la tabla "antes"
```

### Paso 1 · pnpm

```bash
corepack prepare pnpm@latest --activate
pnpm --version
```

Actualizar `"packageManager": "pnpm@<versión>"` en el `package.json` raíz con la versión mostrada.

### Paso 2 · Astro y sus integraciones

```bash
cd apps/web
npx @astrojs/upgrade
cd ../..
```

La herramienta oficial actualiza `astro` y todos los `@astrojs/*` juntos y muestra las guías de migración si hay cambio de versión mayor. Leer esas guías y aplicar los cambios que pidan.

Verificar:

```bash
pnpm --filter @neolutions/web astro check
pnpm build
```

### Paso 3 · React 19

```bash
pnpm --filter @neolutions/web add react@latest react-dom@latest
pnpm --filter @neolutions/web add -D @types/react@latest @types/react-dom@latest
```

Si el proyecto venía de React 18, revisar:

- `forwardRef` ya no es necesario: `ref` llega como prop normal (los componentes de shadcn actualizados ya lo usan así).
- `useFormState` pasó a llamarse `useActionState`.
- Eliminar `defaultProps` en componentes de función; usar valores por defecto en los parámetros.
- Reemplazar `ReactDOM.render` por `createRoot` si apareciera en algún sitio.

### Paso 4 · Todo lo demás

```bash
pnpm up -r --latest
pnpm install
```

`-r` recorre todos los paquetes del workspace y `--latest` ignora los rangos del `package.json`.

### Paso 5 · Componentes de shadcn/ui

shadcn copia código al repo, así que no se actualiza con `pnpm up`. Para cada componente de `src/components/react/ui/`:

```bash
cd apps/web
npx shadcn@latest diff
npx shadcn@latest add <componente> --overwrite   # solo los que tengan cambios
cd ../..
```

Antes de sobrescribir, revisar con `git diff` si el componente tenía cambios propios de Neolutions (colores, tamaños) y volver a aplicarlos.

### Paso 6 · Limpieza

```bash
rm -f package-lock.json apps/web/package-lock.json yarn.lock
pnpm dedupe
pnpm install
```

### Paso 7 · Verificación completa

```bash
pnpm lint
pnpm test
pnpm --filter @neolutions/web astro check
pnpm build
pnpm preview
```

Revisar en el navegador (375px y 1280px):

- [ ] Portada: hero con SplitText, escena 3D en escritorio, imagen fija en móvil.
- [ ] Scroll suave (Lenis) y animaciones con ScrollTrigger sin saltos.
- [ ] Menú móvil (Sheet) y desplegable de servicios con teclado.
- [ ] Tabla de servicios con filtros.
- [ ] Formulario de contacto: errores de validación y envío.
- [ ] Libro de Reclamaciones.
- [ ] Sin errores ni advertencias en la consola.
- [ ] Lighthouse móvil: Rendimiento ≥ 90, Accesibilidad ≥ 95, SEO ≥ 95.

### Paso 8 · Cierre

```bash
pnpm outdated -r        # debe salir vacío o solo con versiones beta
git add -A
git commit -m "chore: actualizar dependencias a las últimas versiones"
```

## 4. Si una actualización rompe algo

1. Identificar el paquete con `git diff pnpm-lock.yaml` y el mensaje de error.
2. Leer su guía de migración o el CHANGELOG de esa versión.
3. Corregir el código. Solo si no hay solución razonable, fijar la última versión que funciona (`pnpm --filter @neolutions/web add <paquete>@<versión>`), anotarlo en `docs/decisiones-de-versiones.md` con el motivo y abrir un `TODO:` para revisarlo.

## 5. Cambios conocidos que hay que aplicar

### Zod 4

En `features/leads/schema.ts` y `features/compliance/reclamoSchema.ts`:

| Zod 3 | Zod 4 |
| --- | --- |
| `{ errorMap: () => ({ message: "..." }) }` | `{ error: "..." }` |
| `{ message: "..." }` en validadores | `{ error: "..." }` (el anterior sigue funcionando pero está obsoleto) |
| `z.string().email()` | `z.email()` |

Ejemplo:

```ts
consent: z.literal(true, { error: "Necesitamos tu autorización para responderte" }),
```

`@hookform/resolvers` debe estar en su última versión para aceptar esquemas de Zod 4.

### TypeScript 7

TypeScript 7 es la nueva versión nativa del compilador. Si `astro check` o algún plugin todavía no la acepta, mantener la última 5.x o 6.x que funcione, registrarlo en `docs/decisiones-de-versiones.md` y volver a probar en la siguiente actualización.

### React Three Fiber 9 y Drei 10

- Requieren React 19; no actualizar uno sin el otro.
- Revisar que los tipos de `three` (`@types/three`) estén en la misma versión menor que `three`.

### Tailwind 4

- `tailwindcss` y `@tailwindcss/vite` siempre en la misma versión.
- La configuración vive en `@theme` dentro de `global.css`; no crear `tailwind.config.js`.
