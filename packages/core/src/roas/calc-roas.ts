import { mulDivRound } from "../money/bigint-math";
import { type Result, fail, ok } from "../result";

/** Entrada do cálculo: dinheiro em centavos inteiros, margem em pontos-base. */
export interface RoasInput {
  /** Receita atribuída aos anúncios, em centavos. */
  readonly revenueCents: number;
  /** Investimento em mídia, em centavos. */
  readonly spendCents: number;
  /** Margem de contribuição antes da mídia, em pontos-base (4000 = 40%). */
  readonly marginBp: number;
}

/** Situação do resultado frente ao ponto de equilíbrio. */
export type RoasVerdict = "no-spend" | "profit" | "breakeven" | "loss";

/** Saída do cálculo. Campos null quando a divisão não existe (gasto ou margem zero). */
export interface RoasResult {
  /** ROAS = receita / investimento. */
  readonly roas: number | null;
  /** ROAS de equilíbrio = 1 / margem. */
  readonly breakEvenRoas: number | null;
  /** Margem de contribuição em centavos = receita x margem. */
  readonly contributionCents: number;
  /** Lucro depois da mídia = contribuição - investimento (pode ser negativo). */
  readonly profitCents: number;
  /** Lucro sobre receita, em pontos-base (null se receita zero). */
  readonly profitMarginBp: number | null;
  /** Receita mínima para empatar com este investimento (null se margem zero). */
  readonly breakEvenRevenueCents: number | null;
  /** Investimento máximo que a receita atual suporta sem prejuízo. */
  readonly maxSpendCents: number;
  readonly verdict: RoasVerdict;
}

/** Códigos de erro de validação do ROAS. */
export type RoasError = "invalid-amount" | "invalid-margin";

/**
 * Calcula ROAS, ROAS de equilíbrio, margem de contribuição e lucro.
 *
 * O quê: toda a aritmética de dinheiro em inteiros (BigInt no arredondamento),
 * para não errar centavo; razões (ROAS) saem como número comum.
 * Onde: ilha de UI da calculadora de ROAS (apps/site), a cada mudança de campo.
 * Entrada: RoasInput validado pelos parsers. Saída: Result com RoasResult ou
 * erro estável. Sem efeitos. Fluxo: campos -> parsers -> aqui -> formatadores.
 */
export function calcRoas(input: RoasInput): Result<RoasResult, RoasError> {
  const { revenueCents, spendCents, marginBp } = input;
  if (![revenueCents, spendCents].every((v) => Number.isSafeInteger(v) && v >= 0)) {
    return fail("invalid-amount");
  }
  if (!Number.isSafeInteger(marginBp) || marginBp < 0 || marginBp > 10_000) {
    return fail("invalid-margin");
  }
  const contributionCents = mulDivRound(revenueCents, marginBp, 10_000);
  const profitCents = contributionCents - spendCents;
  const roas = spendCents > 0 ? revenueCents / spendCents : null;
  const breakEvenRoas = marginBp > 0 ? 10_000 / marginBp : null;
  return ok({
    roas,
    breakEvenRoas,
    contributionCents,
    profitCents,
    profitMarginBp: signedRatioBp(profitCents, revenueCents),
    breakEvenRevenueCents: marginBp > 0 ? mulDivRound(spendCents, 10_000, marginBp) : null,
    maxSpendCents: contributionCents,
    verdict: verdictOf(spendCents, profitCents),
  });
}

/**
 * Classifica o resultado.
 *
 * Onde: etapa interna de `calcRoas`. Entradas: investimento e lucro em
 * centavos. Saída: veredito. Sem gasto não há o que julgar.
 */
function verdictOf(spendCents: number, profitCents: number): RoasVerdict {
  if (spendCents === 0) return "no-spend";
  if (profitCents > 0) return "profit";
  return profitCents === 0 ? "breakeven" : "loss";
}

/**
 * Razão com sinal em pontos-base (lucro / receita), arredondada sem float.
 *
 * Onde: etapa interna de `calcRoas`. Entradas: numerador (pode ser negativo) e
 * denominador >= 0. Saída: pontos-base inteiros ou null se denominador zero.
 */
function signedRatioBp(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  const magnitude = mulDivRound(Math.abs(numerator), 10_000, denominator);
  return numerator < 0 ? -magnitude : magnitude;
}
