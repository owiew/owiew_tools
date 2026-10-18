/**
 * Resultado tipado sem exceção: o chamador é obrigado a tratar o erro.
 *
 * O quê: união discriminada `ok: true | false`.
 * Onde: devolvido por toda função do core que valida entrada de usuário
 * (parse de dinheiro, UTM, ROAS), consumida pelas ilhas de UI em apps/site.
 */
export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Constrói um resultado de sucesso.
 *
 * Onde: usada por todos os módulos do core ao devolver valor válido.
 * Entrada: o valor. Saída: `{ ok: true, value }`. Sem efeitos.
 */
export function ok<T>(value: T): { readonly ok: true; readonly value: T } {
  return { ok: true, value };
}

/**
 * Constrói um resultado de falha com código de erro estável (não é texto de UI).
 *
 * Onde: usada pelos módulos do core; a UI traduz o código por idioma.
 * Entrada: código de erro. Saída: `{ ok: false, error }`. Sem efeitos.
 */
export function fail<E extends string>(error: E): { readonly ok: false; readonly error: E } {
  return { ok: false, error };
}
