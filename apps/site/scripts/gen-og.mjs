/**
 * Gera as imagens Open Graph estáticas (1200x630 PNG) por template, sem API de
 * imagem e sem rede. Cada ferramenta e a home de cada idioma ganham um PNG em
 * public/og/<idioma>/<id>.png. Usa `sharp` (Apache-2.0) para rasterizar o SVG.
 * Onde: `prebuild` do site. Fluxo: tool.json -> SVG do template -> PNG.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { LANGS, ROOT, readTools } from "./inventory.mjs";

const HOME = {
  "pt-br": { title: "Ferramentas gratuitas para tráfego pago", sub: "Rodam no seu navegador. Código aberto." },
  en: { title: "Free tools for paid media", sub: "They run in your browser. Open source." },
  es: { title: "Herramientas gratuitas para tráfico pago", sub: "Corren en tu navegador. Código abierto." },
};

/**
 * Escapa texto para dentro de SVG/XML.
 *
 * Entrada: texto. Saída: texto seguro para nó de texto.
 */
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Quebra o texto em linhas de no máximo `max` caracteres, por palavra.
 *
 * Entradas: texto e largura em caracteres. Saída: até 3 linhas (a última
 * recebe reticências se faltou espaço).
 */
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

/**
 * Monta o SVG do template (fundo escuro, acento índigo, marca textual).
 *
 * Entradas: título e subtítulo. Saída: texto SVG 1200x630.
 */
function template(title, sub) {
  const lines = wrap(title, 26);
  const tspans = lines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 76}">${esc(l)}</tspan>`).join("");
  const y = 250 - (lines.length - 1) * 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a0e1c"/><stop offset="1" stop-color="#1b2146"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>
<rect x="80" y="72" width="56" height="56" rx="14" fill="#4338ca"/>
<circle cx="108" cy="100" r="13" fill="none" stroke="#fff" stroke-width="7"/>
<text x="156" y="112" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#e8ecf8">owiew <tspan fill="#a5b4fc">tools</tspan></text>
<text x="80" y="${y}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${tspans}</text>
<text x="80" y="560" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="30" fill="#a6b0cb">${esc(sub)}</text>
<text x="1120" y="560" text-anchor="end" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="30" fill="#a5b4fc">tools.owiew.com</text>
</svg>`;
}

/**
 * Escreve um PNG de OG.
 *
 * Entradas: idioma, nome do arquivo (sem extensão), título e subtítulo.
 * Efeito: grava public/og/<idioma>/<nome>.png.
 */
async function write(lang, name, title, sub) {
  const dir = join(ROOT, "public/og", lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.png`), await sharp(Buffer.from(template(title, sub))).png({ compressionLevel: 9 }).toBuffer());
}

const tools = readTools();
for (const lang of LANGS) {
  await write(lang, "home", HOME[lang].title, HOME[lang].sub);
  for (const t of tools) await write(lang, t.id, t.i18n[lang].title, t.i18n[lang].summary);
}
console.log(`og: ${LANGS.length * (tools.length + 1)} imagens geradas`);
