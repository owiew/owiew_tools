import { type Result, fail, ok } from "../result";
import { roundDiv } from "./big-math";
import { type FunnelError, type FunnelInput, type FunnelResult, calcFunnel } from "./calc-funnel";

/** Um cenário: nome estável e fator em % aplicado às taxas de conversão (80 = -20%). */
export interface FunnelScenario {
  readonly id: "pessimistic" | "base" | "optimistic";
  readonly factorPct: number;
}

/** Cenários padrão: pessimista -20%, base, otimista +20%. */
export const DEFAULT_SCENARIOS: readonly FunnelScenario[] = [
  { id: "pessimistic", factorPct: 80 },
  { id: "base", factorPct: 100 },
  { id: "optimistic", factorPct: 120 },
];

/** Linha da tabela de cenários: o cenário e seu resultado (ou erro, ex.: overflow). */
export interface ScenarioRow {
  readonly scenario: FunnelScenario;
  readonly result: Result<FunnelResult, FunnelError>;
}

/**
 * Escala uma taxa em pontos-base por um fator em %, mantendo-a em 1..10000.
 *
 * O quê: 500 bp x 80% = 400 bp; nunca zera (mínimo 1) nem passa de 100%.
 * Onde: etapa interna de `calcScenarios`. Entradas: bp inteiro 1..10000 e
 * fator inteiro >= 1. Saída: bp inteiro. Sem float.
 */
export function scaleBp(bp: number, factorPct: number): number {
  const scaled = Number(roundDiv(BigInt(bp) * BigInt(factorPct), 100n));
  return Math.min(10_000, Math.max(1, scaled));
}

/**
 * Recalcula o funil em cada cenário, escalando as duas taxas de conversão.
 *
 * O quê: só lead->venda e clique->lead mudam; CPC, CPM, CTR e ticket ficam.
 * Onde: tabela de cenários da ilha do planejador. Entradas: FunnelInput e
 * lista de cenários (default -20/0/+20, configurável só aqui no core).
 * Saída: Result com uma linha por cenário, ou o erro de validação da entrada
 * base. Fator inválido (não inteiro >= 1) devolve "invalid-lead-rate".
 */
export function calcScenarios(
  input: FunnelInput,
  scenarios: readonly FunnelScenario[] = DEFAULT_SCENARIOS,
): Result<readonly ScenarioRow[], FunnelError> {
  const base = calcFunnel(input);
  if (!base.ok) return fail(base.error);
  if (!scenarios.every((s) => Number.isSafeInteger(s.factorPct) && s.factorPct >= 1 && s.factorPct <= 1000)) {
    return fail("invalid-lead-rate");
  }
  return ok(
    scenarios.map((scenario) => ({
      scenario,
      result: calcFunnel({
        ...input,
        leadToSaleBp: scaleBp(input.leadToSaleBp, scenario.factorPct),
        clickToLeadBp: scaleBp(input.clickToLeadBp, scenario.factorPct),
      }),
    })),
  );
}
