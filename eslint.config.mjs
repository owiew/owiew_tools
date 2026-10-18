import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

// Regras da casa: sem any, sem @ts-ignore, sem catch vazio, sem teste silenciado.
export default [
  { ignores: ["**/dist/**", "**/.astro/**", "**/node_modules/**", "**/coverage/**", "**/.npm-cache/**", "**/.tmp/**", "**/public/og/**", "**/.lighthouseci/**", "**/playwright-report/**", "**/test-results/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "no-empty": ["error", { allowEmptyCatch: false }],
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-restricted-properties": ["error",
        { object: "describe", property: "skip", message: "Teste nunca é silenciado." },
        { object: "it", property: "skip", message: "Teste nunca é silenciado." },
        { object: "test", property: "skip", message: "Teste nunca é silenciado." },
        { object: "it", property: "only", message: "Remova o .only." },
        { object: "test", property: "only", message: "Remova o .only." },
      ],
    },
  },
  { files: ["scripts/**", "apps/site/scripts/**", "**/*.config.*"], languageOptions: { globals: { console: "readonly", process: "readonly", Buffer: "readonly", URL: "readonly" } }, rules: { "no-console": "off" } },
];
