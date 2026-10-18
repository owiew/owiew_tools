import { type Result, fail, ok } from "../result";
import { mulDiv } from "./mul-div";

/**
 * Modo (a): impressões = verba x 1000 / CPM, arredondado para baixo.
 *
 * Onde: `calcCpmReach`. Entradas: verba e CPM em centavos (já validados).
 * Saída: Result com impressões inteiras ou "zero-cpm"/"overflow".
 */
export function impressionsFromBudget(spendCents: number, cpmCents: number): Result<number, "zero-cpm" | "overflow"> {
  if (cpmCents === 0) return fail("zero-cpm");
  const v = mulDiv(spendCents, 1000, cpmCents, "floor");
  return v === null ? fail("overflow") : ok(v);
}

/**
 * Modo (b): alcance estimado = impressões x 100 / frequência (em centésimos), para baixo.
 *
 * Onde: `calcCpmReach`. Entradas: impressões e frequência >= 100 (validadas).
 * Saída: alcance inteiro. Como frequência >= 1, nunca excede as impressões.
 */
export function reachFromImpressions(impressions: number, frequencyCenti: number): Result<number, "overflow"> {
  const v = mulDiv(impressions, 100, frequencyCenti, "floor");
  return v === null ? fail("overflow") : ok(v);
}

/**
 * Modo (c): CPM = verba x 1000 / impressões, ao centavo mais próximo.
 *
 * Onde: `calcCpmReach`. Entradas: verba em centavos e impressões > 0.
 * Saída: CPM em centavos por mil impressões, ou "zero-impressions"/"overflow".
 */
export function cpmFromImpressions(spendCents: number, impressions: number): Result<number, "zero-impressions" | "overflow"> {
  if (impressions === 0) return fail("zero-impressions");
  const v = mulDiv(spendCents, 1000, impressions, "round");
  return v === null ? fail("overflow") : ok(v);
}

/** Impressões e verba necessárias para uma meta de alcance. */
export interface BudgetPlan {
  readonly impressions: number;
  readonly spendCents: number;
}

/**
 * Modo (d): verba necessária para uma meta de alcance.
 *
 * O quê: impressões = alcance x frequência / 100 e verba = impressões x CPM /
 * 1000, as duas arredondadas PARA CIMA (planejar com sobra, nunca com falta).
 * Onde: `calcCpmReach`. Entradas: alcance, frequência (centésimos) e CPM.
 * Saída: Result com impressões e verba, ou "overflow".
 */
export function budgetForReach(reach: number, frequencyCenti: number, cpmCents: number): Result<BudgetPlan, "overflow"> {
  const impressions = mulDiv(reach, frequencyCenti, 100, "ceil");
  if (impressions === null) return fail("overflow");
  const spendCents = mulDiv(impressions, cpmCents, 1000, "ceil");
  return spendCents === null ? fail("overflow") : ok({ impressions, spendCents });
}
