import { type Result, fail, ok } from "../result";
import { crossGte, roundMulDiv } from "./round-mul-div";
import { type CpaLtvError, type CpaLtvInput, type CpaLtvResult, type CpaLtvVerdict } from "./types";
import { validateInput } from "./validate-input";

/**
 * Classifica o LTV/CAC pela convenção (1 e a razão alvo), sem float.
 *
 * Onde: etapa interna de `calcCpaLtv`. Entradas: LTV de margem, CAC e razão alvo
 * em décimos. Saída: faixa. A convenção é regra prática, não lei.
 */
function verdictOf(ltvMargin: number, cac: number | null, targetTenths: number): CpaLtvVerdict {
  if (cac === null || cac === 0) return "no-cac";
  if (ltvMargin < cac) return "loss";
  return crossGte(ltvMargin, 10, cac, targetTenths) ? "healthy" : "attention";
}

/**
 * Calcula LTV (receita e margem), CPA máximo, LTV/CAC, lucro por cliente e payback.
 *
 * O quê: toda a aritmética em inteiros (BigInt, um único arredondamento por conta).
 * Onde: ilha da calculadora de CPA e LTV (apps/site), a cada mudança de campo.
 * Entrada: CpaLtvInput. Saída: Result com CpaLtvResult ou código estável
 * (inclui "overflow" quando algum resultado sai do inteiro seguro). Sem efeitos.
 * Fluxo: campos -> parsers -> aqui -> formatadores. Nunca divide por zero.
 */
export function calcCpaLtv(raw: CpaLtvInput): Result<CpaLtvResult, CpaLtvError> {
  const valid = validateInput(raw);
  if (!valid.ok) return valid;
  const i = valid.value;
  const ltvRevenue = roundMulDiv([i.ticketCents, i.purchasesCentis], [100]);
  const ltvMargin = roundMulDiv([i.ticketCents, i.purchasesCentis, i.marginBp], [100, 10_000]);
  const breakEven = roundMulDiv([i.ticketCents, i.marginBp], [10_000]);
  const maxTarget = ltvMargin === null ? null : roundMulDiv([ltvMargin, 10], [i.targetRatioTenths]);
  if (ltvRevenue === null || ltvMargin === null || breakEven === null || maxTarget === null) return fail("overflow");
  const cac = i.cacCents;
  const hasCac = cac !== null;
  const ratio = hasCac && cac > 0 ? roundMulDiv([ltvMargin, 100], [cac]) : null;
  if (hasCac && cac > 0 && ratio === null) return fail("overflow");
  const payback = hasCac ? roundMulDiv([cac, 10_000, 100], [i.ticketCents, i.marginBp]) : null;
  if (hasCac && payback === null && i.ticketCents > 0 && i.marginBp > 0) return fail("overflow");
  const months = hasCac && i.lifetimeMonths !== null && ltvMargin > 0
    ? roundMulDiv([cac, i.lifetimeMonths, 10], [ltvMargin]) : null;
  const maxPayback = i.paybackTargetMonths !== null && i.lifetimeMonths !== null
    ? roundMulDiv([ltvMargin, i.paybackTargetMonths], [i.lifetimeMonths]) : null;
  return ok({
    ltvRevenueCents: ltvRevenue,
    ltvMarginCents: ltvMargin,
    breakEvenCpaCents: breakEven,
    maxCpaTargetCents: maxTarget,
    ratioCentis: ratio,
    verdict: verdictOf(ltvMargin, cac, i.targetRatioTenths),
    profitPerCustomerCents: hasCac ? ltvMargin - cac : null,
    paybackPurchasesCentis: payback,
    paysBackInPeriod: hasCac ? ltvMargin >= cac : null,
    paybackMonthsTenths: months,
    maxCpaPaybackCents: maxPayback,
  });
}
