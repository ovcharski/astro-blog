import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".astro/",
      ".husky/",
      ".vscode/",
      "node_modules/",
      "public/",
      "dist/",
    ],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: (await import("astro-eslint-parser")).default,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // TypeScript already checks these, and the core rules misread type-only
      // names (e.g. the global React namespace) as undefined or unused.
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
];
