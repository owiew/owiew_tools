import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");

/**
 * Lê as URLs do sitemap gerado no build (caminhos, sem a origem).
 *
 * Onde: specs de a11y e SEO, para testar exatamente as páginas publicadas.
 * Saída: lista de caminhos como "/pt-br/calculadoras/calculadora-de-roas/".
 */
export function sitemapPaths(): string[] {
  const xml = readFileSync(join(DIST, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>https:\/\/tools\.owiew\.com([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
}

/** Caminhos de páginas de ferramenta (3 segmentos: idioma/categoria/slug). */
export function toolPaths(): string[] {
  return sitemapPaths().filter((p) => p.split("/").filter(Boolean).length === 3);
}

/**
 * Categorias sem ferramenta (fora do sitemap, noindex) que também precisam ser acessíveis.
 *
 * Só entram as que de fato ainda não estão no sitemap: assim, quando a categoria
 * recebe a primeira ferramenta, ela passa a ser testada pelo sitemap e não duplica o teste.
 */
export const EMPTY_CATEGORY_PATHS = ["/pt-br/utilidades/", "/en/utilities/", "/es/utilidades/"].filter((p) => !sitemapPaths().includes(p));

/**
 * Procura vestígios de template quebrado no texto visível de uma página.
 *
 * O quê: "undefined", "NaN", "[object Object]", "{{" e "${" indicam
 * interpolação que falhou. Onde: smoke de conteúdo das specs. Entrada: texto.
 * Saída: lista dos vestígios achados (vazia = limpo).
 */
export function findBadText(text: string): string[] {
  return ["undefined", "NaN", "[object Object]", "{{", "${", "null"].filter((bad) => new RegExp(`(^|[^\\p{L}])${bad.replace(/[$.{[\]]/g, "\\$&")}([^\\p{L}]|$)`, "u").test(text));
}

/**
 * Abre uma página de ferramenta e espera a ilha Preact hidratar.
 *
 * O quê: o HTML do build já traz a UI, mas digitar antes da hidratação perderia
 * o valor. O Astro remove o atributo `ssr` de <astro-island> quando hidrata.
 * Onde: specs de ferramenta. Entradas: página e caminho.
 */
export async function openHydrated(page: import("@playwright/test").Page, path: string): Promise<void> {
  await page.goto(path);
  await page.locator("astro-island[client]:not([ssr])").first().waitFor({ state: "attached" });
}
