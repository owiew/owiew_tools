import { mulDivRound } from "../money/bigint-math";

/**
 * Curva de CTR orgânico por posição da primeira página, em pontos-base
 * (710 = 7,10%). O índice 0 é a posição 1.
 *
 * FONTE: First Page Sage, "Google Click-Through Rates (CTR) by Ranking Position"
 * (https://www.firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/),
 * edição de 22/09/2026, conferida por WebFetch em 18/10/2026. Coluna "Blended CTR"
 * (a que o relatório indica para previsão de tráfego): posições 1 a 10 =
 * 7,1; 3,0; 1,7; 1,1; 0,7; 0,6; 0,4; 0,3; 0,2; 0,2 por cento. Todas as dez
 * posições são valores publicados, sem interpolação. Base do relatório: 1.184
 * domínios, 3,67 bilhões de impressões, 1/mar a 31/ago/2026, desktop e mobile, EUA.
 * A coluna "No AI Answer" (22,6; 10,2; 5,8; 3,7; 2,5; 1,8; 1,3; 0,9; 0,7; 0,5) vale
 * para buscas sem resposta de IA. Atenção: Backlinko (4 milhões de resultados,
 * atualização de 16/04/2025) publica no texto só a posição 1 (27,6%); as demais
 * ficam em imagem de gráfico, por isso não serve de fonte completa conferível.
 * O CTR real muda com intenção, marca, dispositivo e recursos da página de resultados.
 */
export const CTR_BP: readonly number[] = [710, 300, 170, 110, 70, 60, 40, 30, 20, 20];

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
