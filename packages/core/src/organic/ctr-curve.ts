import { mulDivRound } from "../money/bigint-math";

/**
 * Curva de CTR orgânico por posição da primeira página, em pontos-base
 * (710 = 7,10%). O índice 0 é a posição 1.
 *
 * FONTE: First Page Sage, "Google Click-Through Rates (CTR) by Ranking Position"
 * (https://www.firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/),
 * edição de 22/09/2026, conferida por WebFetch em 18/10/2026. Base do relatório:
 * 1.184 domínios, 3,67 bilhões de impressões, 1/mar a 31/ago/2026, desktop e mobile,
 * EUA. O relatório traz três colunas; a ferramenta mostra duas, como cenários:
 *
 * - "combined" (padrão): coluna "Blended CTR", a que o relatório indica para previsão
 *   de tráfego, já com as buscas que têm resumo de IA: 7,1; 3,0; 1,7; 1,1; 0,7; 0,6;
 *   0,4; 0,3; 0,2; 0,2 por cento.
 * - "noAi": coluna "No AI Answer", só buscas sem resposta de IA: 22,6; 10,2; 5,8; 3,7;
 *   2,5; 1,8; 1,3; 0,9; 0,7; 0,5 por cento.
 *
 * Todas as dez posições de cada curva são valores publicados, sem interpolação.
 * Atenção: Backlinko (atualização de 16/04/2025) publica no texto só a posição 1
 * (27,6%); as demais ficam em imagem de gráfico, por isso não serve de fonte completa
 * conferível. O CTR real muda com intenção, marca, dispositivo e recursos da página.
 */
export const CTR_COMBINED_BP: readonly number[] = [710, 300, 170, 110, 70, 60, 40, 30, 20, 20];

/** Curva "sem resposta de IA" da mesma edição da fonte (ver `CTR_COMBINED_BP`). */
export const CTR_NO_AI_BP: readonly number[] = [2260, 1020, 580, 370, 250, 180, 130, 90, 70, 50];

/** Identificador do cenário de curva: com resumos de IA (combinado) ou sem resposta de IA. */
export type CtrScenarioId = "combined" | "noAi";

/** Os dois cenários da fonte, por identificador. */
export const CTR_CURVES: Readonly<Record<CtrScenarioId, readonly number[]>> = {
  combined: CTR_COMBINED_BP,
  noAi: CTR_NO_AI_BP,
};

/** Curva padrão: a combinada (a que a fonte indica para previsão de tráfego). */
export const CTR_BP: readonly number[] = CTR_COMBINED_BP;

/** Posições cobertas pelas curvas (primeira página; as duas têm o mesmo tamanho). */
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
