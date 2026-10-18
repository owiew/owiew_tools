import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { calcCpmReach, deriveClicks, mulDiv, type CpmReachInput } from "./index";

const MAX = Number.MAX_SAFE_INTEGER;
const val = (i: CpmReachInput) => {
  const r = calcCpmReach(i);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};
const err = (i: CpmReachInput) => {
  const r = calcCpmReach(i);
  return r.ok ? "ok" : r.error;
};

describe("mulDiv", () => {
  it("floor, ceil e round", () => {
    expect(mulDiv(7, 1, 2, "floor")).toBe(3);
    expect(mulDiv(7, 1, 2, "ceil")).toBe(4);
    expect(mulDiv(7, 1, 2, "round")).toBe(4);
    expect(mulDiv(6, 1, 4, "round")).toBe(2);
    expect(mulDiv(6, 1, 3, "ceil")).toBe(2);
    expect(mulDiv(0, 5, 3, "ceil")).toBe(0);
  });
  it("devolve null (sem lançar) para contrato violado e overflow", () => {
    expect(mulDiv(-1, 1, 1, "floor")).toBeNull();
    expect(mulDiv(1, 1, 0, "floor")).toBeNull();
    expect(mulDiv(1.5, 1, 1, "floor")).toBeNull();
    expect(mulDiv(NaN, 1, 1, "round")).toBeNull();
    expect(mulDiv(MAX, 2, 1, "ceil")).toBeNull();
    expect(mulDiv(MAX, 1, 1, "floor")).toBe(MAX);
  });
});

describe("calcCpmReach: caminho feliz", () => {
  it("modo impressões: R$ 5.000 a CPM R$ 25 = 200.000 impressões", () => {
    const r = val({ mode: "impressions", spendCents: 500_000, cpmCents: 2500 });
    expect(r).toMatchObject({ impressions: 200_000, reach: null, frequencyCenti: null, clicks: null, cpcCents: null });
  });
  it("modo alcance: frequência 2,5 dá 80.000 pessoas", () => {
    const r = val({ mode: "reach", spendCents: 500_000, cpmCents: 2500, frequencyCenti: 250 });
    expect(r.impressions).toBe(200_000);
    expect(r.reach).toBe(80_000);
  });
  it("modo CPM: R$ 25.000 por 1.000.000 de impressões = R$ 25,00", () => {
    const r = val({ mode: "cpm", spendCents: 2_500_000, impressions: 1_000_000 });
    expect(r.cpmCents).toBe(2500);
  });
  it("modo verba: alcance 200.000 a frequência 2,5 e CPM R$ 25 = R$ 12.500", () => {
    const r = val({ mode: "budget", reach: 200_000, frequencyCenti: 250, cpmCents: 2500 });
    expect(r).toMatchObject({ impressions: 500_000, spendCents: 1_250_000, reach: 200_000 });
  });
  it("CTR e CPC: 1,5% de 200.000 = 3.000 cliques, CPC R$ 1,67", () => {
    const r = val({ mode: "impressions", spendCents: 500_000, cpmCents: 2500, ctrBp: 150 });
    expect(r.clicks).toBe(3000);
    expect(r.cpcCents).toBe(167);
  });
  it("CTR zero: sem cliques e sem CPC, sem divisão por zero", () => {
    const r = val({ mode: "impressions", spendCents: 500_000, cpmCents: 2500, ctrBp: 0 });
    expect(r.clicks).toBe(0);
    expect(r.cpcCents).toBeNull();
  });
  it("arredondamentos documentados: impressões e alcance para baixo, verba para cima", () => {
    expect(val({ mode: "impressions", spendCents: 1, cpmCents: 3 }).impressions).toBe(333);
    expect(val({ mode: "reach", spendCents: 1, cpmCents: 3, frequencyCenti: 300 }).reach).toBe(111);
    expect(val({ mode: "budget", reach: 1, frequencyCenti: 100, cpmCents: 1 }).spendCents).toBe(1);
    expect(val({ mode: "cpm", spendCents: 1, impressions: 3 }).cpmCents).toBe(333);
  });
  it("verba zero é válida e dá zero impressões", () => {
    expect(val({ mode: "impressions", spendCents: 0, cpmCents: 100 }).impressions).toBe(0);
  });
});

describe("calcCpmReach: erros", () => {
  it("CPM zero, impressões zero, alcance zero", () => {
    expect(err({ mode: "impressions", spendCents: 100, cpmCents: 0 })).toBe("zero-cpm");
    expect(err({ mode: "reach", spendCents: 100, cpmCents: 0, frequencyCenti: 100 })).toBe("zero-cpm");
    expect(err({ mode: "cpm", spendCents: 100, impressions: 0 })).toBe("zero-impressions");
    expect(err({ mode: "budget", reach: 0, frequencyCenti: 100, cpmCents: 100 })).toBe("zero-reach");
  });
  it("frequência menor que 1 é inválida", () => {
    expect(err({ mode: "reach", spendCents: 100, cpmCents: 100, frequencyCenti: 99 })).toBe("invalid-frequency");
    expect(err({ mode: "budget", reach: 5, frequencyCenti: 0, cpmCents: 100 })).toBe("invalid-frequency");
    expect(err({ mode: "reach", spendCents: 100, cpmCents: 100, frequencyCenti: 100 })).toBe("ok");
  });
  it("CTR fora de 0 a 10000", () => {
    expect(err({ mode: "impressions", spendCents: 1, cpmCents: 1, ctrBp: 10_001 })).toBe("invalid-ctr");
    expect(err({ mode: "impressions", spendCents: 1, cpmCents: 1, ctrBp: -1 })).toBe("invalid-ctr");
    expect(err({ mode: "impressions", spendCents: 1, cpmCents: 1, ctrBp: 0.5 })).toBe("invalid-ctr");
    expect(err({ mode: "impressions", spendCents: 1, cpmCents: 1, ctrBp: 10_000 })).toBe("ok");
  });
  it("overflow em todos os modos", () => {
    expect(err({ mode: "impressions", spendCents: MAX, cpmCents: 1 })).toBe("overflow");
    expect(err({ mode: "reach", spendCents: MAX, cpmCents: 1, frequencyCenti: 100 })).toBe("overflow");
    expect(err({ mode: "cpm", spendCents: MAX, impressions: 1 })).toBe("overflow");
    expect(err({ mode: "budget", reach: MAX, frequencyCenti: 200, cpmCents: 1 })).toBe("overflow");
    expect(err({ mode: "budget", reach: 1e12, frequencyCenti: 100, cpmCents: MAX })).toBe("overflow");
    expect(err({ mode: "impressions", spendCents: 9_007_199_254_740, cpmCents: 1000, ctrBp: 10_000 })).toBe("ok");
    expect(err({ mode: "impressions", spendCents: MAX - 1, cpmCents: 1000, ctrBp: 10_000 })).toBe("ok");
  });
  it("overflow na derivação de cliques", () => {
    expect(deriveClicks(MAX, 1, 10_000)).toMatchObject({ ok: true });
    expect(deriveClicks(MAX, 1, 0)).toMatchObject({ ok: true, value: { clicks: 0, cpcCents: null } });
  });
  it("entradas hostis nunca lançam e viram erro", () => {
    const hostile: unknown[] = [NaN, Infinity, -Infinity, -1, 1.5, "1", null, undefined, "\u0000", MAX + 1, {}];
    for (const h of hostile) {
      const inputs = [
        { mode: "impressions", spendCents: h, cpmCents: 100 },
        { mode: "impressions", spendCents: 100, cpmCents: h },
        { mode: "reach", spendCents: 100, cpmCents: 100, frequencyCenti: h },
        { mode: "cpm", spendCents: 100, impressions: h },
        { mode: "budget", reach: h, frequencyCenti: 100, cpmCents: 100 },
        { mode: "impressions", spendCents: 100, cpmCents: 100, ctrBp: h === undefined ? 1.5 : h },
        { mode: "nope" },
      ] as unknown as CpmReachInput[];
      for (const i of inputs) expect(() => calcCpmReach(i)).not.toThrow();
      expect(calcCpmReach(inputs[0] as CpmReachInput).ok).toBe(false);
      expect(calcCpmReach(inputs[6] as CpmReachInput)).toEqual({ ok: false, error: "invalid-amount" });
    }
  });
});

describe("propriedades", () => {
  const spend = fc.integer({ min: 0, max: 10 ** 12 });
  const cpm = fc.integer({ min: 1, max: 10 ** 7 });
  const freq = fc.integer({ min: 100, max: 10_000 });

  it("impressões: piso exato (imp x CPM <= verba x 1000 < (imp+1) x CPM)", () => {
    fc.assert(fc.property(spend, cpm, (s, c) => {
      const imp = val({ mode: "impressions", spendCents: s, cpmCents: c }).impressions;
      expect(BigInt(imp) * BigInt(c)).toBeLessThanOrEqual(BigInt(s) * 1000n);
      expect(BigInt(imp + 1) * BigInt(c)).toBeGreaterThan(BigInt(s) * 1000n);
    }));
  });
  it("alcance nunca passa das impressões e cresce com menos frequência", () => {
    fc.assert(fc.property(spend, cpm, freq, (s, c, f) => {
      const r = val({ mode: "reach", spendCents: s, cpmCents: c, frequencyCenti: f });
      expect(r.reach as number).toBeLessThanOrEqual(r.impressions);
      const lower = val({ mode: "reach", spendCents: s, cpmCents: c, frequencyCenti: f + 1 });
      expect(lower.reach as number).toBeLessThanOrEqual(r.reach as number);
    }));
  });
  it("verba para a meta entrega pelo menos a meta de alcance (arredonda para cima)", () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 10 ** 9 }), freq, cpm, (reach, f, c) => {
      const b = val({ mode: "budget", reach, frequencyCenti: f, cpmCents: c });
      const back = val({ mode: "reach", spendCents: b.spendCents, cpmCents: c, frequencyCenti: f });
      expect(back.reach as number).toBeGreaterThanOrEqual(reach);
      expect(b.spendCents).toBeGreaterThanOrEqual(0);
    }));
  });
  it("CPM calculado reproduz a verba dentro de meio centavo por mil", () => {
    fc.assert(fc.property(spend, fc.integer({ min: 1, max: 10 ** 12 }), (s, imp) => {
      const r = val({ mode: "cpm", spendCents: s, impressions: imp });
      expect(Math.abs(r.cpmCents * imp - s * 1000)).toBeLessThanOrEqual(imp / 2 + 1);
    }));
  });
  it("qualquer entrada numérica arbitrária: nunca lança nem devolve não inteiro", () => {
    const any = fc.oneof(fc.double(), fc.integer(), fc.constantFrom(MAX, -0, 0));
    fc.assert(fc.property(any, any, any, (a, b, c) => {
      const r = calcCpmReach({ mode: "reach", spendCents: a, cpmCents: b, frequencyCenti: c, ctrBp: 100 });
      if (r.ok) for (const v of [r.value.impressions, r.value.reach, r.value.spendCents]) expect(Number.isSafeInteger(v)).toBe(true);
    }));
  });
});
