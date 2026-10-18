import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

// Site 100% estático: sem adapter, sem SSR, sem backend (tudo roda no navegador).
export default defineConfig({
  site: "https://tools.owiew.com",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [preact()],
  devToolbar: { enabled: false },
  compressHTML: true,
});
