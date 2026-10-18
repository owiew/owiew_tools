import categoriesJson from "../i18n/categories.json";
import { LANGS, type Lang } from "../i18n/locales";
import { type Category, type Tool, type ToolContent, type ToolMeta } from "./types";

/** Categorias na ordem do inventário. */
export const CATEGORIES = categoriesJson as unknown as readonly Category[];

const metas = import.meta.glob<ToolMeta>("../../tools/*/tool.json", { eager: true, import: "default" });
const contents = import.meta.glob<Record<Lang, ToolContent>>("../../tools/*/content.json", { eager: true, import: "default" });
const pages = import.meta.glob("../../tools/*/Page.astro", { eager: true, import: "default" });

/**
 * Extrai o nome da pasta da ferramenta de um caminho do glob.
 *
 * Onde: montagem do registro. Entrada: caminho tipo "../../tools/x/tool.json".
 * Saída: "x". Sem efeitos.
 */
function folderOf(path: string): string {
  return path.split("/").slice(-2, -1)[0] ?? "";
}

/**
 * Monta o registro de ferramentas a partir das pastas `tools/<id>/`.
 *
 * O quê: cruza tool.json, content.json e Page.astro pela pasta e valida o
 * mínimo (id igual à pasta, todos os idiomas presentes). O check completo
 * está em scripts/check-tools.mjs. Falha o build se uma pasta estiver torta.
 * Onde: executado no build (getStaticPaths das páginas e endpoint de busca).
 * Saída: lista ordenada por `order` e id. Sem efeitos externos.
 */
function buildRegistry(): Tool[] {
  const out: Tool[] = [];
  for (const [path, meta] of Object.entries(metas)) {
    const dir = folderOf(path);
    const content = contents[path.replace("tool.json", "content.json")];
    const page = pages[path.replace("tool.json", "Page.astro")];
    if (meta.id !== dir) throw new Error(`tools/${dir}: id "${meta.id}" difere do nome da pasta`);
    if (!content || !page) throw new Error(`tools/${dir}: faltam content.json ou Page.astro`);
    for (const lang of LANGS) {
      if (!meta.i18n[lang] || !content[lang]) throw new Error(`tools/${dir}: idioma ${lang} ausente`);
    }
    out.push({ meta, content, Page: page });
  }
  return out.sort((a, b) => a.meta.order - b.meta.order || a.meta.id.localeCompare(b.meta.id));
}

/** Todas as ferramentas do site. */
export const TOOLS: readonly Tool[] = buildRegistry();

/**
 * Lista as ferramentas de uma categoria.
 *
 * Onde: página de categoria, home, rodapé. Entrada: id da categoria.
 * Saída: ferramentas na ordem do registro.
 */
export function toolsIn(category: string): Tool[] {
  return TOOLS.filter((t) => t.meta.category === category);
}

/**
 * Resolve as ferramentas relacionadas, ignorando ids que ainda não existem.
 *
 * Onde: bloco "relacionadas" da página de ferramenta. Entrada: ferramenta.
 * Saída: lista de ferramentas existentes. Sem efeitos.
 */
export function relatedOf(tool: Tool): Tool[] {
  return tool.meta.related.flatMap((id) => TOOLS.filter((t) => t.meta.id === id));
}
