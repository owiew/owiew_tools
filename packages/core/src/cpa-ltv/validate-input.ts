import { type Result, fail, ok } from "../result";
import { type CpaLtvError, type CpaLtvInput } from "./types";

/** Teto de compras por cliente: 10.000,00 compras (em centésimos). */
export const MAX_PURCHASES_CENTIS = 1_000_000;

/** Razão alvo aceita: de 0,1 a 100,0 (em décimos). */
export const MAX_RATIO_TENTHS = 1000;

/** Teto de meses (100 anos). */
export const MAX_MONTHS = 1200;

/** True se v é inteiro seguro >= 0. */
const nonNeg = (v: number): boolean => Number.isSafeInteger(v) && v >= 0;

/** True se v é null ou inteiro de 1 a MAX_MONTHS. */
const monthsOk = (v: number | null): boolean => v === null || (Number.isSafeInteger(v) && v >= 1 && v <= MAX_MONTHS);

/**
 * Valida todos os campos do cálculo e devolve o primeiro erro estável.
 *
 * Onde: primeira etapa de `calcCpaLtv`. Entrada: CpaLtvInput bruto (pode vir de
 * qualquer parser). Saída: Result com a própria entrada ou código de erro.
 * Nunca lança; NaN, Infinity, negativos e floats caem em erro.
 */
export function validateInput(input: CpaLtvInput): Result<CpaLtvInput, CpaLtvError> {
  if (!nonNeg(input.ticketCents) || (input.cacCents !== null && !nonNeg(input.cacCents))) {
    return fail("invalid-amount");
  }
  if (!nonNeg(input.marginBp) || input.marginBp > 10_000) return fail("invalid-margin");
  if (!nonNeg(input.purchasesCentis) || input.purchasesCentis > MAX_PURCHASES_CENTIS) {
    return fail("invalid-purchases");
  }
  if (!Number.isSafeInteger(input.targetRatioTenths) || input.targetRatioTenths < 1 || input.targetRatioTenths > MAX_RATIO_TENTHS) {
    return fail("invalid-ratio");
  }
  if (!monthsOk(input.lifetimeMonths) || !monthsOk(input.paybackTargetMonths)) return fail("invalid-months");
  if (input.paybackTargetMonths !== null && input.lifetimeMonths === null) return fail("invalid-months");
  return ok(input);
}
