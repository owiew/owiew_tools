/**
 * Calcula round(prod(nums) / prod(dens)) em BigInt, sem float, meio-para-cima.
 *
 * O quê: multiplica vários inteiros e divide por vários, arredondando uma só vez
 * (evita arredondamento duplo em contas encadeadas como ticket x compras x margem).
 * Onde: `calcCpaLtv` e `cacFromBudget`, em toda conta que cruza centavos, pontos-base
 * e centésimos de compra. Entradas: fatores e divisores, inteiros seguros >= 0.
 * Saída: inteiro seguro, ou null se algum divisor for zero, se a entrada violar o
 * contrato ou se o resultado não couber em inteiro seguro (o chamador vira "overflow").
 * Sem efeitos nem exceções.
 */
export function roundMulDiv(nums: readonly number[], dens: readonly number[]): number | null {
  if (![...nums, ...dens].every((v) => Number.isSafeInteger(v) && v >= 0)) return null;
  const num = nums.reduce((acc, v) => acc * BigInt(v), 1n);
  const den = dens.reduce((acc, v) => acc * BigInt(v), 1n);
  if (den === 0n) return null;
  const q = (num * 2n + den) / (den * 2n);
  return q > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(q);
}

/**
 * Compara a/b com c/d sem float: devolve true se a * d >= c * b (denominadores > 0).
 *
 * Onde: veredito de LTV/CAC (compara LTV x 10 com CAC x razão-alvo em décimos).
 * Entradas: inteiros seguros >= 0. Saída: boolean. Sem efeitos.
 */
export function crossGte(a: number, d: number, c: number, b: number): boolean {
  return BigInt(a) * BigInt(d) >= BigInt(c) * BigInt(b);
}
