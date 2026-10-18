/** Pi, usado nas aproximações da normal. */
const SQRT_PI = Math.sqrt(Math.PI);

/**
 * erf por série de termos positivos: erf(x) = 2/sqrt(pi) e^(-x^2) sum 2^n x^(2n+1)/(2n+1)!!.
 *
 * Onde: etapa interna de `erfc` para |x| < 2. Entrada: x >= 0. Saída: erf(x)
 * com erro absoluto ~1e-16. Sem efeitos.
 */
function erfSeries(x: number): number {
  let term = x;
  let sum = x;
  for (let n = 0; n < 200; n++) {
    term *= (2 * x * x) / (2 * n + 3);
    sum += term;
    if (term < sum * 1e-17) break;
  }
  return (2 / SQRT_PI) * Math.exp(-x * x) * sum;
}

/**
 * erfc por fração contínua (Abramowitz e Stegun 7.1.14), avaliada de trás para frente.
 *
 * Onde: etapa interna de `erfc` para x >= 2, onde 1 - erf perderia precisão
 * relativa na cauda. Entrada: x >= 2. Saída: erfc(x). Sem efeitos.
 */
function erfcFraction(x: number): number {
  let f = x;
  for (let k = 120; k >= 1; k--) f = x + k / 2 / f;
  return Math.exp(-x * x) / SQRT_PI / f;
}

/**
 * Função de erro complementar erfc(x) = 1 - erf(x), precisa também nas caudas.
 *
 * Onde: base de `normalCdf`, usada pelo teste z e pela inversa da normal.
 * Entrada: x real finito. Saída: erfc(x) em [0, 2]. Sem efeitos.
 */
export function erfc(x: number): number {
  if (Number.isNaN(x)) return Number.NaN;
  if (x < 0) return 2 - erfc(-x);
  if (x === 0) return 1;
  if (x < 2) return 1 - erfSeries(x);
  return erfcFraction(x);
}

/**
 * Distribuição normal padrão acumulada, Phi(x) = P(Z <= x).
 *
 * Onde: p-valores do teste z. Entrada: x. Saída: probabilidade em [0, 1].
 * Sem efeitos; a cauda esquerda mantém precisão relativa (Phi(-8) ~ 6.2e-16).
 */
export function normalCdf(x: number): number {
  return 0.5 * erfc(-x / Math.SQRT2);
}

const ACKLAM_A = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
const ACKLAM_B = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
const ACKLAM_C = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const ACKLAM_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

/**
 * Chute inicial da inversa da normal (aproximação racional de Acklam, erro ~1e-9).
 *
 * Onde: etapa interna de `normalQuantile`, refinada por Halley. Entrada: p em
 * (0, 1). Saída: x aproximado. Sem efeitos.
 */
function acklam(p: number): number {
  const [a1, a2, a3, a4, a5, a6] = ACKLAM_A as [number, number, number, number, number, number];
  const [b1, b2, b3, b4, b5] = ACKLAM_B as [number, number, number, number, number];
  const [c1, c2, c3, c4, c5, c6] = ACKLAM_C as [number, number, number, number, number, number];
  const [d1, d2, d3, d4] = ACKLAM_D as [number, number, number, number];
  const tail = (q: number): number =>
    (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)));
  if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
  const q = p - 0.5;
  const r = q * q;
  return ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
}

/**
 * Inversa da normal padrão (quantil): o x tal que Phi(x) = p.
 *
 * O quê: chute de Acklam + 2 passos de Halley sobre `normalCdf`, chegando a ~1e-15.
 * Onde: valores críticos z do teste A/B e do tamanho de amostra.
 * Entrada: p em (0, 1). Saída: x, ou NaN se p estiver fora do intervalo.
 */
export function normalQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return Number.NaN;
  let x = acklam(p);
  for (let i = 0; i < 2; i++) {
    const e = normalCdf(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
    x -= u / (1 + (x * u) / 2);
  }
  return x;
}
