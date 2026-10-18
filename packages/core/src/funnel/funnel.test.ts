import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ceilDiv, roundDiv, toSafe } from "./big-math";
import { type FunnelInput, calcFunnel } from "./calc-funnel";
import { calcScenarios, scaleBp } from "./scenarios";

const base: FunnelInput = {
  sales: 50,
  leadToSaleBp: 1000,
  clickToLeadBp: 500,
  media: { kind: "cpc", cpcCents: 150 },
  ticketCents: 60_000,
};

const get = (i: FunnelInput) => {
  const r = calcFunnel(i);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("calcFunnel", () => {
  it("exemplo canônico por CPC: 50 vendas, 10%, 5%, CPC 1,50", () => {
    const r = get(base);
    expect(r).toMatchObject({
      leads: 500, clicks: 10_000, impressions: null, budgetCents: 1_500_000,
      cplCents: 3000, cpaCents: 30_000, revenueCents: 3_000_000, roas: 2,
    });
  });

  it("modo CTR + CPM passa por impressões", () => {
    const r = get({
      sales: 30, leadToSaleBp: 500, clickToLeadBp: 2500,
      media: { kind: "ctr-cpm", ctrBp: 120, cpmCents: 3000 }, ticketCents: null,
    });
    expect(r).toMatchObject({
      leads: 600, clicks: 2400, impressions: 200_000, budgetCents: 600_000,
      cplCents: 1000, cpaCents: 20_000, revenueCents: null, roas: null,
    });
  });

  it("arredonda para cima: 7 vendas a 3% pedem 234 leads, não 233", () => {
    const r = get({ ...base, sales: 7, leadToSaleBp: 300, clickToLeadBp: 10_000 });
    expect(r.leads).toBe(234);
    expect(r.clicks).toBe(234);
  });

  it("sensibilidade: conversão da página de 5% para 4% sobe a verba em 25%", () => {
    expect(get({ ...base, clickToLeadBp: 400 }).budgetCents).toBe(1_875_000);
  });

  it("CPC zero e ticket zero são válidos e não dividem por zero", () => {
    const r = get({ ...base, media: { kind: "cpc", cpcCents: 0 }, ticketCents: 0 });
    expect(r.budgetCents).toBe(0);
    expect(r.cplCents).toBe(0);
    expect(r.roas).toBeNull();
  });

  it.each([
    [{ sales: 0 }, "invalid-sales"],
    [{ sales: -1 }, "invalid-sales"],
    [{ sales: 1.5 }, "invalid-sales"],
    [{ sales: Number.NaN }, "invalid-sales"],
    [{ sales: Number.POSITIVE_INFINITY }, "invalid-sales"],
    [{ sales: Number.MAX_SAFE_INTEGER + 1 }, "invalid-sales"],
    [{ leadToSaleBp: 0 }, "zero-lead-rate"],
    [{ leadToSaleBp: 10_001 }, "invalid-lead-rate"],
    [{ leadToSaleBp: -5 }, "invalid-lead-rate"],
    [{ leadToSaleBp: 0.5 }, "invalid-lead-rate"],
    [{ clickToLeadBp: 0 }, "zero-click-rate"],
    [{ clickToLeadBp: Number.NaN }, "invalid-click-rate"],
    [{ media: { kind: "cpc", cpcCents: -1 } }, "invalid-cpc"],
    [{ media: { kind: "cpc", cpcCents: 1.5 } }, "invalid-cpc"],
    [{ media: { kind: "ctr-cpm", ctrBp: 0, cpmCents: 100 } }, "zero-ctr"],
    [{ media: { kind: "ctr-cpm", ctrBp: 10_001, cpmCents: 100 } }, "invalid-ctr"],
    [{ media: { kind: "ctr-cpm", ctrBp: 100, cpmCents: -1 } }, "invalid-cpm"],
    [{ ticketCents: -1 }, "invalid-ticket"],
    [{ ticketCents: Number.NaN }, "invalid-ticket"],
  ] as const)("entrada inválida %j -> %s", (patch, error) => {
    expect(calcFunnel({ ...base, ...patch } as FunnelInput)).toEqual({ ok: false, error });
  });

  it("overflow na verba, nas impressões e na receita vira erro, não NaN", () => {
    const big = Number.MAX_SAFE_INTEGER;
    expect(calcFunnel({ ...base, sales: big, leadToSaleBp: 1, clickToLeadBp: 1 })).toEqual({ ok: false, error: "overflow" });
    expect(calcFunnel({ ...base, sales: 10 ** 12, media: { kind: "cpc", cpcCents: 10 ** 6 } })).toEqual({ ok: false, error: "overflow" });
    expect(calcFunnel({
      ...base, sales: 10 ** 9, leadToSaleBp: 1, clickToLeadBp: 10_000,
      media: { kind: "ctr-cpm", ctrBp: 1, cpmCents: 0 }, ticketCents: 0,
    })).toEqual({ ok: false, error: "overflow" });
    expect(calcFunnel({ ...base, sales: big, ticketCents: big, leadToSaleBp: 10_000, clickToLeadBp: 10_000, media: { kind: "cpc", cpcCents: 0 } })).toEqual({ ok: false, error: "overflow" });
  });

  it("limites seguros no extremo ainda calculam sem perder precisão", () => {
    const r = get({ ...base, sales: 1_000_000_000, leadToSaleBp: 10_000, clickToLeadBp: 10_000, media: { kind: "cpc", cpcCents: 1 }, ticketCents: null });
    expect(r.budgetCents).toBe(1_000_000_000);
  });

  it("nunca lança com entrada hostil (unicode, byte nulo coagidos, objetos)", () => {
    const hostile = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0, 1e308, "a\u0000b" as unknown as number];
    for (const v of hostile) {
      expect(() => calcFunnel({ ...base, sales: v, leadToSaleBp: v, clickToLeadBp: v, ticketCents: v })).not.toThrow();
      expect(() => calcFunnel({ ...base, media: { kind: "cpc", cpcCents: v } })).not.toThrow();
      expect(() => calcFunnel({ ...base, media: { kind: "ctr-cpm", ctrBp: v, cpmCents: v } })).not.toThrow();
    }
  });

  it("propriedade: o funil fecha (leads x taxa >= vendas, cliques x taxa >= leads) e é mínimo", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }), fc.integer({ min: 1, max: 10_000 }), fc.integer({ min: 1, max: 10_000 }),
        (sales, lead, click) => {
          const r = get({ ...base, sales, leadToSaleBp: lead, clickToLeadBp: click, ticketCents: null });
          expect(r.leads * lead).toBeGreaterThanOrEqual(sales * 10_000);
          expect((r.leads - 1) * lead).toBeLessThan(sales * 10_000);
          expect(r.clicks * click).toBeGreaterThanOrEqual(r.leads * 10_000);
          expect((r.clicks - 1) * click).toBeLessThan(r.leads * 10_000);
          expect(r.budgetCents).toBe(r.clicks * 150);
        },
      ),
    );
  });

  it("propriedade: taxa menor nunca reduz a verba", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 1, max: 5000 }), (sales, a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const worse = get({ ...base, sales, clickToLeadBp: lo, ticketCents: null });
        const better = get({ ...base, sales, clickToLeadBp: hi, ticketCents: null });
        expect(worse.budgetCents).toBeGreaterThanOrEqual(better.budgetCents);
      }),
    );
  });
});

describe("calcScenarios", () => {
  it("cenários padrão -20% / base / +20% nas duas taxas", () => {
    const r = calcScenarios(base);
    if (!r.ok) throw new Error(r.error);
    const budgets = r.value.map((row) => (row.result.ok ? row.result.value.budgetCents : -1));
    expect(r.value.map((row) => row.scenario.id)).toEqual(["pessimistic", "base", "optimistic"]);
    expect(budgets).toEqual([2_343_750, 1_500_000, 1_042_500]);
  });

  it("entrada inválida devolve o erro da base; fator inválido é recusado", () => {
    expect(calcScenarios({ ...base, leadToSaleBp: 0 })).toEqual({ ok: false, error: "zero-lead-rate" });
    expect(calcScenarios(base, [{ id: "base", factorPct: 0 }]).ok).toBe(false);
    expect(calcScenarios(base, [{ id: "base", factorPct: 1.5 }]).ok).toBe(false);
  });

  it("overflow em um cenário não derruba os outros", () => {
    const r = calcScenarios({ ...base, sales: 10 ** 9, leadToSaleBp: 10_000, clickToLeadBp: 10_000, media: { kind: "cpc", cpcCents: 7_000_000 }, ticketCents: null });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.map((row) => row.result.ok)).toEqual([false, true, true]);
  });

  it("scaleBp respeita 1..10000 e arredonda sem float", () => {
    expect(scaleBp(500, 80)).toBe(400);
    expect(scaleBp(10_000, 120)).toBe(10_000);
    expect(scaleBp(1, 80)).toBe(1);
    expect(scaleBp(333, 120)).toBe(400);
  });
});

describe("big-math", () => {
  it("ceilDiv, roundDiv e toSafe", () => {
    expect(ceilDiv(7n, 3n)).toBe(3n);
    expect(ceilDiv(6n, 3n)).toBe(2n);
    expect(roundDiv(5n, 2n)).toBe(3n);
    expect(roundDiv(4n, 3n)).toBe(1n);
    expect(toSafe(BigInt(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
    expect(toSafe(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBeNull();
  });
});
