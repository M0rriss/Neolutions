# 02 · Setup del monorepo (pnpm)

Objetivo: dejar el repositorio listo para trabajar el frontend, con espacio reservado para el backend.

> Recordatorio: nunca `npm`. Dependencias y scripts con `pnpm`; herramientas puntuales con `npx` o `pnpm dlx`.

## 1. Archivos raíz

### `package.json`

```json
{
  "name": "neolutions-platform",
  "private": true,
  "packageManager": "pnpm@<versión que devuelva pnpm --version>",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "pnpm --filter @neolutions/web dev",
    "build": "pnpm -r build",
    "preview": "pnpm --filter @neolutions/web preview",
    "lint": "pnpm -r lint",
    "format": "prettier --write .",
    "test": "pnpm -r test"
  },
  "devDependencies": {}
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `.npmrc`

```ini
engine-strict=true
auto-install-peers=true
```

### `.gitignore`

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
package-lock.json
yarn.lock
.DS_Store
```

### `.env.example`

```dotenv
# Sitio
PUBLIC_SITE_URL=https://TODO-dominio.pe
PUBLIC_WHATSAPP_NUMBER=51913578930

# Analítica (fase 2, vacío desactiva)
PUBLIC_GA4_ID=
PUBLIC_META_PIXEL_ID=

# API (cuando exista el backend; vacío = envío simulado)
PUBLIC_API_URL=
```

## 2. Crear la app web

```bash
pnpm create astro@latest apps/web -- --template minimal --typescript strict --no-install --no-git
```

Luego, en `apps/web/package.json`, cambia `"name"` a `"@neolutions/web"` y ejecuta:

```bash
pnpm install
pnpm --filter @neolutions/web astro add react sitemap --yes
pnpm --filter @neolutions/web add @fontsource-variable/inter react-hook-form zod @hookform/resolvers
pnpm --filter @neolutions/web add -D prettier prettier-plugin-astro eslint @typescript-eslint/parser eslint-plugin-astro vitest
```

## 3. Paquete de tokens

Crear `packages/design-tokens/`:

```text
packages/design-tokens/
├── package.json      # "name": "@neolutions/design-tokens", "main": "tokens.css"
└── tokens.css        # variables de docs/frontend/11-design-system.md
```

Agregarlo a la web:

```bash
pnpm --filter @neolutions/web add @neolutions/design-tokens@workspace:*
```

## 4. Configuración de Astro

`apps/web/astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://TODO-dominio.pe",
  output: "static",
  trailingSlash: "never",
  integrations: [react(), sitemap()],
  i18n: { defaultLocale: "es", locales: ["es"] },
});
```

`apps/web/tsconfig.json`: extender `astro/tsconfigs/strict` y agregar alias:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

## 5. Carpetas reservadas

Crear vacías, con un `README.md` de una línea cada una:

```text
apps/admin/        # panel interno, fase 3
packages/api-client/  # cliente generado desde OpenAPI, fase backend
backend/           # Java Spring, ver docs/backend/20-backend-pendiente.md
infra/             # docker, rabbitmq, nginx
```

## Criterios de aceptación

- `pnpm install` termina sin errores y solo existe `pnpm-lock.yaml`.
- `pnpm dev` abre la página inicial de Astro en http://localhost:4321.
- `pnpm build` genera `apps/web/dist/`.
