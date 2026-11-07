// @ts-check
import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// astro.config no lee .env por su cuenta.
if (existsSync(".env")) process.loadEnvFile(".env");
// En Netlify, URL es el dominio principal del sitio (lo inyecta el build).
const siteUrl = process.env.PUBLIC_SITE_URL || process.env.URL || "https://TODO-dominio.pe";

export default defineConfig({
  site: siteUrl,
  output: "static",
  trailingSlash: "never",
  // ayuda.html en vez de ayuda/index.html: Netlify sirve /ayuda sin redirigir a /ayuda/.
  build: { format: "file" },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(gracias|_ui)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  i18n: { defaultLocale: "es", locales: ["es"] },
});
