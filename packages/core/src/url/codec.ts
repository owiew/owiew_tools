import { type Result, fail, ok } from "../result";

/** Erro de decodificação. */
export type DecodeError = "malformed";

/**
 * Codifica texto como componente de URL (UTF-8, %XX).
 *
 * Onde: aba "codificar" do inspetor. Entrada: texto qualquer.
 * Saída: texto codificado; surrogate solto vira U+FFFD em vez de lançar erro.
 */
export function encodeComponent(text: string): string {
  return encodeURIComponent(text.toWellFormed());
}

/**
 * Decodifica componente de URL sem nunca lançar exceção.
 *
 * Onde: aba "decodificar" e leitura de parâmetros no inspetor.
 * Entradas: texto codificado e flag para tratar '+' como espaço (formulário).
 * Saída: Result com texto, ou "malformed" se houver % inválido.
 */
export function decodeComponent(text: string, plusAsSpace = false): Result<string, DecodeError> {
  try {
    return ok(decodeURIComponent(plusAsSpace ? text.replace(/\+/g, " ") : text));
  } catch {
    return fail("malformed");
  }
}
