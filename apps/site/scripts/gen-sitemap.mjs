/**
 * Gera dist/sitemap.xml a partir do inventário de ferramentas (nunca à mão).
 * Inclui home, categorias com ferramentas e páginas de ferramenta, em cada
 * idioma, com alternates hreflang recíprocos (+ x-default) e lastmod do git.
 * Categorias vazias (noindex) ficam de fora. Onde: passo final do `build`.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LANGS, ROOT, SITE_URL, paths, readCategories, readTools } from "./inventory.mjs";

/**
 * Data do último commit que tocou um caminho (AAAA-MM-DD); hoje se não houver commit.
 *
 * Entrada: caminho relativo a ROOT. Saída: data ISO curta.
 */
function lastmod(rel) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (out) return out;
  } catch {
    // Sem git (tarball): cai para a data do build.
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * Monta um <url> com alternates.
 *
 * Entradas: função caminho-por-idioma, idioma da entrada e lastmod. Saída: XML.
 */
function urlEntry(pathFor, lang, mod) {
  const alt = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l === "pt-br" ? "pt-BR" : l}" href="${SITE_URL}${pathFor(l)}"/>`);
  alt.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${pathFor("pt-br")}"/>`);
  return `  <url>\n    <loc>${SITE_URL}${pathFor(lang)}</loc>\n${alt.join("\n")}\n    <lastmod>${mod}</lastmod>\n  </url>`;
}

const categories = readCategories();
const tools = readTools();
const toolMod = new Map(tools.map((t) => [t.id, lastmod(`apps/site/tools/${t.id}`)]));
const siteMod = [...toolMod.values(), lastmod("apps/site/src")].sort().at(-1);
const entries = [];
for (const lang of LANGS) {
  entries.push(urlEntry((l) => paths.home(l), lang, siteMod));
  for (const cat of categories) {
    if (!tools.some((t) => t.category === cat.id)) continue;
    entries.push(urlEntry((l) => paths.category(cat, l), lang, siteMod));
  }
  for (const t of tools) {
    const cat = categories.find((c) => c.id === t.category);
    entries.push(urlEntry((l) => paths.tool(t, cat, l), lang, toolMod.get(t.id)));
  }
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
const dist = join(ROOT, "dist");
if (!existsSync(dist)) throw new Error("dist/ não existe: rode o astro build antes");
writeFileSync(join(dist, "sitemap.xml"), xml);
console.log(`sitemap: ${entries.length} URLs`);
