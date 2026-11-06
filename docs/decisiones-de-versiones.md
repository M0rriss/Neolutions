# Decisiones de versiones

Dependencias que no están en su última versión, o ajustes hechos para poder actualizarlas. Revisar esta lista en cada actualización (`docs/22-actualizar-dependencias.md`).

Última revisión: 6 de noviembre de 2026.

## Versiones fijadas

| Paquete | Fijado en | Última | Motivo | Cuándo revisar |
| --- | --- | --- | --- | --- |
| `typescript` | ~6.0 (6.0.3) | 7.0.2 | `astro check` se niega a correr con TypeScript 7, y `@astrojs/check` y `typescript-eslint` no lo admiten en sus dependencias | Cuando `astro check` lo soporte, o al adoptar `@astrojs/ts-content-mapper` |
| `eslint-plugin-astro` | ^1.7.0 | 3.2.1 | 2.x y 3.x exigen Node ^22.22.3, ^24.16.0 o ≥26.3.0; hay Node 24.14.0 | Al actualizar Node a 24.16 o superior |

## Overrides en `pnpm-workspace.yaml`

| Paquete | Versión | Motivo | Cuándo revisar |
| --- | --- | --- | --- |
| `@emnapi/core`, `@emnapi/runtime` | 1.11.3 | Con versiones distintas, `astro check` falla con `bridge.deleteEnv is not a function` | Al actualizar `@astrojs/check` |
| `minimatch` | ^11.0.1 | GHSA-g3hv-75wg-m249, llega por `@typescript-eslint` | Al actualizar `@typescript-eslint` |

## pnpm 12

- **Lanzador en Windows:** el pnpm 10 global instalado aparte no puede cambiarse solo a pnpm 12, porque su lanzador falla con "no se reconoce como un comando". `corepack pnpm` sí funciona. Para usar `pnpm` a secas, ejecutar `corepack enable` en una terminal de administrador; esto afecta a toda la máquina.
- **`.npmrc`:** pnpm 12 ignora ahí `engine-strict` y `auto-install-peers`, sin avisar. Viven en `pnpm-workspace.yaml` como `engineStrict` y `autoInstallPeers`.
- **Antigüedad mínima:** pnpm 12 rechaza paquetes publicados hace menos de un día. No se relajó esa política. Si un lockfile la incumple, regenerarlo con `pnpm clean --lockfile` y `pnpm install`.
- **Lockfile:** al regenerarlo, `minimatch` quedó en 11.0.4 porque 11.0.5 aún no cumplía la antigüedad mínima. Sigue siendo una versión corregida.
