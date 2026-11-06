// @ts-check
import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// astro.config no lee .env por su cuenta.
if (existsSync(".env")) process.loadEnvFile(".env");
const siteUrl = process.env.PUBLIC_SITE_URL || "https://TODO-dominio.pe";

export default defineConfig({
  site: siteUrl,
  output: "static",
  trailingSlash: "never",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(gracias|_ui)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  i18n: { defaultLocale: "es", locales: ["es"] },
});
