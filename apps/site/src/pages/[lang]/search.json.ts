import { type APIRoute } from "astro";
import { LANGS, type Lang } from "../../i18n/locales";
import { CATEGORIES, TOOLS } from "../../lib/registry";
import { toolPath } from "../../lib/urls";

/**
 * Gera os três caminhos estáticos do índice de busca (um por idioma).
 *
 * Onde: build do Astro. Saída: params por idioma.
 */
export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang }, props: { lang } }));
}

/**
 * Remove acento e caixa para comparar na busca (mesma regra do cliente).
 *
 * Onde: montagem do índice. Entrada: texto. Saída: texto normalizado.
 */
function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Endpoint estático /<lang>/search.json: nome, resumo, URL e texto pesquisável
 * de cada ferramenta. Consumido pelo componente Search (mesma origem).
 */
export const GET: APIRoute = ({ props }) => {
  const lang = (props as { lang: Lang }).lang;
  const entries = TOOLS.map((tool) => {
    const category = CATEGORIES.find((c) => c.id === tool.meta.category)!;
    const i = tool.meta.i18n[lang];
    return {
      name: i.name,
      summary: i.summary,
      url: toolPath(tool, category, lang),
      haystack: fold([i.name, i.title, i.summary, category.i18n[lang].name, ...i.keywords].join(" ")),
    };
  });
  return new Response(JSON.stringify(entries), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
