/**
 * Valida o registro de ferramentas (apps/site/tools/<id>/): estrutura, três
 * idiomas completos, FAQ >= 4, slugs únicos, ícone válido, tamanhos de
 * título/descrição. Falha (exit 1) em qualquer violação; ids de "related" que
 * ainda não existem são só avisos (outra unidade pode estar criando).
 * Uso: `npm run check:tools`.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { LANGS, ROOT, readCategories, readTools } from "../apps/site/scripts/inventory.mjs";

const errors = [];
const warnings = [];
const tools = readTools();
const categories = readCategories();
const iconSrc = readFileSync(join(ROOT, "src/components/ToolIcon.tsx"), "utf8");
const slugs = new Set();
const iconOk = (name) => new RegExp(`["\\s,{]"?${name}"?\\s*:`).test(iconSrc);
for (const c of categories) if (!iconOk(c.icon)) errors.push(`categories.json: ícone "${c.icon}" não está em ToolIcon.tsx`);

/**
 * Registra um erro de validação.
 *
 * Entradas: id da ferramenta e mensagem. Efeito: acumula em `errors`.
 */
function bad(id, msg) {
  errors.push(`tools/${id}: ${msg}`);
}

/**
 * Confere se um texto é não vazio.
 *
 * Entrada: valor qualquer. Saída: true se for string com conteúdo.
 */
const filled = (v) => typeof v === "string" && v.trim() !== "";

for (const t of tools) {
  const dir = join(ROOT, "tools", t.id);
  for (const f of ["tool.json", "content.json", "Page.astro", "Ui.tsx", "strings.ts"]) {
    if (!existsSync(join(dir, f))) bad(t.id, `falta ${f}`);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) bad(t.id, "id deve ser kebab-case");
  if (!categories.some((c) => c.id === t.category)) bad(t.id, `categoria inválida: ${t.category}`);
  if (!iconOk(t.icon)) bad(t.id, `ícone "${t.icon}" não está em src/components/ToolIcon.tsx`);
  if (!Number.isInteger(t.order)) bad(t.id, "order deve ser inteiro");
  for (const r of t.related ?? []) if (!tools.some((x) => x.id === r)) warnings.push(`tools/${t.id}: related "${r}" ainda não existe (ignorado no site)`);
  let content = {};
  try {
    content = JSON.parse(readFileSync(join(dir, "content.json"), "utf8"));
  } catch {
    bad(t.id, "content.json ausente ou inválido");
  }
  for (const lang of LANGS) {
    const i = t.i18n?.[lang];
    if (!i) { bad(t.id, `i18n.${lang} ausente`); continue; }
    for (const k of ["slug", "name", "title", "description", "summary"]) if (!filled(i[k])) bad(t.id, `${lang}.${k} vazio`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.slug ?? "")) bad(t.id, `${lang}.slug inválido`);
    if ((i.title ?? "").length > 75) bad(t.id, `${lang}.title com ${i.title.length} caracteres (máx. 75)`);
    if ((i.description ?? "").length < 70 || i.description.length > 175) bad(t.id, `${lang}.description com ${(i.description ?? "").length} caracteres (70 a 175)`);
    if (!Array.isArray(i.keywords) || i.keywords.length === 0) bad(t.id, `${lang}.keywords vazio`);
    const key = `${lang}/${t.category}/${i.slug}`;
    if (slugs.has(key)) bad(t.id, `slug duplicado: ${key}`);
    slugs.add(key);
    const c = content[lang];
    if (!c) { bad(t.id, `content.${lang} ausente`); continue; }
    if (!filled(c.howTo?.name) || (c.howTo?.steps ?? []).length < 2) bad(t.id, `${lang}: howTo precisa de nome e >= 2 passos`);
    if (!filled(c.formula?.title) || !(c.formula?.paragraphs ?? []).length) bad(t.id, `${lang}: formula precisa de título e parágrafos`);
    if ((c.examples ?? []).length < 1) bad(t.id, `${lang}: precisa de >= 1 exemplo`);
    const faq = c.faq ?? [];
    if (faq.length < 4) bad(t.id, `${lang}: FAQ com ${faq.length} perguntas (mínimo 4)`);
    if (faq.some((f) => !filled(f.q) || !filled(f.a))) bad(t.id, `${lang}: FAQ com pergunta/resposta vazia`);
  }
}
for (const w of warnings) console.warn(`aviso: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`erro: ${e}`);
  process.exit(1);
}
console.log(`check:tools ok (${tools.length} ferramentas, ${LANGS.length} idiomas, ${warnings.length} avisos)`);
