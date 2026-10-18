/**
 * Multiplica e divide inteiros com BigInt e arredonda meio-para-cima.
 *
 * O quê: calcula round(a * b / d) sem passar por float, para dinheiro em
 * centavos nunca acumular erro de arredondamento.
 * Onde: ROAS (margem de contribuição, receita de equilíbrio) e qualquer
 * ferramenta futura que aplique percentual sobre centavos.
 * Entradas: a, b, d inteiros seguros, a e b >= 0, d > 0.
 * Saída: inteiro (number). Lança RangeError se o contrato for violado ou se o
 * resultado não couber em inteiro seguro (erro de programação, não de usuário:
 * os parsers já limitam a entrada).
 */
export function mulDivRound(a: number, b: number, d: number): number {
  if (![a, b, d].every(Number.isSafeInteger) || a < 0 || b < 0 || d <= 0) {
    throw new RangeError("mulDivRound: a e b devem ser inteiros >= 0 e d inteiro > 0");
  }
  const bd = BigInt(d);
  const q = (BigInt(a) * BigInt(b) * 2n + bd) / (bd * 2n);
  if (q > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError("mulDivRound: resultado acima do inteiro seguro");
  }
  return Number(q);
}
