/** Idiomas do site, no formato usado nas URLs (`/pt-br/`, `/en/`, `/es/`). */
export type AppLocale = "pt-br" | "en" | "es";

/** Lista ordenada dos idiomas suportados; `pt-br` é o padrão. */
export const APP_LOCALES: readonly AppLocale[] = ["pt-br", "en", "es"];

/**
 * Converte o idioma do site no código BCP-47 que o `Intl` espera.
 *
 * Onde: formatação de moeda e número em todas as ferramentas.
 * Entrada: idioma do site. Saída: código BCP-47. Sem efeitos.
 */
export function intlLocale(locale: AppLocale): string {
  if (locale === "pt-br") return "pt-BR";
  if (locale === "es") return "es";
  return "en-US";
}

/**
 * Moeda sugerida por idioma quando o usuário ainda não escolheu uma.
 *
 * Onde: valor inicial do seletor de moeda das calculadoras.
 * Entrada: idioma. Saída: código ISO 4217. Sem efeitos.
 */
export function defaultCurrency(locale: AppLocale): string {
  if (locale === "pt-br") return "BRL";
  if (locale === "es") return "EUR";
  return "USD";
}
