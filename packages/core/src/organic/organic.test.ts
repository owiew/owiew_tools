import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CTR_BP, ctrBp, estimateClicks, estimateOrganic, parseKeywordRows } from "./index";

describe("curva de CTR", () => {
  it("traz os dez valores publicados pela fonte (First Page Sage 2026, CTR combinado)", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => ctrBp(p))).toEqual([710, 300, 170, 110, 70, 60, 40, 30, 20, 20]);
    expect(CTR_BP).toHaveLength(10);
  });
  it("nunca cresce ao descer de posição", () => {
    for (let i = 1; i < CTR_BP.length; i++) expect(CTR_BP[i]!).toBeLessThanOrEqual(CTR_BP[i - 1]!);
  });
  it("posição fora da primeira página ou inválida vale zero", () => {
    for (const p of [0, -1, 11, 100, 1.5, NaN, Infinity]) expect(ctrBp(p)).toBe(0);
  });
  it("estimateClicks multiplica volume por CTR com inteiros", () => {
    expect(estimateClicks(10_000, 1)).toBe(710);
    expect(estimateClicks(1000, 3)).toBe(17);
    expect(estimateClicks(1, 10)).toBe(0);
    expect(estimateClicks(2, 2)).toBe(0);
    expect(estimateClicks(7, 1)).toBe(0);
    expect(estimateClicks(8, 1)).toBe(1);
    expect(estimateClicks(5000, 15)).toBe(0);
    expect(estimateClicks(1_000_000_000, 1)).toBe(71_000_000);
  });
  it("propriedade: mais volume nunca dá menos cliques e subir de posição nunca piora", () => {
    fc.assert(fc.property(fc.nat(1_000_000), fc.nat(1_000_000), fc.integer({ min: 2, max: 10 }), (a, b, p) => {
      const [lo, hi] = a < b ? [a, b] : [b, a];
      expect(estimateClicks(lo, p)).toBeLessThanOrEqual(estimateClicks(hi, p));
      expect(estimateClicks(hi, p - 1)).toBeGreaterThanOrEqual(estimateClicks(hi, p));
    }));
  });
});

describe("estimateOrganic", () => {
  const kw = [
    { keyword: "tênis", volume: 10_000, position: 5 },
    { keyword: "meia", volume: 2_000, position: 12 },
  ];
  it("cenário de posição alvo: ganho e totais", () => {
    const r = estimateOrganic(kw, { kind: "target", position: 1 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.rows[0]).toMatchObject({ currentClicks: 70, newClicks: 710, gainClicks: 640, newPosition: 1 });
    expect(r.value.rows[1]).toMatchObject({ currentClicks: 0, newClicks: 142, newPosition: 1 });
    expect(r.value.totalCurrent).toBe(70);
    expect(r.value.totalNew).toBe(852);
    expect(r.value.totalGain).toBe(782);
  });
  it("cenário de subir N posições nunca passa da posição 1", () => {
    const r = estimateOrganic(kw, { kind: "rise", steps: 3 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.rows.map((x) => x.newPosition)).toEqual([2, 9]);
    const big = estimateOrganic(kw, { kind: "rise", steps: 99 });
    expect(big.ok && big.value.rows.map((x) => x.newPosition)).toEqual([1, 1]);
  });
  it("alvo pior que a posição atual não piora o resultado", () => {
    const r = estimateOrganic(kw, { kind: "target", position: 8 });
    expect(r.ok && r.value.rows.map((x) => x.newPosition)).toEqual([5, 8]);
    expect(r.ok && r.value.totalGain).toBeGreaterThanOrEqual(0);
  });
  it.each([
    [[], { kind: "target", position: 1 }, "no-keywords"],
    [[{ keyword: "a", volume: -1, position: 1 }], { kind: "target", position: 1 }, "invalid-volume"],
    [[{ keyword: "a", volume: 1.5, position: 1 }], { kind: "target", position: 1 }, "invalid-volume"],
    [[{ keyword: "a", volume: 2e9, position: 1 }], { kind: "target", position: 1 }, "invalid-volume"],
    [[{ keyword: "a", volume: 1, position: 0 }], { kind: "target", position: 1 }, "invalid-position"],
    [[{ keyword: "a", volume: 1, position: 101 }], { kind: "target", position: 1 }, "invalid-position"],
    [[{ keyword: "a", volume: 1, position: 3 }], { kind: "target", position: 0 }, "invalid-scenario"],
    [[{ keyword: "a", volume: 1, position: 3 }], { kind: "rise", steps: -1 }, "invalid-scenario"],
    [[{ keyword: "a", volume: 1, position: 3 }], { kind: "rise", steps: NaN }, "invalid-scenario"],
  ] as const)("recusa entrada inválida %#", (k, s, error) => {
    expect(estimateOrganic(k as never, s as never)).toEqual({ ok: false, error });
  });
  it("recusa lista acima do limite", () => {
    const many = Array.from({ length: 201 }, () => ({ keyword: "a", volume: 1, position: 1 }));
    expect(estimateOrganic(many, { kind: "target", position: 1 })).toEqual({ ok: false, error: "too-many-keywords" });
  });
  it("propriedade: ganho nunca é negativo e total é a soma das linhas", () => {
    fc.assert(fc.property(
      fc.array(fc.record({ keyword: fc.string({ minLength: 1 }), volume: fc.nat(10_000_000), position: fc.integer({ min: 1, max: 100 }) }), { minLength: 1, maxLength: 30 }),
      fc.integer({ min: 1, max: 100 }),
      (list, target) => {
        const r = estimateOrganic(list, { kind: "target", position: target });
        if (!r.ok) throw new Error(r.error);
        expect(r.value.totalGain).toBe(r.value.rows.reduce((a, x) => a + x.gainClicks, 0));
        for (const row of r.value.rows) expect(row.gainClicks).toBeGreaterThanOrEqual(0);
      },
    ));
  });
});

describe("parseKeywordRows", () => {
  it("lê linhas com ponto e vírgula, milhar pt-br e pula o cabeçalho", () => {
    const r = parseKeywordRows("palavra;volume;posição\ntênis azul;12.100;4\n\nmeia;900;11\n", "pt-br");
    expect(r.errors).toEqual([]);
    expect(r.rows).toEqual([{ keyword: "tênis azul", volume: 12100, position: 4 }, { keyword: "meia", volume: 900, position: 11 }]);
  });
  it("aceita vírgula e tab e milhar em inglês", () => {
    expect(parseKeywordRows("shoes,12,100,4", "en").errors).toEqual([{ line: 1, error: "columns" }]);
    expect(parseKeywordRows('"shoes","12,100",4', "en").rows).toEqual([{ keyword: "shoes", volume: 12100, position: 4 }]);
    expect(parseKeywordRows("shoes\t500\t2", "en").rows).toHaveLength(1);
  });
  it("aponta o erro por linha sem perder as boas", () => {
    const r = parseKeywordRows("a;10;1\nb;x;1\nc;10;0\nd;10;101\n;10;1\ne;10\nf;-5;1\ng;10;1.5", "pt-br");
    expect(r.rows).toHaveLength(1);
    expect(r.errors).toEqual([
      { line: 2, error: "volume" }, { line: 3, error: "position" }, { line: 4, error: "position" },
      { line: 5, error: "keyword" }, { line: 6, error: "columns" }, { line: 7, error: "volume" }, { line: 8, error: "position" },
    ]);
  });
  it("recusa byte nulo na palavra-chave e texto vazio", () => {
    expect(parseKeywordRows("a\u0000b;10;1", "pt-br").errors).toEqual([{ line: 1, error: "keyword" }]);
    expect(parseKeywordRows("", "pt-br")).toEqual({ rows: [], errors: [], truncated: false });
  });
  it("trunca acima do limite", () => {
    const text = Array.from({ length: 205 }, (_, i) => `k${i};10;1`).join("\n");
    const r = parseKeywordRows(text, "pt-br");
    expect(r.rows).toHaveLength(200);
    expect(r.truncated).toBe(true);
  });
  it("propriedade: nunca lança e toda linha válida respeita os limites", () => {
    fc.assert(fc.property(fc.string({ unit: "binary", maxLength: 300 }), (text) => {
      const r = parseKeywordRows(text, "pt-br");
      for (const row of r.rows) {
        expect(row.position).toBeGreaterThanOrEqual(1);
        expect(row.position).toBeLessThanOrEqual(100);
        expect(Number.isInteger(row.volume)).toBe(true);
      }
    }));
  });
});
