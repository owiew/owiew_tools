import { type Result, fail, ok } from "../result";
import { type AppLocale } from "./locale";

/** Códigos de erro do parse de número decimal digitado por humano. */
export type ParseNumberError =
  | "empty"
  | "invalid"
  | "negative"
  | "too-many-decimals"
  | "too-large";

/** Forma aceita: prefixo, número com separadores, sufixo (sem dígitos nos afixos). */
const NUMBER_SHAPE = /^([^\d.,]*)([\d.,]+)([^\d.,]*)$/u;

/** Afixos aceitos ao redor do número: símbolo de moeda, código ISO em maiúsculas ou "%". */
const AFFIX = /^(?:[A-Z]{1,3}|\p{Sc}|[A-Z]{1,2}\p{Sc}|%)?$/u;

/** Teto de segurança: 10^12 unidades escaladas (evita estouro e abuso). */
const MAX_SCALED = 10 ** 12;

/**
 * Descobre qual separador (ponto ou vírgula) é o decimal.
 *
 * O quê: resolve a ambiguidade de "1.234" (mil em pt/es, decimal em en).
 * Onde: etapa interna de `parseScaled`.
 * Entradas: texto só com dígitos, '.' e ','; idioma do usuário.
 * Saída: o caractere decimal ou null (número inteiro).
 */
function decimalSeparator(text: string, locale: AppLocale): "." | "," | null {
  const dots = text.split(".").length - 1;
  const commas = text.split(",").length - 1;
  if (dots && commas) return text.lastIndexOf(".") > text.lastIndexOf(",") ? "." : ",";
  const sep = dots ? "." : commas ? "," : null;
  if (!sep) return null;
  const count = sep === "." ? dots : commas;
  if (count > 1) return null; // vários separadores iguais = milhar
  const digitsAfter = text.length - text.indexOf(sep) - 1;
  const groupsThousands = locale === "en" ? sep === "," : sep === ".";
  if (groupsThousands && digitsAfter === 3) return null;
  return sep;
}

/**
 * Converte texto digitado (com R$, espaços, milhar e decimal) em inteiro escalado.
 *
 * O quê: "R$ 1.234,56" com scale 2 vira 123456. Nunca usa float.
 * Onde: campos de dinheiro (scale 2 = centavos) e porcentagem (scale 2 = pontos
 * base) das calculadoras; a UI chama a cada digitação.
 * Entradas: texto cru, idioma (resolve milhar vs decimal), scale >= 0.
 * Saída: Result com o inteiro, ou código de erro estável. Sem efeitos.
 * Mais casas decimais do que `scale` é erro (nunca arredonda calado).
 */
export function parseScaled(
  input: string,
  locale: AppLocale,
  scale: number,
): Result<number, ParseNumberError> {
  const cleaned = input.replace(/[\s\u00a0\u202f]/g, "");
  if (cleaned === "") return fail("empty");
  const negative = /^[-\u2212]/.test(cleaned) || /^\(.*\)$/.test(cleaned);
  const shape = NUMBER_SHAPE.exec(cleaned.replace(/^[-\u2212(]/, "").replace(/\)$/, ""));
  if (!shape || !/\d/.test(shape[2] ?? "") || !AFFIX.test(shape[1] ?? "") || !AFFIX.test(shape[3] ?? "")) {
    return fail("invalid");
  }
  const body = shape[2] ?? "";
  if (negative) return fail("negative");
  const dec = decimalSeparator(body, locale);
  const [intRaw, fracRaw = ""] = dec ? splitAt(body, dec) : [body, ""];
  const intPart = intRaw.replace(/[.,]/g, "");
  if (/[.,]/.test(fracRaw) || (intPart === "" && fracRaw === "") || !validGrouping(intRaw)) {
    return fail("invalid");
  }
  if (fracRaw.length > scale) return fail("too-many-decimals");
  const scaled = Number(intPart + fracRaw.padEnd(scale, "0"));
  if (!Number.isSafeInteger(scaled) || scaled > MAX_SCALED) return fail("too-large");
  return ok(scaled);
}

/**
 * Divide o texto na última ocorrência do separador decimal.
 *
 * Onde: etapa interna de `parseScaled`. Entrada: texto e separador.
 * Saída: tupla [parte inteira, parte fracionária].
 */
function splitAt(text: string, sep: string): [string, string] {
  const i = text.lastIndexOf(sep);
  return [text.slice(0, i), text.slice(i + 1)];
}

/**
 * Confere se a parte inteira usa milhar bem formado ("1.234.567", não "1.23.4").
 *
 * Onde: etapa interna de `parseScaled`. Entrada: parte inteira com separadores.
 * Saída: true se não há separador ou se os grupos têm 1-3 dígitos seguidos de
 * grupos de exatamente 3.
 */
function validGrouping(intRaw: string): boolean {
  if (!/[.,]/.test(intRaw)) return true;
  return /^\d{1,3}([.,]\d{3})+$/.test(intRaw);
}
