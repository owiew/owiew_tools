/** Direção do arredondamento da divisão inteira. */
export type Rounding = "floor" | "ceil" | "round";

/**
 * Multiplica e divide inteiros com BigInt e arredonda na direção pedida.
 *
 * O quê: calcula a * b / d sem passar por float, com `floor` (para baixo),
 * `ceil` (para cima) ou `round` (meio para cima). O `mulDivRound` do módulo de
 * dinheiro só arredonda ao mais próximo; aqui precisamos das três direções.
 * Onde: todas as contas de CPM, impressões, alcance e verba deste domínio.
 * Entradas: a, b >= 0 e d > 0, todos inteiros seguros (o chamador já validou).
 * Saída: inteiro seguro, ou null se o resultado não couber em inteiro seguro
 * (o chamador converte em erro "overflow"). Nunca lança.
 */
export function mulDiv(a: number, b: number, d: number, mode: Rounding): number | null {
  if (![a, b, d].every(Number.isSafeInteger) || a < 0 || b < 0 || d <= 0) return null;
  const bd = BigInt(d);
  const num = BigInt(a) * BigInt(b);
  let q: bigint;
  if (mode === "floor") q = num / bd;
  else if (mode === "ceil") q = (num + bd - 1n) / bd;
  else q = (num * 2n + bd) / (bd * 2n);
  return q > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(q);
}
