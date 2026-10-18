/**
 * Confere o sitemap contra o build: toda <loc> tem página em dist/, o
 * canonical da página bate com a <loc>, os alternates do sitemap são os mesmos
 * do HTML, páginas noindex não estão no sitemap, todo link interno do HTML
 * resolve para arquivo, e o robots.txt aponta o sitemap. Falha (exit 1) em
 * qualquer divergência. Também confere os links curtos `/<idioma>/<slug>/`
 * (redirect estático, noindex, fora do sitemap). Uso: `npm run check:sitemap` (depois do build).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const dist = join(root, "apps/site/dist");
const SITE = "https://tools.owiew.com";
const errors = [];

/**
 * Lista todos os arquivos .html do build.
 *
 * Entrada: diretório. Saída: lista de caminhos absolutos.
 */
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

/**
 * Converte um caminho do site no arquivo correspondente em dist/.
 *
 * Entrada: caminho (ex.: "/en/x/"). Saída: caminho do arquivo existente ou null.
 */
function fileFor(path) {
  const clean = decodeURIComponent(path.split("#")[0].split("?")[0]);
  for (const c of [join(dist, clean), join(dist, clean, "index.html"), join(dist, `${clean}.html`)]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
const locs = new Set();
for (const u of urls) {
  const loc = u.match(/<loc>(.*?)<\/loc>/)[1];
  locs.add(loc);
  const file = fileFor(loc.replace(SITE, ""));
  if (!file) { errors.push(`sitemap: ${loc} não existe em dist/`); continue; }
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<link rel="canonical" href="${loc}"`)) errors.push(`${loc}: canonical diferente da <loc>`);
  if (/<meta name="robots" content="noindex/.test(html)) errors.push(`${loc}: página noindex no sitemap`);
  const smAlt = [...u.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]}=${m[2]}`).sort();
  const htmlAlt = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]}=${m[2]}`).sort();
  if (JSON.stringify(smAlt) !== JSON.stringify(htmlAlt)) errors.push(`${loc}: alternates do sitemap diferem do HTML`);
  for (const a of smAlt) if (!locs.has(a.split("=")[1]) && !urls.some((x) => x.includes(`<loc>${a.split("=")[1]}</loc>`))) errors.push(`${loc}: alternate sem entrada própria (${a})`);
}

// Links curtos: toda página de ferramenta (3 segmentos) tem `/<idioma>/<slug>/` em dist/, com canonical
// para o destino, refresh imediato, noindex e link visível, e NUNCA está no sitemap.
let shorts = 0;
for (const loc of locs) {
  const parts = loc.replace(SITE, "").split("/").filter(Boolean);
  if (parts.length !== 3) continue;
  const [lang, , slug] = parts;
  const canonical = loc.replace(SITE, "");
  const short = `/${lang}/${slug}/`;
  shorts++;
  if (locs.has(`${SITE}${short}`)) errors.push(`${short}: link curto está no sitemap`);
  const file = fileFor(short);
  if (!file) { errors.push(`${short}: link curto sem página em dist/`); continue; }
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<link rel="canonical" href="${loc}"`)) errors.push(`${short}: canonical não aponta ${loc}`);
  if (!html.includes(`<meta http-equiv="refresh" content="0;url=${canonical}"`)) errors.push(`${short}: sem meta refresh para ${canonical}`);
  if (!/<meta name="robots" content="noindex/.test(html)) errors.push(`${short}: link curto sem noindex`);
  if (!html.includes(`<a href="${canonical}">`)) errors.push(`${short}: sem link visível para ${canonical}`);
}
if (shorts === 0) errors.push("nenhuma página de ferramenta no sitemap: a checagem de links curtos não rodou");

let links = 0;
for (const f of htmlFiles(dist)) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    links++;
    if (!fileFor(href)) errors.push(`${relative(dist, f)}: link interno quebrado ${href}`);
  }
}
const robots = readFileSync(join(dist, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) errors.push("robots.txt não aponta o sitemap");
if (errors.length) {
  for (const e of errors) console.error(`erro: ${e}`);
  process.exit(1);
}
console.log(`check:sitemap ok (${urls.length} URLs, ${shorts} links curtos, ${links} links internos verificados)`);
