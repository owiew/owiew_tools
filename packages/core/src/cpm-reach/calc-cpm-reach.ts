import { type Result, fail, ok } from "../result";
import { deriveClicks } from "./derive-clicks";
import { budgetForReach, cpmFromImpressions, impressionsFromBudget, reachFromImpressions } from "./modes";
import { type CpmReachError, type CpmReachInput, type CpmReachResult } from "./types";
import { isAmount, isFrequency, isOptionalCtr } from "./validate";

/** Núcleo de um modo antes de derivar cliques. */
type Core = Omit<CpmReachResult, "clicks" | "cpcCents">;

/**
 * Valida a entrada de acordo com o modo.
 *
 * Onde: início de `calcCpmReach`. Entrada: objeto vindo da UI (tratado como
 * não confiável em runtime). Saída: código de erro ou null se válida.
 */
function validate(i: CpmReachInput): CpmReachError | null {
  if (!isOptionalCtr(i.ctrBp)) return "invalid-ctr";
  switch (i.mode) {
    case "impressions": return isAmount(i.spendCents) && isAmount(i.cpmCents) ? null : "invalid-amount";
    case "reach":
      if (!isAmount(i.spendCents) || !isAmount(i.cpmCents)) return "invalid-amount";
      return isFrequency(i.frequencyCenti) ? null : "invalid-frequency";
    case "cpm": return isAmount(i.spendCents) && isAmount(i.impressions) ? null : "invalid-amount";
    case "budget":
      if (!isAmount(i.reach) || !isAmount(i.cpmCents)) return "invalid-amount";
      if (i.reach === 0) return "zero-reach";
      return isFrequency(i.frequencyCenti) ? null : "invalid-frequency";
    default: return "invalid-amount";
  }
}

/**
 * Calcula o núcleo do modo escolhido (impressões, CPM, verba, alcance).
 *
 * Onde: `calcCpmReach`, depois da validação. Entrada: input válido.
 * Saída: Result com o núcleo ou erro de divisão/overflow.
 */
function core(i: CpmReachInput): Result<Core, CpmReachError> {
  switch (i.mode) {
    case "impressions": {
      const imp = impressionsFromBudget(i.spendCents, i.cpmCents);
      return imp.ok ? ok({ mode: i.mode, spendCents: i.spendCents, cpmCents: i.cpmCents, impressions: imp.value, frequencyCenti: null, reach: null }) : imp;
    }
    case "reach": {
      const imp = impressionsFromBudget(i.spendCents, i.cpmCents);
      if (!imp.ok) return imp;
      const reach = reachFromImpressions(imp.value, i.frequencyCenti);
      return reach.ok ? ok({ mode: i.mode, spendCents: i.spendCents, cpmCents: i.cpmCents, impressions: imp.value, frequencyCenti: i.frequencyCenti, reach: reach.value }) : reach;
    }
    case "cpm": {
      const cpm = cpmFromImpressions(i.spendCents, i.impressions);
      return cpm.ok ? ok({ mode: i.mode, spendCents: i.spendCents, cpmCents: cpm.value, impressions: i.impressions, frequencyCenti: null, reach: null }) : cpm;
    }
    default: {
      const plan = budgetForReach(i.reach, i.frequencyCenti, i.cpmCents);
      return plan.ok ? ok({ mode: i.mode, spendCents: plan.value.spendCents, cpmCents: i.cpmCents, impressions: plan.value.impressions, frequencyCenti: i.frequencyCenti, reach: i.reach }) : plan;
    }
  }
}

/**
 * Relaciona verba, CPM, impressões, alcance e frequência (e, opcional, cliques e CPC).
 *
 * O quê: resolve o modo pedido com aritmética inteira (BigInt), arredondando
 * impressões e alcance para baixo e verba para cima. O alcance é ESTIMATIVA
 * por frequência assumida (alcance = impressões / frequência); o alcance real
 * vem da plataforma. Resultado fora de inteiro seguro vira "overflow".
 * Onde: ilha de UI da calculadora (apps/site), a cada mudança de campo.
 * Entrada: CpmReachInput (variante por modo). Saída: Result com CpmReachResult
 * ou código de erro estável. Nunca lança e nunca produz NaN/Infinity.
 * Fluxo: campos -> parsers -> aqui -> formatadores.
 */
export function calcCpmReach(input: CpmReachInput): Result<CpmReachResult, CpmReachError> {
  const bad = validate(input);
  if (bad) return fail(bad);
  const c = core(input);
  if (!c.ok) return c;
  const d = deriveClicks(c.value.impressions, c.value.spendCents, input.ctrBp);
  if (!d.ok) return d;
  return ok({ ...c.value, clicks: d.value.clicks, cpcCents: d.value.cpcCents });
}
