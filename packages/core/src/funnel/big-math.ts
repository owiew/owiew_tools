/**
 * Divisão inteira com arredondamento para CIMA, em BigInt.
 *
 * O quê: ceil(a / b) sem passar por float, para "quantas pessoas/cliques
 * preciso" nunca ficar abaixo do necessário (233,33 leads viram 234).
 * Onde: calcFunnel (leads, cliques e impressões). Entradas: a >= 0, b > 0.
 * Saída: BigInt. Sem efeitos.
 */
export function ceilDiv(a: bigint, b: bigint): bigint {
  return (a + b - 1n) / b;
}

/**
 * Divisão inteira com arredondamento meio-para-cima, em BigInt.
 *
 * O quê: round(a / b) sem float, para valores em centavos (CPL, CPA, verba).
 * Onde: calcFunnel. Entradas: a >= 0, b > 0. Saída: BigInt. Sem efeitos.
 */
export function roundDiv(a: bigint, b: bigint): bigint {
  return (a * 2n + b) / (b * 2n);
}

/**
 * Converte BigInt em number só se couber em inteiro seguro.
 *
 * O quê: guarda de overflow do funil. Onde: toda saída de calcFunnel.
 * Entrada: BigInt. Saída: number inteiro seguro ou null (estouro).
 */
export function toSafe(value: bigint): number | null {
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}
