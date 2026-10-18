import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { calcRoas } from "./calc-roas";

const get = (r: ReturnType<typeof calcRoas>) => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("calcRoas", () => {
  it("exemplo canônico: R$ 10.000 de receita, R$ 2.500 de mídia, margem 40%", () => {
    const r = get(calcRoas({ revenueCents: 1_000_000, spendCents: 250_000, marginBp: 4000 }));
    expect(r.roas).toBe(4);
    expect(r.breakEvenRoas).toBe(2.5);
    expect(r.contributionCents).toBe(400_000);
    expect(r.profitCents).toBe(150_000);
    expect(r.profitMarginBp).toBe(1500);
    expect(r.breakEvenRevenueCents).toBe(625_000);
    expect(r.maxSpendCents).toBe(400_000);
    expect(r.verdict).toBe("profit");
  });

  it("prejuízo, com lucro negativo e margem percentual negativa", () => {
    const r = get(calcRoas({ revenueCents: 100_000, spendCents: 60_000, marginBp: 4000 }));
    expect(r.profitCents).toBe(-20_000);
    expect(r.profitMarginBp).toBe(-2000);
    expect(r.verdict).toBe("loss");
  });

  it("exatamente no equilíbrio", () => {
    const r = get(calcRoas({ revenueCents: 100_000, spendCents: 50_000, marginBp: 5000 }));
    expect(r.profitCents).toBe(0);
    expect(r.verdict).toBe("breakeven");
    expect(r.roas).toBe(r.breakEvenRoas);
  });

  it("sem gasto e sem receita: nada de divisão por zero", () => {
    const r = get(calcRoas({ revenueCents: 0, spendCents: 0, marginBp: 0 }));
    expect(r).toMatchObject({ roas: null, breakEvenRoas: null, profitMarginBp: null, breakEvenRevenueCents: null, verdict: "no-spend" });
  });

  it("centavos ímpares arredondam sem erro de float", () => {
    const r = get(calcRoas({ revenueCents: 3333, spendCents: 1, marginBp: 3333 }));
    expect(r.contributionCents).toBe(1111);
  });

  it.each([
    [{ revenueCents: -1, spendCents: 0, marginBp: 1 }, "invalid-amount"],
    [{ revenueCents: 1.5, spendCents: 0, marginBp: 1 }, "invalid-amount"],
    [{ revenueCents: 1, spendCents: Number.NaN, marginBp: 1 }, "invalid-amount"],
    [{ revenueCents: 1, spendCents: 1, marginBp: 10_001 }, "invalid-margin"],
    [{ revenueCents: 1, spendCents: 1, marginBp: -1 }, "invalid-margin"],
  ] as const)("entrada inválida %j -> %s", (input, error) => {
    expect(calcRoas(input)).toEqual({ ok: false, error });
  });

  it("propriedade: ROAS acima do equilíbrio <=> lucro positivo", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 ** 9 }), fc.integer({ min: 1, max: 10 ** 9 }), fc.integer({ min: 100, max: 10_000 }), (rev, spend, bp) => {
        const r = get(calcRoas({ revenueCents: rev, spendCents: spend, marginBp: bp }));
        // Exato em inteiros: rev*bp > spend*10000  <=>  roas > 10000/bp (contribuição sem arredondar).
        const exactProfit = BigInt(rev) * BigInt(bp) - BigInt(spend) * 10_000n;
        if (exactProfit > 10_000n) expect(r.profitCents).toBeGreaterThan(0);
        if (exactProfit < -10_000n) expect(r.profitCents).toBeLessThan(0);
      }),
    );
  });

  it("propriedade: lucro = contribuição - gasto e equilíbrio = 1/margem", () => {
    fc.assert(
      fc.property(fc.nat(10 ** 10), fc.nat(10 ** 10), fc.integer({ min: 1, max: 10_000 }), (rev, spend, bp) => {
        const r = get(calcRoas({ revenueCents: rev, spendCents: spend, marginBp: bp }));
        expect(r.profitCents).toBe(r.contributionCents - spend);
        expect(r.breakEvenRoas).toBeCloseTo(1 / (bp / 10_000), 9);
      }),
    );
  });
});
