/**
 * Confere se um valor é inteiro seguro não negativo.
 *
 * Onde: validação de entrada de todos os modos. Entrada: valor qualquer
 * (NaN, Infinity e floats são rejeitados). Saída: true se válido.
 */
export function isAmount(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
}

/**
 * Confere a frequência média em centésimos: inteiro seguro >= 100 (1,00).
 *
 * Onde: modos "reach" e "budget". Frequência abaixo de 1 não existe, pois
 * impressões nunca são menos que o alcance. Saída: true se válida.
 */
export function isFrequency(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v >= 100;
}

/**
 * Confere o CTR opcional em pontos-base (0 a 10000).
 *
 * Onde: derivação de cliques e CPC. Entrada: valor ou undefined. Saída: true
 * se ausente ou válido.
 */
export function isOptionalCtr(v: unknown): boolean {
  return v === undefined || (typeof v === "number" && Number.isSafeInteger(v) && v >= 0 && v <= 10_000);
}
