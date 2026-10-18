import { type Result, fail, ok } from "../result";
import { normalQuantile } from "./normal";

/** Como o efeito mínimo detectável (MDE) é expresso. */
export type MdeKind = "relative" | "absolute";

/** Parâmetros do cálculo de tamanho de amostra por grupo. */
export interface SampleSizeInput {
  /** Taxa de conversão atual (controle), em pontos-base (300 = 3%), entre 1 e 9999. */
  readonly baselineBp: number;
  /** Efeito mínimo a detectar, em pontos-base: relativo (1000 = +10% sobre a taxa) ou absoluto (50 = +0,5 p.p.). */
  readonly mdeBp: number;
  readonly mdeKind: MdeKind;
  /** Confiança em pontos-base (9500), entre 5000 e 9999. */
  readonly confidenceBp: number;
  /** Poder estatístico em pontos-base (8000 = 80%), entre 5000 e 9999. */
  readonly powerBp: number;
  readonly tails: 1 | 2;
}

/** Resultado: amostra por grupo e total, mais as taxas comparadas. */
export interface SampleSizeResult {
  readonly perGroup: number;
  readonly total: number;
  /** Taxa do controle e taxa esperada da variante, em fração. */
  readonly p1: number;
  readonly p2: number;
}

/** Códigos de erro estáveis. */
export type SampleSizeError = "invalid-baseline" | "invalid-mde" | "invalid-confidence" | "invalid-power" | "invalid-tails" | "target-out-of-range" | "too-large";

/** Teto de segurança: acima disso o teste é inviável e o número perde sentido. */
export const MAX_SAMPLE_PER_GROUP = 1_000_000_000;

const inRange = (v: number): boolean => Number.isSafeInteger(v) && v >= 5000 && v <= 9999;

/**
 * Tamanho de amostra por grupo para comparar duas proporções (Fleiss).
 *
 * O quê: n = ((z_a sqrt(2 p' q') + z_b sqrt(p1 q1 + p2 q2)) / (p2 - p1))^2, com
 * p' = (p1 + p2) / 2 e z_a de alfa/caudas. Confere com o manual Stata
 * [PSS-2] power twoproportions, exemplo 1 (0,015 vs 0,001 -> 635 por grupo).
 * Onde: ilha da ferramenta Teste A/B. Entrada: SampleSizeInput. Saída: Result
 * com n por grupo (arredondado para cima) e total, ou código de erro. Sem efeitos.
 */
export function sampleSize(input: SampleSizeInput): Result<SampleSizeResult, SampleSizeError> {
  const { baselineBp, mdeBp, mdeKind, confidenceBp, powerBp, tails } = input;
  if (!Number.isSafeInteger(baselineBp) || baselineBp < 1 || baselineBp > 9999) return fail("invalid-baseline");
  if (!Number.isSafeInteger(mdeBp) || mdeBp < 1 || (mdeKind !== "relative" && mdeKind !== "absolute")) return fail("invalid-mde");
  if (!inRange(confidenceBp)) return fail("invalid-confidence");
  if (!inRange(powerBp)) return fail("invalid-power");
  if (tails !== 1 && tails !== 2) return fail("invalid-tails");

  const p1 = baselineBp / 10_000;
  const p2 = mdeKind === "relative" ? p1 * (1 + mdeBp / 10_000) : p1 + mdeBp / 10_000;
  if (!(p2 > 0 && p2 < 1)) return fail("target-out-of-range");

  const alpha = 1 - confidenceBp / 10_000;
  const za = normalQuantile(1 - alpha / tails);
  const zb = normalQuantile(powerBp / 10_000);
  const pBar = (p1 + p2) / 2;
  const root = za * Math.sqrt(2 * pBar * (1 - pBar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  const raw = (root / (p2 - p1)) ** 2;
  // Subtrai ruído de ponto flutuante (1e-9) para não subir um inteiro exato sem motivo.
  const perGroup = Math.ceil(raw - 1e-9);
  if (!Number.isFinite(perGroup) || perGroup > MAX_SAMPLE_PER_GROUP) return fail("too-large");
  return ok({ perGroup, total: perGroup * 2, p1, p2 });
}

/**
 * Dias de teste necessários dado o tráfego diário que entra no experimento.
 *
 * Onde: resumo do resultado do tamanho de amostra. Entradas: total de
 * visitantes (os dois grupos) e visitantes por dia. Saída: dias inteiros
 * (arredondado para cima) ou null se o tráfego diário não for inteiro positivo.
 */
export function testDurationDays(total: number, dailyVisitors: number): number | null {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(dailyVisitors) || dailyVisitors < 1) return null;
  return Math.ceil(total / dailyVisitors);
}
