import astro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";

export default [
  { ignores: ["dist/", ".astro/", "node_modules/"] },
  ...astro.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
