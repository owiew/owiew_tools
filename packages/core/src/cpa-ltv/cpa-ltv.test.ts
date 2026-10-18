import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { type CpaLtvInput, type CpaLtvResult, cacFromBudget, calcCpaLtv, crossGte, roundMulDiv } from "./index";

const BASE: CpaLtvInput = {
  ticketCents: 20_000,
  marginBp: 4000,
  purchasesCentis: 250,
  cacCents: 8000,
  targetRatioTenths: 30,
  lifetimeMonths: null,
  paybackTargetMonths: null,
};

const get = (i: Partial<CpaLtvInput> = {}): CpaLtvResult => {
  const r = calcCpaLtv({ ...BASE, ...i });
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("calcCpaLtv", () => {
  it("exemplo canônico: ticket 200, margem 40%, 2,5 compras, CAC 80", () => {
    const r = get();
    expect(r.ltvRevenueCents).toBe(50_000);
    expect(r.ltvMarginCents).toBe(20_000);
    expect(r.breakEvenCpaCents).toBe(8000);
    expect(r.maxCpaTargetCents).toBe(6667);
    expect(r.ratioCentis).toBe(250);
    expect(r.verdict).toBe("attention");
    expect(r.profitPerCustomerCents).toBe(12_000);
    expect(r.paybackPurchasesCentis).toBe(100);
    expect(r.paysBackInPeriod).toBe(true);
    expect(r.paybackMonthsTenths).toBeNull();
    expect(r.maxCpaPaybackCents).toBeNull();
  });

  it("payback em meses e CPA máximo para o prazo desejado", () => {
    const r = get({ lifetimeMonths: 12, paybackTargetMonths: 6 });
    expect(r.paybackMonthsTenths).toBe(48);
    expect(r.maxCpaPaybackCents).toBe(10_000);
  });

  it("faixas do veredito: prejuízo, atenção, saudável (limites exatos)", () => {
    expect(get({ cacCents: 20_001 }).verdict).toBe("loss");
    expect(get({ cacCents: 20_000 }).verdict).toBe("attention");
    expect(get({ cacCents: 6666 }).verdict).toBe("healthy");
    expect(get({ cacCents: 6667 }).verdict).toBe("attention");
    expect(get({ cacCents: 6666, targetRatioTenths: 40 }).verdict).toBe("attention");
  });

  it("CAC zero ou ausente: sem razão, sem divisão por zero", () => {
    for (const cacCents of [0, null]) {
      const r = get({ cacCents });
      expect(r.ratioCentis).toBeNull();
      expect(r.verdict).toBe("no-cac");
    }
    expect(get({ cacCents: 0 }).profitPerCustomerCents).toBe(20_000);
    expect(get({ cacCents: 0 }).paybackPurchasesCentis).toBe(0);
    expect(get({ cacCents: null }).profitPerCustomerCents).toBeNull();
    expect(get({ cacCents: null }).paysBackInPeriod).toBeNull();
  });

  it("margem zero: LTV de margem zero e payback inexistente", () => {
    const r = get({ marginBp: 0, lifetimeMonths: 12, paybackTargetMonths: 6 });
    expect(r.ltvMarginCents).toBe(0);
    expect(r.breakEvenCpaCents).toBe(0);
    expect(r.maxCpaTargetCents).toBe(0);
    expect(r.ratioCentis).toBe(0);
    expect(r.verdict).toBe("loss");
    expect(r.paybackPurchasesCentis).toBeNull();
    expect(r.paybackMonthsTenths).toBeNull();
    expect(r.maxCpaPaybackCents).toBe(0);
    expect(r.paysBackInPeriod).toBe(false);
  });

  it("compras zero: LTV zero, CPA máximo zero, sem NaN", () => {
    const r = get({ purchasesCentis: 0 });
    expect(r.ltvRevenueCents).toBe(0);
    expect(r.ltvMarginCents).toBe(0);
    expect(r.maxCpaTargetCents).toBe(0);
    expect(r.verdict).toBe("loss");
    expect(r.paybackPurchasesCentis).toBe(100);
  });

  it("ticket zero: tudo zero e payback nulo", () => {
    const r = get({ ticketCents: 0 });
    expect(r.ltvMarginCents).toBe(0);
    expect(r.paybackPurchasesCentis).toBeNull();
  });

  it.each([
    [{ ticketCents: -1 }, "invalid-amount"],
    [{ ticketCents: 1.5 }, "invalid-amount"],
    [{ ticketCents: Number.NaN }, "invalid-amount"],
    [{ cacCents: Number.POSITIVE_INFINITY }, "invalid-amount"],
    [{ cacCents: -5 }, "invalid-amount"],
    [{ marginBp: 10_001 }, "invalid-margin"],
    [{ marginBp: -1 }, "invalid-margin"],
    [{ purchasesCentis: 1_000_001 }, "invalid-purchases"],
    [{ purchasesCentis: 0.5 }, "invalid-purchases"],
    [{ targetRatioTenths: 0 }, "invalid-ratio"],
    [{ targetRatioTenths: 1001 }, "invalid-ratio"],
    [{ lifetimeMonths: 0 }, "invalid-months"],
    [{ lifetimeMonths: 1201 }, "invalid-months"],
    [{ lifetimeMonths: 12, paybackTargetMonths: 0 }, "invalid-months"],
    [{ lifetimeMonths: null, paybackTargetMonths: 6 }, "invalid-months"],
    [{ ticketCents: Number.MAX_SAFE_INTEGER, purchasesCentis: 1_000_000 }, "overflow"],
    [{ ticketCents: Number.MAX_SAFE_INTEGER + 1 }, "invalid-amount"],
  ] as const)("entrada inválida %j -> %s", (patch, error) => {
    expect(calcCpaLtv({ ...BASE, ...patch })).toEqual({ ok: false, error });
  });

  it("overflow na razão e no payback quando os números são enormes", () => {
    const r = calcCpaLtv({ ...BASE, ticketCents: 10 ** 12, purchasesCentis: 100_000, marginBp: 10_000, cacCents: 1 });
    expect(r).toEqual({ ok: false, error: "overflow" });
    const q = calcCpaLtv({ ...BASE, ticketCents: 1, purchasesCentis: 100, marginBp: 1, cacCents: 10 ** 12 });
    expect(q).toEqual({ ok: false, error: "overflow" });
  });

  it("valores no limite não geram NaN nem Infinity", () => {
    const r = get({ ticketCents: 10 ** 9, purchasesCentis: 1_000_000, marginBp: 10_000, cacCents: 10 ** 12 });
    for (const v of Object.values(r)) if (typeof v === "number") expect(Number.isSafeInteger(v)).toBe(true);
  });

  it("propriedade: resultados sempre inteiros seguros e coerentes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 ** 9 }), fc.integer({ min: 0, max: 10_000 }), fc.integer({ min: 0, max: 100_000 }),
        fc.option(fc.integer({ min: 0, max: 10 ** 9 }), { nil: null }), fc.integer({ min: 1, max: 1000 }),
        (ticketCents, marginBp, purchasesCentis, cacCents, targetRatioTenths) => {
          const r = get({ ticketCents, marginBp, purchasesCentis, cacCents, targetRatioTenths });
          expect(r.ltvMarginCents).toBeLessThanOrEqual(r.ltvRevenueCents);
          expect(r.breakEvenCpaCents).toBeLessThanOrEqual(ticketCents);
          if (cacCents !== null) {
            expect(r.profitPerCustomerCents).toBe(r.ltvMarginCents - cacCents);
            expect(r.paysBackInPeriod).toBe(r.ltvMarginCents >= cacCents);
            if (r.verdict === "loss") expect(r.profitPerCustomerCents).toBeLessThan(0);
            if (r.verdict === "healthy") expect(r.ltvMarginCents * 10).toBeGreaterThanOrEqual(cacCents * targetRatioTenths);
          }
        },
      ),
    );
  });

  it("propriedade: gastar no CPA máximo da razão alvo nunca fica abaixo do alvo (salvo 1 centavo de arredondamento)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 ** 8 }), fc.integer({ min: 1, max: 10_000 }), fc.integer({ min: 1, max: 100_000 }), fc.integer({ min: 1, max: 100 }), (t, m, p, tg) => {
        const r = get({ ticketCents: t, marginBp: m, purchasesCentis: p, targetRatioTenths: tg, cacCents: null });
        const atMax = get({ ticketCents: t, marginBp: m, purchasesCentis: p, targetRatioTenths: tg, cacCents: r.maxCpaTargetCents + 1 });
        expect(atMax.verdict === "healthy" && atMax.ratioCentis !== null && atMax.ratioCentis * 10 < tg * 100 - 10_000).toBe(false);
      }),
    );
  });
});

describe("cacFromBudget", () => {
  it("divide a verba pelos clientes com arredondamento", () => {
    expect(cacFromBudget(1_000_000, 125)).toEqual({ ok: true, value: 8000 });
    expect(cacFromBudget(100, 3)).toEqual({ ok: true, value: 33 });
    expect(cacFromBudget(0, 5)).toEqual({ ok: true, value: 0 });
  });
  it("zero clientes e entradas hostis viram erro estável", () => {
    expect(cacFromBudget(100, 0)).toEqual({ ok: false, error: "no-customers" });
    expect(cacFromBudget(-1, 1)).toEqual({ ok: false, error: "invalid-amount" });
    expect(cacFromBudget(Number.NaN, 1)).toEqual({ ok: false, error: "invalid-amount" });
    expect(cacFromBudget(1, 1.5)).toEqual({ ok: false, error: "invalid-customers" });
    expect(cacFromBudget(1, -1)).toEqual({ ok: false, error: "invalid-customers" });
    expect(cacFromBudget(1, 2_000_000_000)).toEqual({ ok: false, error: "invalid-customers" });
    expect(cacFromBudget(Number.POSITIVE_INFINITY, 1)).toEqual({ ok: false, error: "invalid-amount" });
  });
  it("propriedade: CAC x clientes difere da verba em no máximo meio cliente", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 ** 12 }), fc.integer({ min: 1, max: 10 ** 6 }), (b, c) => {
        const r = cacFromBudget(b, c);
        if (!r.ok) throw new Error(r.error);
        expect(Math.abs(r.value * c - b)).toBeLessThanOrEqual(c / 2);
      }),
    );
  });
});

describe("roundMulDiv e crossGte", () => {
  it("arredonda meio para cima e recusa divisor zero e entradas hostis", () => {
    expect(roundMulDiv([1], [2])).toBe(1);
    expect(roundMulDiv([3], [2])).toBe(2);
    expect(roundMulDiv([1], [3])).toBe(0);
    expect(roundMulDiv([5], [0])).toBeNull();
    expect(roundMulDiv([-1], [1])).toBeNull();
    expect(roundMulDiv([Number.NaN], [1])).toBeNull();
    expect(roundMulDiv([Number.MAX_SAFE_INTEGER, 2], [1])).toBeNull();
    expect(roundMulDiv([Number.MAX_SAFE_INTEGER], [1])).toBe(Number.MAX_SAFE_INTEGER);
  });
  it("compara frações sem float", () => {
    expect(crossGte(30, 10, 10, 30)).toBe(true);
    expect(crossGte(299, 10, 100, 30)).toBe(false);
  });
});

describe("entradas hostis de texto na fronteira", () => {
  it("o core só aceita números: byte nulo e unicode viram NaN e são recusados", () => {
    for (const bad of [Number("\u0000"), Number("١٢٣x"), Number("")]) {
      if (Number.isNaN(bad)) expect(calcCpaLtv({ ...BASE, ticketCents: bad })).toEqual({ ok: false, error: "invalid-amount" });
    }
  });
});
