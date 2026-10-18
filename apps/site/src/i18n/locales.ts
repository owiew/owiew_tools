/** Idiomas do site, na ordem de exibição; `pt-br` é o padrão. */
export const LANGS = ["pt-br", "en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "pt-br";

/** Valor do atributo `lang` do HTML por idioma. */
export const HTML_LANG: Record<Lang, string> = { "pt-br": "pt-BR", en: "en", es: "es" };

/** Valor de `og:locale` por idioma. */
export const OG_LOCALE: Record<Lang, string> = { "pt-br": "pt_BR", en: "en_US", es: "es_ES" };

/** Origem pública do site (usada em canonical, hreflang, JSON-LD e sitemap). */
export const SITE_URL = "https://tools.owiew.com";

/** Repositório público (código aberto, licença MIT). */
export const REPO_URL = "https://github.com/owiew/owiew_tools";

/**
 * Verifica se um texto é um idioma suportado.
 *
 * Onde: getStaticPaths e rotas dinâmicas. Entrada: texto qualquer.
 * Saída: type guard para `Lang`. Sem efeitos.
 */
export function isLang(value: string | undefined): value is Lang {
  return (LANGS as readonly string[]).includes(value ?? "");
}
