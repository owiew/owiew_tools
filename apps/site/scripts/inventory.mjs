/**
 * Inventário compartilhado pelos scripts de build (OG, sitemap, checks).
 * Lê `tools/<id>/tool.json` e `src/i18n/categories.json`; nenhum passo do
 * build mantém lista de ferramentas à mão.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_URL = "https://tools.owiew.com";
export const LANGS = ["pt-br", "en", "es"];
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Lê as categorias do inventário.
 *
 * Saída: lista de categorias (id, icon, i18n por idioma).
 */
export function readCategories() {
  return JSON.parse(readFileSync(join(ROOT, "src/i18n/categories.json"), "utf8"));
}

/**
 * Lê todas as ferramentas (uma pasta por ferramenta com tool.json).
 *
 * Saída: lista de metadados, ordenada por `order` e id.
 */
export function readTools() {
  const dir = join(ROOT, "tools");
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "tool.json")))
    .map((d) => JSON.parse(readFileSync(join(dir, d.name, "tool.json"), "utf8")))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/**
 * Caminho de página por tipo (espelha src/lib/urls.ts; o check-sitemap garante a paridade).
 *
 * Entradas: tipo, idioma e (categoria, ferramenta). Saída: caminho com barra final.
 */
export const paths = {
  home: (lang) => `/${lang}/`,
  category: (cat, lang) => `/${lang}/${cat.i18n[lang].slug}/`,
  tool: (tool, cat, lang) => `/${lang}/${cat.i18n[lang].slug}/${tool.i18n[lang].slug}/`,
};
