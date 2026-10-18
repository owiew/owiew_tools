import { type AppLocale, intlLocale } from "./locale";
import { type ParseNumberError, parseScaled } from "./parse-scaled";
import { type Result } from "../result";

/**
 * Lê um valor em dinheiro digitado e devolve centavos inteiros.
 *
 * Onde: todo campo monetário das calculadoras.
 * Entradas: texto cru e idioma. Saída: Result com centavos inteiros.
 */
export function parseMoneyToCents(input: string, locale: AppLocale): Result<number, ParseNumberError> {
  return parseScaled(input, locale, 2);
}

/**
 * Lê uma porcentagem digitada e devolve pontos-base inteiros (40,5% = 4050).
 *
 * Onde: campo de margem do ROAS. Entradas: texto cru e idioma.
 * Saída: Result com pontos-base (0 a 10000 é validado por quem usa).
 */
export function parsePercentToBp(input: string, locale: AppLocale): Result<number, ParseNumberError> {
  return parseScaled(input, locale, 2);
}

/**
 * Formata centavos como moeda no idioma do usuário.
 *
 * Onde: exibição de resultados nas calculadoras.
 * Entradas: centavos inteiros, código ISO 4217, idioma. Saída: texto.
 * Usa só Intl (sem rede). Moeda desconhecida cai para o código puro.
 */
export function formatCents(cents: number, currency: string, locale: AppLocale): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/**
 * Formata um número com casas fixas no idioma do usuário.
 *
 * Onde: ROAS (razão) e porcentagens exibidas. Entradas: valor, casas, idioma.
 * Saída: texto (ex.: "3,25"). Sem efeitos.
 */
export function formatNumber(value: number, digits: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Formata pontos-base como porcentagem (4050 vira "40,50%").
 *
 * Onde: margem e lucro percentual. Entradas: pontos-base, idioma.
 * Saída: texto. Sem efeitos.
 */
export function formatBp(bp: number, locale: AppLocale): string {
  return `${formatNumber(bp / 100, 2, locale)}%`;
}
