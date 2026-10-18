/**
 * Varre o repositório e o HTML gerado atrás de emoji. Ícone é Lucide (SVG),
 * nunca emoji. Falha (exit 1) se achar. Setas e símbolos tipográficos (→ ÷ ×)
 * não contam: o filtro é Emoji_Presentation, pictográficos com seletor de
 * emoji (U+FE0F) e keycaps.
 * Uso: `npm run check:emoji` (depois do build, para varrer dist/ também).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".git", ".astro", ".npm-cache", ".tmp", ".lighthouseci", "coverage", "playwright-report", "test-results", "og"]);
const EXT = new Set([".ts", ".tsx", ".astro", ".js", ".mjs", ".json", ".css", ".md", ".html", ".yml", ".yaml", ".svg", ".txt", ".xml"]);
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\u20E3/u;
const hits = [];

/**
 * Percorre um diretório recursivamente procurando emoji nos arquivos de texto.
 *
 * Entrada: caminho do diretório. Efeito: acumula ocorrências em `hits`.
 */
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXT.has(extname(p)) && name !== "package-lock.json") {
      readFileSync(p, "utf8").split("\n").forEach((line, i) => {
        const m = line.match(EMOJI);
        if (m) hits.push(`${relative(root, p)}:${i + 1}: U+${m[0].codePointAt(0).toString(16).toUpperCase()}`);
      });
    }
  }
}
walk(root);
if (!existsSync(join(root, "apps/site/dist"))) console.warn("aviso: dist/ não existe; varredura só do código-fonte");
if (hits.length) {
  console.error(`emoji encontrado em ${hits.length} lugar(es):\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("check:emoji ok (nenhum emoji no código nem no HTML gerado)");
