import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { META_LIMITS, RSA_LIMITS, adsToCsv, checkGoogleRsa, checkMeta, countAdChars, cutToLimit, previewGoogleRsa } from "./index";

/*
 * Regras de referência: Ajuda do Google Ads, "Sobre anúncios responsivos de
 * pesquisa" (15 títulos de 30, 4 descrições de 90, caminhos de 15, mínimo 3 e 2;
 * caractere de idioma de largura dupla conta 2); Guia de anúncios do Meta (Feed:
 * texto principal 125, título 27, descrição 27, como recomendação).
 */

const lines = (n: number, len = 10): string[] => Array.from({ length: n }, (_, i) => `${i}`.padEnd(len, "x"));
const base = { headlines: lines(3), descriptions: lines(2, 40), path1: "", path2: "", domain: "exemplo.com" };

describe("countAdChars", () => {
  it("conta ASCII, acento e espaço interno; ignora as pontas", () => {
    expect(countAdChars("abc")).toBe(3);
    expect(countAdChars("  promoção de verão  ")).toBe(17);
    expect(countAdChars("")).toBe(0);
  });
  it("largura dupla vale 2 (CJK, hangul, kana, largura total)", () => {
    expect(countAdChars("日本語")).toBe(6);
    expect(countAdChars("한국")).toBe(4);
    expect(countAdChars("カタカナ")).toBe(8);
    expect(countAdChars("ＡＢ")).toBe(4);
    expect(countAdChars("a日")).toBe(3);
  });
  it("emoji e par substituto contam por ponto de código; byte nulo é ignorado", () => {
    expect(countAdChars("\u{1F600}")).toBe(1);
    expect(countAdChars("a\0b")).toBe(2);
  });
  it("propriedade: nunca negativo, entre 1x e 2x o número de pontos de código", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), (s) => {
        const n = countAdChars(s);
        const cps = Array.from(s.trim().replace(/\0/g, "")).length;
        expect(n).toBeGreaterThanOrEqual(cps);
        expect(n).toBeLessThanOrEqual(cps * 2);
      }),
    );
  });
});

describe("cutToLimit", () => {
  it("corta no limite sem partir caractere nem deixar espaço no fim", () => {
    expect(cutToLimit("abcdef", 3)).toBe("abc");
    expect(cutToLimit("ab cdef", 3)).toBe("ab");
    expect(cutToLimit("日本語", 3)).toBe("日");
    expect(cutToLimit("\u{1F600}\u{1F600}", 1)).toBe("\u{1F600}");
    expect(cutToLimit("abc", 0)).toBe("");
  });
  it("propriedade: o corte cabe no limite e é prefixo", () => {
    fc.assert(fc.property(fc.string(), fc.integer({ min: 0, max: 50 }), (s, lim) => {
      const c = cutToLimit(s, lim);
      expect(countAdChars(c)).toBeLessThanOrEqual(lim);
      expect(s.replace(/\0/g, "").startsWith(c)).toBe(true);
    }));
  });
});

describe("checkGoogleRsa", () => {
  it("mínimo válido está pronto", () => {
    const r = checkGoogleRsa(base);
    expect(r.ready).toBe(true);
    expect(r.issues).toEqual([]);
  });
  it("30 caracteres cabem e 31 estouram em 1", () => {
    const r = checkGoogleRsa({ ...base, headlines: ["a".repeat(30), "b".repeat(31), "c"] });
    expect(r.headlines.map((h) => h.over)).toEqual([0, 1, 0]);
    expect(r.ready).toBe(false);
  });
  it("90 na descrição e 15 no caminho são o limite", () => {
    expect(checkGoogleRsa({ ...base, descriptions: ["d".repeat(90), "e".repeat(91)], path1: "p".repeat(16) })).toMatchObject({ ready: false });
    expect(checkGoogleRsa({ ...base, descriptions: ["d".repeat(90), "e"], path1: "p".repeat(15) }).ready).toBe(true);
  });
  it("faltam títulos e descrições", () => {
    const r = checkGoogleRsa({ ...base, headlines: ["a", "b", ""], descriptions: ["x"] });
    expect(r.issues.map((i) => i.code)).toEqual(["min-headlines", "min-descriptions"]);
    expect(r.ready).toBe(false);
  });
  it("mais de 15 títulos e 4 descrições", () => {
    const r = checkGoogleRsa({ ...base, headlines: lines(16), descriptions: lines(5) });
    expect(r.issues.map((i) => i.code)).toEqual(expect.arrayContaining(["headlines-over-15", "descriptions-over-4"]));
    expect(RSA_LIMITS.headlines).toBe(15);
  });
  it("duplicados ignoram caixa e espaços; são aviso, não bloqueio", () => {
    const r = checkGoogleRsa({ ...base, headlines: ["Compre Já", " compre   já ", "outro"] });
    expect(r.issues).toContainEqual({ code: "duplicate-headline", severity: "warn" });
    expect(r.ready).toBe(true);
  });
  it("caminho 2 sem caminho 1, caractere inválido e exclamação", () => {
    const r = checkGoogleRsa({ ...base, headlines: ["Oferta!", "b", "c"], path1: "", path2: "a b" });
    const codes = r.issues.map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(["path2-without-path1", "path-invalid-chars", "exclamation-headline"]));
    expect(r.ready).toBe(false);
  });
  it("entrada vazia e hostil não lança", () => {
    expect(checkGoogleRsa({ headlines: [], descriptions: [], path1: "", path2: "", domain: "" }).ready).toBe(false);
    expect(() => checkGoogleRsa({ ...base, headlines: ["\0", "<script>", "日".repeat(20)] })).not.toThrow();
    expect(checkGoogleRsa({ ...base, headlines: ["日".repeat(16), "b", "c"] }).headlines[0]?.over).toBe(2);
  });
});

describe("previewGoogleRsa", () => {
  it("URL exibida com caminhos, 3 títulos e 2 descrições", () => {
    const p = previewGoogleRsa({ ...base, headlines: ["A", "", "B", "C", "D"], descriptions: ["x", "y", "z"], path1: "loja", path2: "tenis", domain: "https://www.exemplo.com.br/qualquer?x=1" });
    expect(p.displayUrl).toBe("www.exemplo.com.br/loja/tenis");
    expect(p.headlines).toEqual(["A", "B", "C"]);
    expect(p.descriptions).toEqual(["x", "y"]);
  });
  it("domínio vazio usa um exemplo neutro", () => {
    expect(previewGoogleRsa({ ...base, domain: "" }).displayUrl).toBe("exemplo.com");
  });
});

describe("checkMeta", () => {
  it("dentro do limite não corta", () => {
    const r = checkMeta({ primary: "a".repeat(125), headline: "h".repeat(27), description: "d".repeat(27) });
    expect(r.withinLimits).toBe(true);
    expect(r.primary.shown).toBe("a".repeat(125));
  });
  it("acima do limite corta e põe reticências", () => {
    const r = checkMeta({ primary: "a".repeat(130), headline: "palavra ".repeat(6), description: "" });
    expect(r.withinLimits).toBe(false);
    expect(r.primary.truncated).toBe(true);
    expect(r.primary.shown).toBe(`${"a".repeat(125)}…`);
    expect(r.primary.over).toBe(5);
    expect(r.headline.shown.endsWith("…")).toBe(true);
    expect(r.description.empty).toBe(true);
    expect(META_LIMITS.primary).toBe(125);
  });
  it("propriedade: o texto mostrado nunca passa do limite mais as reticências", () => {
    fc.assert(fc.property(fc.string({ unit: "binary" }), (s) => {
      const r = checkMeta({ primary: s, headline: s, description: s });
      expect(countAdChars(r.headline.shown.replace(/…$/, ""))).toBeLessThanOrEqual(META_LIMITS.headline);
    }));
  });
});

describe("adsToCsv", () => {
  it("lista só campos preenchidos, com situação", () => {
    const g = checkGoogleRsa({ ...base, headlines: ["a".repeat(31), "b", "c"], path1: "loja" });
    const m = checkMeta({ primary: "oi", headline: "", description: "" });
    const csv = adsToCsv(g, m);
    expect(csv.startsWith("﻿platform,field,position,text,length,limit,status")).toBe(true);
    expect(csv).toContain(`google,headline,1,${"a".repeat(31)},31,30,over by 1`);
    expect(csv).toContain("google,path1,1,loja,4,15,ok");
    expect(csv).toContain("meta,primary_text,1,oi,2,125,ok");
    expect(csv).not.toContain("meta,headline");
  });
  it("neutraliza injeção de fórmula e aceita apenas um lado", () => {
    const g = checkGoogleRsa({ ...base, headlines: ['=HYPERLINK("http://x.test")', "+1", "@a"] });
    const csv = adsToCsv(g, null);
    expect(csv).not.toMatch(/(^|[\r\n,])[=+@]/);
    expect(csv).toContain("'=HYPERLINK");
    expect(adsToCsv(null, null)).toBe("﻿platform,field,position,text,length,limit,status");
  });
});
