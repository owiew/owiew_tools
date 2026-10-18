import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  KEYWORD_LIMITS, cleanKeywords, combineKeywords, formatKeyword, groupByTerm, groupsToCsv, keywordRowsToCsv,
  limitViolation, normalizeTerm, seedNegatives, suggestNegatives, wordCount, type CleanOptions,
} from "./index";

/*
 * Regras de referência: sintaxe de correspondência (ampla = texto, frase =
 * "texto", exata = [texto]) e comportamento das negativas (não casam variações
 * próximas, plural nem sinônimo): Ajuda do Google Ads, "Sobre tipos de
 * correspondência de palavras-chave" e "Sobre palavras-chave negativas".
 * Limites de 80 caracteres e 10 palavras: Google Ads API, mensagem KeywordInfo.
 */

const NORM = { lowercase: true, stripAccents: false, stripSymbols: true } as const;
const CLEAN: CleanOptions = { ...NORM, ignoreWordOrder: false, removeOverLimit: true, sort: "none" };
const val = <T>(r: { ok: true; value: T } | { ok: false; error: string }): T => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("formatKeyword e normalizeTerm", () => {
  it("sintaxe das três correspondências", () => {
    expect(formatKeyword("tênis azul", "broad")).toBe("tênis azul");
    expect(formatKeyword("tênis azul", "phrase")).toBe('"tênis azul"');
    expect(formatKeyword("tênis azul", "exact")).toBe("[tênis azul]");
  });
  it("normaliza caixa, espaço, controle e símbolos proibidos", () => {
    expect(normalizeTerm("  Tênis   AZUL\t", NORM)).toBe("tênis azul");
    expect(normalizeTerm('[comprar] "tênis"! (azul)', NORM)).toBe("comprar tênis azul");
    expect(normalizeTerm("a\0b\x07c", NORM)).toBe("a b c");
    expect(normalizeTerm("Promoção de Verão", { ...NORM, stripAccents: true })).toBe("promocao de verao");
    expect(normalizeTerm("A-B", { ...NORM, lowercase: false })).toBe("A-B");
  });
  it("contagem e limites", () => {
    expect(wordCount("  a  b c ")).toBe(3);
    expect(wordCount("")).toBe(0);
    expect(limitViolation("a".repeat(KEYWORD_LIMITS.chars))).toBeNull();
    expect(limitViolation("a".repeat(81))).toBe("chars");
    expect(limitViolation("a b c d e f g h i j")).toBeNull();
    expect(limitViolation("a b c d e f g h i j k")).toBe("words");
  });
  it("propriedade: saída sem espaço nas pontas, sem espaço duplo e sem símbolo proibido", () => {
    fc.assert(fc.property(fc.string({ unit: "binary" }), (s) => {
      const t = normalizeTerm(s, NORM);
      expect(t).toBe(t.trim());
      expect(t.includes("  ")).toBe(false);
      expect(/[!@%^()={};~`<>?\\|,"[\]]/.test(t)).toBe(false);
      expect(normalizeTerm(t, NORM)).toBe(t);
    }));
  });
});

describe("combineKeywords", () => {
  it("A x B x C nos 3 tipos, com contagem exata e A como laço externo", () => {
    const r = val(combineKeywords({ lists: [["comprar", "preço"], ["tênis", "sapato"], ["azul"]], matchTypes: ["broad", "phrase", "exact"], limit: 1000 }));
    expect(r.total).toBe(2 * 2 * 1 * 3);
    expect(r.items).toHaveLength(12);
    expect(r.items.slice(0, 3).map((i) => i.text)).toEqual(["comprar tênis azul", '"comprar tênis azul"', "[comprar tênis azul]"]);
    expect(r.items[3]?.keyword).toBe("comprar sapato azul");
    expect(r.truncated).toBe(false);
  });
  it("ignora lista vazia, normaliza e deduplica", () => {
    const r = val(combineKeywords({ lists: [["A", "a", " "], [], ["b!"]], matchTypes: ["exact"], limit: 10 }));
    expect(r.items.map((i) => i.text)).toEqual(["[a b]"]);
  });
  it("respeita o limite e informa o total real", () => {
    const big = Array.from({ length: 100 }, (_, i) => `t${i}`);
    const r = val(combineKeywords({ lists: [big, big, big], matchTypes: ["broad", "exact"], limit: 50 }));
    expect(r.items).toHaveLength(50);
    expect(r.total).toBe(2_000_000);
    expect(r.truncated).toBe(true);
  });
  it("conta combinações que o Google rejeitaria", () => {
    const r = val(combineKeywords({ lists: [["a".repeat(50)], ["b".repeat(40)]], matchTypes: ["broad"], limit: 5 }));
    expect(r.overLimit).toBe(1);
    const three = val(combineKeywords({ lists: [["a".repeat(50)], ["b".repeat(40)]], matchTypes: ["broad", "phrase", "exact"], limit: 50 }));
    expect(three.items).toHaveLength(3);
    expect(three.overLimit).toBe(1);
  });
  it("separador customizado", () => {
    const r = val(combineKeywords({ lists: [["a"], ["b"]], matchTypes: ["broad"], limit: 5, separator: "-" }));
    expect(r.items[0]?.keyword).toBe("a-b");
  });
  it("erros", () => {
    const ok = { lists: [["a"]], matchTypes: ["broad"], limit: 5 } as const;
    expect(combineKeywords({ ...ok, limit: 0 })).toEqual({ ok: false, error: "invalid-limit" });
    expect(combineKeywords({ ...ok, limit: 100_001 })).toEqual({ ok: false, error: "invalid-limit" });
    expect(combineKeywords({ ...ok, limit: 1.5 })).toEqual({ ok: false, error: "invalid-limit" });
    expect(combineKeywords({ ...ok, matchTypes: [] })).toEqual({ ok: false, error: "no-match-type" });
    expect(combineKeywords({ ...ok, lists: [[], [" "], ["!!"]] })).toEqual({ ok: false, error: "no-terms" });
    expect(combineKeywords({ ...ok, lists: [["a"], ["b"], ["c"], ["d"]] })).toEqual({ ok: false, error: "too-many-lists" });
    expect(combineKeywords({ ...ok, lists: [Array.from({ length: 10_001 }, (_, i) => `x${i}`)] })).toEqual({ ok: false, error: "list-too-long" });
  });
  it("propriedade: total = produto das listas únicas x tipos; saída <= limite; sem duplicado", () => {
    fc.assert(fc.property(
      fc.array(fc.uniqueArray(fc.stringMatching(/^[a-z]{1,6}$/), { maxLength: 6 }), { minLength: 1, maxLength: 3 }),
      fc.integer({ min: 1, max: 40 }),
      (lists, limit) => {
        const r = combineKeywords({ lists, matchTypes: ["broad", "phrase"], limit });
        const filled = lists.filter((l) => l.length > 0);
        if (filled.length === 0) { expect(r.ok).toBe(false); return; }
        const x = val(r);
        expect(x.total).toBe(filled.reduce((n, l) => n * l.length, 1) * 2);
        expect(x.items.length).toBe(Math.min(limit, x.total));
        expect(new Set(x.items.map((i) => i.text)).size).toBe(x.items.length);
      },
    ), { numRuns: 100 });
  });
});

describe("cleanKeywords", () => {
  it("divide por linha, vírgula, ponto e vírgula e tab; remove duplicados e vazios", () => {
    const r = val(cleanKeywords("Tênis Azul\ntênis azul, sapato;  \n\tbota\nSAPATO", CLEAN));
    expect(r.kept).toEqual(["tênis azul", "sapato", "bota"]);
    expect(r.stats).toMatchObject({ input: 4 + 1 - 1 + 1, kept: 3, duplicates: 2 });
  });
  it("acento: só unifica quando o usuário pede para remover", () => {
    expect(val(cleanKeywords("tênis\ntenis", CLEAN)).kept).toEqual(["tênis", "tenis"]);
    expect(val(cleanKeywords("tênis\ntenis", { ...CLEAN, stripAccents: true })).kept).toEqual(["tenis"]);
  });
  it("ignora a ordem das palavras quando pedido", () => {
    expect(val(cleanKeywords("azul tênis\ntênis azul", { ...CLEAN, ignoreWordOrder: true })).kept).toEqual(["azul tênis"]);
    expect(val(cleanKeywords("azul tênis\ntênis azul", CLEAN)).kept).toHaveLength(2);
  });
  it("remove o que passa de 80 caracteres ou 10 palavras, com motivo", () => {
    const r = val(cleanKeywords(`${"a".repeat(81)}\na b c d e f g h i j k\nok`, CLEAN));
    expect(r.kept).toEqual(["ok"]);
    expect(r.removed.map((x) => x.reason)).toEqual(["too-long", "too-many-words"]);
    expect(val(cleanKeywords("a b c d e f g h i j k", { ...CLEAN, removeOverLimit: false })).kept).toHaveLength(1);
  });
  it("linha só com símbolos vira 'empty' e ordena de A a Z", () => {
    const r = val(cleanKeywords("zeta\n!!!\nalfa\n  \n", { ...CLEAN, sort: "az" }));
    expect(r.kept).toEqual(["alfa", "zeta"]);
    expect(r.removed).toEqual([{ text: "!!!", reason: "empty" }]);
  });
  it("entrada vazia e grande demais", () => {
    expect(val(cleanKeywords("", CLEAN)).kept).toEqual([]);
    expect(cleanKeywords("a\n".repeat(100_001), CLEAN)).toEqual({ ok: false, error: "too-many-lines" });
  });
  it("propriedade: idempotente, sem duplicado e dentro dos limites", () => {
    fc.assert(fc.property(fc.string({ unit: "binary", maxLength: 300 }), (s) => {
      const once = val(cleanKeywords(s, CLEAN)).kept;
      const twice = val(cleanKeywords(once.join("\n"), CLEAN)).kept;
      expect(twice).toEqual(once);
      expect(new Set(once.map((k) => k.toLowerCase())).size).toBe(once.length);
      for (const k of once) expect(limitViolation(k)).toBeNull();
    }));
  });
});

describe("groupByTerm", () => {
  const kws = ["tênis azul", "tênis preto", "tênis corrida", "sapato social", "sapato couro", "bota"];
  it("agrupa pelo termo mais frequente e manda o resto para 'outros'", () => {
    const g = groupByTerm(kws);
    expect(g.map((x) => x.term)).toEqual(["tênis", "sapato", ""]);
    expect(g[0]?.keywords).toEqual(["tênis azul", "tênis preto", "tênis corrida"]);
    expect(g[2]?.keywords).toEqual(["bota"]);
  });
  it("minSize 1 deixa cada termo ter o seu grupo; ligações não viram termo", () => {
    expect(groupByTerm(["bota de couro"], 1).map((x) => x.term)).toEqual(["couro"]);
    expect(groupByTerm(["de da"], 1)).toEqual([{ term: "", keywords: ["de da"] }]);
    expect(groupByTerm([])).toEqual([]);
  });
  it("propriedade: toda palavra-chave aparece exatamente uma vez", () => {
    fc.assert(fc.property(fc.array(fc.stringMatching(/^[a-z]{3,5}( [a-z]{3,5}){0,2}$/), { maxLength: 30 }), (list) => {
      const flat = groupByTerm(list).flatMap((g) => g.keywords);
      expect([...flat].sort()).toEqual([...list].sort());
    }));
  });
});

describe("suggestNegatives", () => {
  const input = { searchTerms: ["tênis azul grátis", "tênis grátis download", "comprar tênis de corrida", "emprego fábrica de tênis"], keepKeywords: ["comprar tênis", "tênis corrida"], minCount: 1 };
  it("sugere palavras fora das suas palavras-chave, por frequência", () => {
    const r = val(suggestNegatives(input));
    expect(r[0]).toEqual({ word: "grátis", count: 2 });
    expect(r.map((x) => x.word)).toEqual(expect.arrayContaining(["download", "emprego", "fábrica", "azul"]));
    expect(r.map((x) => x.word)).not.toContain("tênis");
    expect(r.map((x) => x.word)).not.toContain("de");
  });
  it("compara sem acento e respeita minCount", () => {
    const r = val(suggestNegatives({ searchTerms: ["TENIS grátis", "grátis"], keepKeywords: ["tênis"], minCount: 2 }));
    expect(r).toEqual([{ word: "grátis", count: 2 }]);
  });
  it("erros", () => {
    expect(suggestNegatives({ ...input, minCount: 0 })).toEqual({ ok: false, error: "invalid-min-count" });
    expect(suggestNegatives({ ...input, searchTerms: ["", "  ", "!!"] })).toEqual({ ok: false, error: "no-search-terms" });
    expect(suggestNegatives({ ...input, searchTerms: Array.from({ length: 100_001 }, () => "a") })).toEqual({ ok: false, error: "too-many-terms" });
  });
  it("sementes por idioma são cópias independentes", () => {
    const a = seedNegatives("pt-br");
    a.push("x");
    expect(seedNegatives("pt-br")).not.toContain("x");
    expect(seedNegatives("en")).toContain("free");
    expect(seedNegatives("es")).toContain("gratis");
  });
  it("propriedade: nenhuma sugestão pertence às palavras-chave mantidas", () => {
    fc.assert(fc.property(fc.array(fc.stringMatching(/^[a-z]{2,6}( [a-z]{2,6}){0,2}$/), { minLength: 1, maxLength: 20 }), fc.array(fc.stringMatching(/^[a-z]{2,6}$/), { maxLength: 5 }), (terms, keep) => {
      const r = suggestNegatives({ searchTerms: terms, keepKeywords: keep, minCount: 1 });
      if (!r.ok) return;
      for (const s of r.value) expect(keep).not.toContain(s.word);
    }));
  });
});

describe("exportação CSV", () => {
  it("palavras-chave com tipo e coluna formatada", () => {
    const csv = keywordRowsToCsv([{ keyword: "tênis", type: "exact" }, { keyword: "a, b", type: "phrase" }], "negative");
    expect(csv).toBe('﻿keyword,match type,formatted,kind\r\ntênis,Exact,[tênis],negative\r\n"a, b",Phrase,"""a, b""",negative');
  });
  it("neutraliza injeção de fórmula nas duas exportações", () => {
    const a = keywordRowsToCsv([{ keyword: "=cmd|' /C calc'!A0", type: "broad" }, { keyword: "+x", type: "broad" }], "keyword");
    const b = groupsToCsv([{ term: "@grupo", keywords: ["-1+1"] }, { term: "", keywords: ["ok"] }]);
    for (const csv of [a, b]) expect(csv.split("\r\n").slice(1).join("\n")).not.toMatch(/(^|\n|,)[=+\-@]/);
    expect(b).toContain("other,ok");
  });
});
