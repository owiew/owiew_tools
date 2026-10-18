/** Os quatro modos de cálculo da ferramenta. */
export type CpmReachMode = "impressions" | "reach" | "cpm" | "budget";

/** Campos comuns: CTR opcional em pontos-base (150 = 1,5%). */
interface WithCtr {
  readonly ctrBp?: number;
}

/**
 * Entrada do cálculo, uma variante por modo. Dinheiro em centavos, CPM em
 * centavos por mil impressões, frequência em centésimos (250 = 2,50).
 */
export type CpmReachInput =
  | ({ readonly mode: "impressions"; readonly spendCents: number; readonly cpmCents: number } & WithCtr)
  | ({ readonly mode: "reach"; readonly spendCents: number; readonly cpmCents: number; readonly frequencyCenti: number } & WithCtr)
  | ({ readonly mode: "cpm"; readonly spendCents: number; readonly impressions: number } & WithCtr)
  | ({ readonly mode: "budget"; readonly reach: number; readonly frequencyCenti: number; readonly cpmCents: number } & WithCtr);

/** Saída do cálculo. Campos null quando não se aplicam ao modo ou não existem. */
export interface CpmReachResult {
  readonly mode: CpmReachMode;
  /** Verba em centavos (dada, ou calculada no modo "budget", arredondada para cima). */
  readonly spendCents: number;
  /** CPM em centavos por mil impressões (dado, ou calculado no modo "cpm"). */
  readonly cpmCents: number;
  /** Impressões inteiras (arredondadas para baixo, exceto no modo "budget", onde sobem). */
  readonly impressions: number;
  /** Frequência média assumida, em centésimos (null nos modos sem frequência). */
  readonly frequencyCenti: number | null;
  /** Alcance estimado (modo "reach") ou a meta pedida (modo "budget"); null nos demais. */
  readonly reach: number | null;
  /** Cliques estimados = impressões x CTR, para baixo (null sem CTR). */
  readonly clicks: number | null;
  /** CPC = verba / cliques, ao centavo mais próximo (null sem CTR ou com zero cliques). */
  readonly cpcCents: number | null;
}

/** Códigos de erro estáveis do cálculo. */
export type CpmReachError =
  | "invalid-amount"
  | "zero-cpm"
  | "zero-impressions"
  | "zero-reach"
  | "invalid-frequency"
  | "invalid-ctr"
  | "overflow";
