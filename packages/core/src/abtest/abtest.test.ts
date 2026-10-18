import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { erfc, normalCdf, normalQuantile, sampleSize, testDurationDays, testSignificance } from "./index";

/*
 * Valores de referência (independentes desta implementação):
 * - Tabelas da normal padrão: Abramowitz e Stegun, Handbook of Mathematical
 *   Functions, tab. 7.1 (erf) e 26.1 (Phi); z crítico 1,959964, 1,644854, 2,575829, 0,841621.
 * - Phi(-5) = 2,866516e-7 e Phi(-8) = 6,220961e-16 (caudas conhecidas da normal).
 * - Manual Stata 15, [PSS-2] power twoproportions: exemplo 1 (635 por grupo) e
 *   exemplo 10 (Agresti 2013, tab. 2.1: 189/11034 vs 104/11037, z = 5,0023, IC 95% da diferença [0,0046846; 0,0107154]).
 * - Python 3 `statistics.NormalDist().inv_cdf` para os quantis com 16 dígitos.
 */

describe("normal padrão", () => {
  it("erfc confere com a tabela A&S", () => {
    expect(erfc(0)).toBe(1);
    expect(erfc(1)).toBeCloseTo(0.15729920705028513, 14);
    expect(erfc(-1)).toBeCloseTo(1.842700792949715, 14);
    expect(erfc(3)).toBeCloseTo(2.209049699858544e-5, 18);
    expect(erfc(Number.NaN)).toBeNaN();
  });
  it("Phi nos pontos de referência e nas caudas", () => {
    expect(normalCdf(0)).toBe(0.5);
    expect(normalCdf(1.96)).toBeCloseTo(0.9750021048517796, 13);
    expect(normalCdf(1)).toBeCloseTo(0.8413447460685429, 13);
    expect(normalCdf(-5) / 2.866515718791939e-7).toBeCloseTo(1, 9);
    expect(normalCdf(-8) / 6.22096057427178e-16).toBeCloseTo(1, 7);
  });
  it("quantis críticos com 12 casas", () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.9599639845400536, 12);
    expect(normalQuantile(0.95)).toBeCloseTo(1.6448536269514722, 12);
    expect(normalQuantile(0.995)).toBeCloseTo(2.5758293035489004, 12);
    expect(normalQuantile(0.8)).toBeCloseTo(0.8416212335729144, 12);
    expect(normalQuantile(0.5)).toBeCloseTo(0, 14);
    expect(normalQuantile(0.001)).toBeCloseTo(-3.090232306167813, 11);
  });
  it("quantil fora de (0,1) é NaN", () => {
    for (const p of [0, 1, -1, 2, Number.NaN]) expect(normalQuantile(p)).toBeNaN();
  });
  it("propriedade: quantil e Phi são inversas e Phi é simétrica", () => {
    fc.assert(
      fc.property(fc.double({ min: 1e-9, max: 1 - 1e-9, noNaN: true }), (p) => {
        expect(Math.abs(normalCdf(normalQuantile(p)) - p) / Math.min(p, 1 - p)).toBeLessThan(1e-9);
      }),
    );
    fc.assert(fc.property(fc.double({ min: -6, max: 6, noNaN: true }), (x) => { expect(normalCdf(x) + normalCdf(-x)).toBeCloseTo(1, 12); }));
  });
});

const get = <T>(r: { ok: true; value: T } | { ok: false; error: string }): T => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("testSignificance", () => {
  it("exemplo publicado (Stata/Agresti): z, p e IC", () => {
    const r = get(testSignificance({ a: { visitors: 11034, conversions: 189 }, b: { visitors: 11037, conversions: 104 }, confidenceBp: 9500, tails: 2 }));
    // O manual arredonda as taxas para 0,0171 e 0,0094; com as contagens exatas o z fica em 5,0 (5,0023 no manual).
    expect(r.z).toBeCloseTo(-5.0023, 1);
    expect(r.pValue).toBeLessThan(1e-6);
    expect(r.diff).toBeCloseTo(-0.0077, 4);
    expect(r.ci.low).toBeCloseTo(-0.0107154, 3);
    expect(r.ci.high).toBeCloseTo(-0.0046846, 3);
    expect(r.significant).toBe(true);
    expect(r.winner).toBe("a");
    expect(r.warnings).toEqual([]);
  });
  it("sem diferença: p = 1, inconclusivo", () => {
    const r = get(testSignificance({ a: { visitors: 1000, conversions: 50 }, b: { visitors: 1000, conversions: 50 }, confidenceBp: 9500, tails: 2 }));
    expect(r.z).toBe(0);
    expect(r.pValue).toBe(1);
    expect(r.winner).toBe("none");
    expect(r.relativeUplift).toBe(0);
  });
  it("z calculado à mão: 200/1000 vs 240/1000 -> z = 2,1004 (p bilateral 0,0357)", () => {
    // p agrupado = 0,22; ep = sqrt(0,22*0,78*0,002) = 0,018526; z = 0,04/0,018526 = 2,1593.
    const r = get(testSignificance({ a: { visitors: 1000, conversions: 200 }, b: { visitors: 1000, conversions: 240 }, confidenceBp: 9500, tails: 2 }));
    expect(r.z).toBeCloseTo(0.04 / Math.sqrt(0.22 * 0.78 * 0.002), 10);
    expect(r.pValue).toBeCloseTo(2 * (1 - normalCdf(2.159301)), 4);
    expect(r.relativeUplift).toBeCloseTo(0.2, 12);
    expect(r.winner).toBe("b");
  });
  it("unilateral só declara B melhor", () => {
    const worse = get(testSignificance({ a: { visitors: 1000, conversions: 240 }, b: { visitors: 1000, conversions: 200 }, confidenceBp: 9500, tails: 1 }));
    expect(worse.winner).toBe("none");
    const better = get(testSignificance({ a: { visitors: 1000, conversions: 200 }, b: { visitors: 1000, conversions: 240 }, confidenceBp: 9500, tails: 1 }));
    expect(better.winner).toBe("b");
    expect(better.pValue).toBeLessThan(0.02);
  });
  it("zero conversões nos dois braços: sem variação e sem NaN", () => {
    const r = get(testSignificance({ a: { visitors: 100, conversions: 0 }, b: { visitors: 100, conversions: 0 }, confidenceBp: 9500, tails: 2 }));
    expect(r.z).toBeNull();
    expect(r.pValue).toBe(1);
    expect(r.warnings).toContain("no-variation");
    expect(r.warnings).toContain("small-sample");
    expect(r.ci.low).toBe(0);
  });
  it("taxa zero no controle: ganho relativo indefinido", () => {
    const r = get(testSignificance({ a: { visitors: 100, conversions: 0 }, b: { visitors: 100, conversions: 10 }, confidenceBp: 9500, tails: 2 }));
    expect(r.relativeUplift).toBeNull();
  });
  it.each([
    [{ a: { visitors: 10, conversions: -1 }, b: { visitors: 10, conversions: 1 } }, "invalid-count"],
    [{ a: { visitors: 10.5, conversions: 1 }, b: { visitors: 10, conversions: 1 } }, "invalid-count"],
    [{ a: { visitors: Number.NaN, conversions: 1 }, b: { visitors: 10, conversions: 1 } }, "invalid-count"],
    [{ a: { visitors: 0, conversions: 0 }, b: { visitors: 10, conversions: 1 } }, "no-visitors"],
    [{ a: { visitors: 10, conversions: 11 }, b: { visitors: 10, conversions: 1 } }, "conversions-exceed-visitors"],
    [{ a: { visitors: 10, conversions: 1 }, b: { visitors: 10, conversions: 11 } }, "conversions-exceed-visitors"],
  ] as const)("entrada hostil %#", (arms, error) => {
    expect(testSignificance({ ...arms, confidenceBp: 9500, tails: 2 })).toEqual({ ok: false, error });
  });
  it("confiança e caudas inválidas", () => {
    const arms = { a: { visitors: 10, conversions: 1 }, b: { visitors: 10, conversions: 1 } };
    for (const c of [4999, 10_000, 95.5, Number.NaN]) expect(testSignificance({ ...arms, confidenceBp: c, tails: 2 })).toEqual({ ok: false, error: "invalid-confidence" });
    expect(testSignificance({ ...arms, confidenceBp: 9500, tails: 3 as 1 })).toEqual({ ok: false, error: "invalid-tails" });
  });
  it("propriedades: p em [0,1], IC contém a diferença, trocar A e B inverte o sinal", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100_000 }), fc.integer({ min: 1, max: 100_000 }), fc.nat(), fc.nat(), (na, nb, ca, cb) => {
        const a = { visitors: na, conversions: ca % (na + 1) };
        const b = { visitors: nb, conversions: cb % (nb + 1) };
        const r = get(testSignificance({ a, b, confidenceBp: 9500, tails: 2 }));
        const s = get(testSignificance({ a: b, b: a, confidenceBp: 9500, tails: 2 }));
        expect(r.pValue).toBeGreaterThanOrEqual(0);
        expect(r.pValue).toBeLessThanOrEqual(1);
        expect(r.ci.low).toBeLessThanOrEqual(r.diff + 1e-12);
        expect(r.ci.high).toBeGreaterThanOrEqual(r.diff - 1e-12);
        expect(s.diff).toBeCloseTo(-r.diff, 12);
        expect(s.pValue).toBeCloseTo(r.pValue, 10);
      }),
    );
  });
  it("propriedade: mais confiança nunca estreita o IC", () => {
    fc.assert(
      fc.property(fc.integer({ min: 20, max: 5000 }), fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }), (n, ca, cb) => {
        const arms = { a: { visitors: n, conversions: ca }, b: { visitors: n, conversions: cb } };
        const lo = get(testSignificance({ ...arms, confidenceBp: 9000, tails: 2 }));
        const hi = get(testSignificance({ ...arms, confidenceBp: 9900, tails: 2 }));
        expect(hi.ci.high - hi.ci.low).toBeGreaterThanOrEqual(lo.ci.high - lo.ci.low - 1e-12);
      }),
    );
  });
});

describe("sampleSize", () => {
  it("manual Stata, exemplo 1: 0,001 vs 0,015 (simétrico) -> 635 por grupo, 1270 no total", () => {
    const r = get(sampleSize({ baselineBp: 10, mdeBp: 140, mdeKind: "absolute", confidenceBp: 9500, powerBp: 8000, tails: 2 }));
    expect(r.perGroup).toBe(635);
    expect(r.total).toBe(1270);
  });
  it("caso clássico 20% -> 25% (80% de poder, 5% bilateral): 1094 por grupo", () => {
    // Fleiss, Statistical Methods for Rates and Proportions; mesma fórmula do Stata.
    const r = get(sampleSize({ baselineBp: 2000, mdeBp: 500, mdeKind: "absolute", confidenceBp: 9500, powerBp: 8000, tails: 2 }));
    expect(r.perGroup).toBe(1094);
  });
  it("relativo e absoluto equivalentes dão o mesmo n", () => {
    const rel = get(sampleSize({ baselineBp: 2000, mdeBp: 2500, mdeKind: "relative", confidenceBp: 9500, powerBp: 8000, tails: 2 }));
    expect(rel.perGroup).toBe(1094);
    expect(rel.p2).toBeCloseTo(0.25, 12);
  });
  it("unilateral precisa de menos amostra; mais poder precisa de mais", () => {
    const base = { baselineBp: 500, mdeBp: 2000, mdeKind: "relative", confidenceBp: 9500, powerBp: 8000 } as const;
    const two = get(sampleSize({ ...base, tails: 2 })).perGroup;
    const one = get(sampleSize({ ...base, tails: 1 })).perGroup;
    const more = get(sampleSize({ ...base, tails: 2, powerBp: 9000 })).perGroup;
    expect(one).toBeLessThan(two);
    expect(more).toBeGreaterThan(two);
  });
  it("erros: baseline, mde, confiança, poder, caudas, alvo fora de faixa e inviável", () => {
    const ok = { baselineBp: 500, mdeBp: 1000, mdeKind: "relative", confidenceBp: 9500, powerBp: 8000, tails: 2 } as const;
    expect(sampleSize({ ...ok, baselineBp: 0 })).toEqual({ ok: false, error: "invalid-baseline" });
    expect(sampleSize({ ...ok, baselineBp: 10_000 })).toEqual({ ok: false, error: "invalid-baseline" });
    expect(sampleSize({ ...ok, mdeBp: 0 })).toEqual({ ok: false, error: "invalid-mde" });
    expect(sampleSize({ ...ok, mdeKind: "x" as "relative" })).toEqual({ ok: false, error: "invalid-mde" });
    expect(sampleSize({ ...ok, confidenceBp: 100 })).toEqual({ ok: false, error: "invalid-confidence" });
    expect(sampleSize({ ...ok, powerBp: 10_000 })).toEqual({ ok: false, error: "invalid-power" });
    expect(sampleSize({ ...ok, tails: 0 as 1 })).toEqual({ ok: false, error: "invalid-tails" });
    expect(sampleSize({ ...ok, baselineBp: 9500, mdeBp: 1000, mdeKind: "absolute" })).toEqual({ ok: false, error: "target-out-of-range" });
    expect(sampleSize({ ...ok, baselineBp: 1, mdeBp: 1, mdeKind: "relative" })).toEqual({ ok: false, error: "too-large" });
  });
  it("propriedade: n é inteiro positivo e cresce quando o efeito diminui", () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 5000 }), fc.integer({ min: 500, max: 5000 }), (baselineBp, mdeBp) => {
        const mk = (m: number) => sampleSize({ baselineBp, mdeBp: m, mdeKind: "relative", confidenceBp: 9500, powerBp: 8000, tails: 2 });
        const big = mk(mdeBp);
        const small = mk(Math.max(1, Math.floor(mdeBp / 2)));
        if (big.ok && small.ok) {
          expect(Number.isInteger(big.value.perGroup)).toBe(true);
          expect(big.value.perGroup).toBeGreaterThan(0);
          expect(small.value.perGroup).toBeGreaterThanOrEqual(big.value.perGroup);
        }
      }),
    );
  });
});

describe("testDurationDays", () => {
  it("arredonda para cima e rejeita tráfego inválido", () => {
    expect(testDurationDays(1270, 300)).toBe(5);
    expect(testDurationDays(0, 10)).toBe(0);
    expect(testDurationDays(100, 0)).toBeNull();
    expect(testDurationDays(100, 1.5)).toBeNull();
    expect(testDurationDays(-1, 10)).toBeNull();
  });
});
