import { SITE_URL, type Lang, LANGS } from "../i18n/locales";
import { type Category, type Tool } from "./types";

/**
 * Caminho da página inicial de um idioma.
 *
 * Onde: links de navegação, canonical e hreflang. Entrada: idioma.
 * Saída: caminho com barra final (ex.: "/en/").
 */
export function homePath(lang: Lang): string {
  return `/${lang}/`;
}

/**
 * Caminho da página de uma categoria.
 *
 * Onde: navegação, breadcrumb, sitemap. Entradas: categoria e idioma.
 * Saída: caminho com barra final.
 */
export function categoryPath(category: Category, lang: Lang): string {
  return `/${lang}/${category.i18n[lang].slug}/`;
}

/**
 * Caminho da página de uma ferramenta (categoria/slug localizados).
 *
 * Onde: cards, breadcrumb, sitemap, índice de busca. Entradas: ferramenta,
 * sua categoria e idioma. Saída: caminho com barra final.
 */
export function toolPath(tool: Tool, category: Category, lang: Lang): string {
  return `/${lang}/${category.i18n[lang].slug}/${tool.meta.i18n[lang].slug}/`;
}

/**
 * Transforma caminho em URL absoluta canônica.
 *
 * Onde: canonical, hreflang, JSON-LD, Open Graph. Entrada: caminho.
 * Saída: URL absoluta sobre SITE_URL.
 */
export function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Gera o mapa idioma -> caminho para uma página (alternates hreflang).
 *
 * Onde: layout base e seletor de idioma. Entrada: função que dá o caminho por
 * idioma. Saída: registro completo dos idiomas suportados.
 */
export function alternatesOf(pathFor: (lang: Lang) => string): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, pathFor(l)])) as Record<Lang, string>;
}
