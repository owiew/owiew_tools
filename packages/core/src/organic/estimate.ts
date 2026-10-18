import { type Result, fail, ok } from "../result";
import { CTR_BP, estimateClicks } from "./ctr-curve";

/** Palavra-chave com volume mensal e posição atual. */
export interface KeywordInput {
  readonly keyword: string;
  readonly volume: number;
  readonly position: number;
}

/** Cenário: chegar a uma posição fixa ou subir N posições. */
export type Scenario =
  | { readonly kind: "target"; readonly position: number }
  | { readonly kind: "rise"; readonly steps: number };

/** Erros do estimador. */
export type EstimateError = "no-keywords" | "too-many-keywords" | "invalid-volume" | "invalid-position" | "invalid-scenario";

/** Linha do resultado. */
export interface EstimateRow {
  readonly keyword: string;
  readonly volume: number;
  readonly position: number;
  readonly newPosition: number;
  readonly currentClicks: number;
  readonly newClicks: number;
  readonly gainClicks: number;
}

/** Resultado com totais. */
export interface Estimate {
  readonly rows: readonly EstimateRow[];
  readonly totalCurrent: number;
  readonly totalNew: number;
  readonly totalGain: number;
}

/** Limites de segurança. */
export const MAX_KEYWORDS = 200;
export const MAX_VOLUME = 1_000_000_000;
export const MAX_POSITION = 100;

/**
 * Posição depois do cenário.
 *
 * Onde: etapa de `estimateOrganic`. Entradas: posição atual e cenário. Saída:
 * nova posição (nunca pior que a atual; "target" além da atual não piora).
 */
function newPosition(position: number, s: Scenario): number {
  const wanted = s.kind === "target" ? s.position : position - s.steps;
  return Math.max(1, Math.min(position, wanted));
}

/**
 * Estima o tráfego orgânico atual e no cenário de subida de posição.
 *
 * O quê: cliques = volume x CTR da posição (curva documentada em `CTR_BP`).
 * Onde: ilha do estimador. Entradas: palavras-chave, cenário e curva opcional.
 * Saída: Result com linhas e totais, ou código de erro estável. Sem efeitos.
 */
export function estimateOrganic(
  keywords: readonly KeywordInput[],
  scenario: Scenario,
  curve: readonly number[] = CTR_BP,
): Result<Estimate, EstimateError> {
  if (keywords.length === 0) return fail("no-keywords");
  if (keywords.length > MAX_KEYWORDS) return fail("too-many-keywords");
  const valid = scenario.kind === "target"
    ? Number.isInteger(scenario.position) && scenario.position >= 1 && scenario.position <= MAX_POSITION
    : Number.isInteger(scenario.steps) && scenario.steps >= 0 && scenario.steps < MAX_POSITION;
  if (!valid) return fail("invalid-scenario");
  const rows: EstimateRow[] = [];
  for (const k of keywords) {
    if (!Number.isInteger(k.volume) || k.volume < 0 || k.volume > MAX_VOLUME) return fail("invalid-volume");
    if (!Number.isInteger(k.position) || k.position < 1 || k.position > MAX_POSITION) return fail("invalid-position");
    const np = newPosition(k.position, scenario);
    const cur = estimateClicks(k.volume, k.position, curve);
    const nw = estimateClicks(k.volume, np, curve);
    rows.push({ keyword: k.keyword, volume: k.volume, position: k.position, newPosition: np, currentClicks: cur, newClicks: nw, gainClicks: nw - cur });
  }
  const sum = (f: (r: EstimateRow) => number): number => rows.reduce((a, r) => a + f(r), 0);
  return ok({ rows, totalCurrent: sum((r) => r.currentClicks), totalNew: sum((r) => r.newClicks), totalGain: sum((r) => r.gainClicks) });
}
