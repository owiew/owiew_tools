import { type Result, fail, ok } from "../result";
import { normalCdf, normalQuantile } from "./normal";

/** Um braço do teste: visitantes expostos e conversões observadas (inteiros). */
export interface AbArm {
  readonly visitors: number;
  readonly conversions: number;
}

/** Parâmetros do teste z de duas proporções. */
export interface SignificanceInput {
  /** Controle (original). */
  readonly a: AbArm;
  /** Variante. */
  readonly b: AbArm;
  /** Nível de confiança em pontos-base (9500 = 95%), entre 5000 e 9999. */
  readonly confidenceBp: number;
  /** 2 = bilateral (há diferença?); 1 = unilateral (a variante é melhor?). */
  readonly tails: 1 | 2;
}

/** Avisos que não impedem o cálculo, mas pedem cautela na leitura. */
export type SignificanceWarning = "small-sample" | "no-variation";

/** Resultado do teste. Taxas e razões são números comuns (não dinheiro). */
export interface SignificanceResult {
  readonly rateA: number;
  readonly rateB: number;
  /** rateB - rateA, em fração (0.01 = 1 ponto percentual). */
  readonly diff: number;
  /** Ganho relativo (rateB / rateA - 1); null se rateA = 0. */
  readonly relativeUplift: number | null;
  /** Estatística z com erro-padrão agrupado (pooled) sob H0; null sem variação. */
  readonly z: number | null;
  /** p-valor (bilateral ou unilateral a favor de B, conforme `tails`). */
  readonly pValue: number;
  /** Intervalo de confiança bilateral da diferença (erro-padrão não agrupado). */
  readonly ci: { readonly low: number; readonly high: number };
  /** Valor crítico z usado. */
  readonly zCritical: number;
  /** p-valor abaixo de alfa (1 - confiança, dividido pelas caudas conforme o teste). */
  readonly significant: boolean;
  /** Quem venceu entre os que têm diferença significativa; "none" se inconclusivo. */
  readonly winner: "a" | "b" | "none";
  readonly warnings: readonly SignificanceWarning[];
}

/** Códigos de erro estáveis (a UI traduz). */
export type SignificanceError = "invalid-count" | "conversions-exceed-visitors" | "no-visitors" | "invalid-confidence" | "invalid-tails";

/**
 * Confere se um braço tem contagens inteiras, não negativas e coerentes.
 *
 * Onde: etapa interna de `testSignificance`. Entrada: braço. Saída: código de
 * erro ou null se válido. Sem efeitos.
 */
function armError(arm: AbArm): SignificanceError | null {
  if (!Number.isSafeInteger(arm.visitors) || !Number.isSafeInteger(arm.conversions) || arm.visitors < 0 || arm.conversions < 0) return "invalid-count";
  if (arm.visitors === 0) return "no-visitors";
  return arm.conversions > arm.visitors ? "conversions-exceed-visitors" : null;
}

/**
 * Teste z de duas proporções com intervalo de confiança da diferença.
 *
 * O quê: z = (pB - pA) / sqrt(p(1-p)(1/nA + 1/nB)), com p agrupado (H0: pA = pB);
 * o IC usa o erro-padrão não agrupado sqrt(pA(1-pA)/nA + pB(1-pB)/nB), como
 * em Stata `prtesti` e Agresti (2013, tab. 2.1). Referência de valores: ver
 * abtest.test.ts (manual Stata [PSS-2] power twoproportions, exemplo 10).
 * Onde: ilha da ferramenta Teste A/B. Entrada: contagens, confiança e caudas.
 * Saída: Result com taxas, z, p, IC e vencedor, ou código de erro. Sem efeitos.
 */
export function testSignificance(input: SignificanceInput): Result<SignificanceResult, SignificanceError> {
  const { a, b, confidenceBp, tails } = input;
  const bad = armError(a) ?? armError(b);
  if (bad) return fail(bad);
  if (!Number.isSafeInteger(confidenceBp) || confidenceBp < 5000 || confidenceBp > 9999) return fail("invalid-confidence");
  if (tails !== 1 && tails !== 2) return fail("invalid-tails");

  const rateA = a.conversions / a.visitors;
  const rateB = b.conversions / b.visitors;
  const diff = rateB - rateA;
  const pooled = (a.conversions + b.conversions) / (a.visitors + b.visitors);
  const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / a.visitors + 1 / b.visitors));
  const seUnpooled = Math.sqrt((rateA * (1 - rateA)) / a.visitors + (rateB * (1 - rateB)) / b.visitors);

  const alpha = 1 - confidenceBp / 10_000;
  const zCritical = normalQuantile(1 - alpha / tails);
  const zCiCritical = normalQuantile(1 - alpha / 2);
  const z = sePooled > 0 ? diff / sePooled : null;
  const pValue = z === null ? 1 : tails === 2 ? 2 * normalCdf(-Math.abs(z)) : normalCdf(-z);
  const significant = pValue < alpha;
  const direction = diff > 0 ? "b" : diff < 0 ? "a" : "none";
  // Unilateral só prova "B melhor": se a diferença for negativa não há vencedor declarado.
  const winner = significant && (tails === 2 || direction === "b") ? direction : "none";

  const warnings: SignificanceWarning[] = [];
  const cells = [a.conversions, a.visitors - a.conversions, b.conversions, b.visitors - b.conversions];
  if (cells.some((c) => c < 5)) warnings.push("small-sample");
  if (z === null) warnings.push("no-variation");

  return ok({
    rateA, rateB, diff,
    relativeUplift: rateA === 0 ? null : rateB / rateA - 1,
    z, pValue,
    ci: { low: diff - zCiCritical * seUnpooled, high: diff + zCiCritical * seUnpooled },
    zCritical, significant, winner, warnings,
  });
}
