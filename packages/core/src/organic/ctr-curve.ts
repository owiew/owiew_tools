import { mulDivRound } from "../money/bigint-math";

/**
 * Curva de CTR orgânico por posição da primeira página, em pontos-base
 * (2850 = 28,50%). O índice 0 é a posição 1.
 *
 * FONTE: Sistrix, "Why almost everything you knew about Google CTR is no longer
 * valid" (14/07/2020), estudo com mais de 80 milhões de palavras-chave. Valores
 * LIDOS no estudo: posição 1 = 28,5%, posição 2 = 15,7%, posição 3 = 11,0% e
 * posição 10 = 2,5%. As posições 4 a 9 NÃO são medições: são interpolação
 * geométrica entre a posição 3 e a 10 (cada posição vale cerca de 80,9% da
 * anterior), pois o texto do estudo só traz esses pontos. Conferência cruzada:
 * Backlinko (4 milhões de resultados, atualizado em 2025) mede 27,6% para a
 * posição 1. O CTR real muda com intenção, marca, dispositivo e recursos da
 * página de resultados (anúncios, quadros, "As pessoas também perguntam").
 */
export const CTR_BP: readonly number[] = [2850, 1570, 1100, 890, 720, 583, 472, 382, 309, 250];

/** Posições cobertas pela curva (primeira página). */
export const CURVE_POSITIONS = CTR_BP.length;

/**
 * CTR de uma posição.
 *
 * Onde: estimador de tráfego e tabela exibida na página. Entradas: posição
 * (inteiro >= 1) e curva opcional. Saída: pontos-base; 0 para posições fora da
 * curva (segunda página em diante, onde o CTR é desprezível) e para valores
 * inválidos. Sem efeitos.
 */
export function ctrBp(position: number, curve: readonly number[] = CTR_BP): number {
  if (!Number.isInteger(position) || position < 1) return 0;
  return curve[position - 1] ?? 0;
}

/**
 * Cliques orgânicos mensais esperados para um volume de busca numa posição.
 *
 * Onde: estimador de tráfego orgânico. Entradas: volume mensal (inteiro >= 0),
 * posição e curva opcional. Saída: cliques inteiros (volume x CTR, arredondado
 * para cima na metade, por aritmética de inteiros). Sem efeitos.
 */
export function estimateClicks(volume: number, position: number, curve: readonly number[] = CTR_BP): number {
  return mulDivRound(volume, ctrBp(position, curve), 10_000);
}
