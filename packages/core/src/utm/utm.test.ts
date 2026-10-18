import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { MAX_BATCH_ROWS, batchToCsv, buildBatch, parseBatch } from "./batch";
import { buildUtmUrl } from "./build-utm-url";
import { normalizeValue } from "./normalize-value";
import { DEFAULT_RULES, coerceRules } from "./rules";

const F = { source: "Google", medium: "CPC", campaign: "Black Friday 2026" };

describe("normalizeValue", () => {
  it("padrão da casa: minúsculas, sem acento, hífen", () => {
    expect(normalizeValue("  Promoção de Verão!  ", DEFAULT_RULES)).toBe("promocao-de-verao");
    expect(normalizeValue("black   friday__2026", DEFAULT_RULES)).toBe("black-friday__2026");
  });
  it("respeita as opções", () => {
    expect(normalizeValue("Promoção Já", { lowercase: false, stripAccents: false, separator: "_" })).toBe("Promoção_Já");
    expect(normalizeValue("a b.c", { lowercase: true, stripAccents: true, separator: "." })).toBe("a.b.c");
  });
  it("hostis: null byte, emoji, RTL, vazio", () => {
    expect(normalizeValue("a\0b", DEFAULT_RULES)).toBe("a-b");
    expect(normalizeValue("oferta \u{1F525}", DEFAULT_RULES)).toBe("oferta");
    expect(normalizeValue("\u202eabc", DEFAULT_RULES)).toBe("abc");
    expect(normalizeValue("   ", DEFAULT_RULES)).toBe("");
    expect(normalizeValue("İstanbul", DEFAULT_RULES)).toBe("istanbul");
  });
  it("propriedade: idempotente e só emite caracteres seguros", () => {
    const rules = fc.record({
      lowercase: fc.boolean(),
      stripAccents: fc.boolean(),
      separator: fc.constantFrom("-", "_", "." as const),
    });
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), rules, (s, r) => {
        const once = normalizeValue(s, r);
        expect(normalizeValue(once, r)).toBe(once);
        expect(once).toMatch(/^[\p{L}\p{N}_.-]*$/u);
      }),
    );
  });
});

describe("coerceRules", () => {
  it("aceita válido e corrige lixo", () => {
    expect(coerceRules({ lowercase: false, stripAccents: false, separator: "_" })).toEqual({ lowercase: false, stripAccents: false, separator: "_" });
    expect(coerceRules({ lowercase: "sim", separator: "?" })).toEqual(DEFAULT_RULES);
    expect(coerceRules(null)).toEqual(DEFAULT_RULES);
    expect(coerceRules("x")).toEqual(DEFAULT_RULES);
  });
});

describe("buildUtmUrl", () => {
  it("gera a URL canônica e avisa da normalização", () => {
    const r = buildUtmUrl("https://loja.com/produto", F, DEFAULT_RULES);
    expect(r.ok && r.value.url).toBe("https://loja.com/produto?utm_source=google&utm_medium=cpc&utm_campaign=black-friday-2026");
    expect(r.ok && r.value.warnings.map((w) => w.code)).toEqual(["value-normalized", "value-normalized", "value-normalized"]);
  });
  it("preserva parâmetros e fragmento, substitui só as utm_ definidas", () => {
    const r = buildUtmUrl("loja.com/p?cor=azul&utm_source=velho&UTM_Medium=x&utm_term=fica#secao", { ...F, content: "banner a" }, DEFAULT_RULES);
    expect(r.ok && r.value.url).toBe("https://loja.com/p?cor=azul&utm_term=fica&utm_source=google&utm_medium=cpc&utm_campaign=black-friday-2026&utm_content=banner-a#secao");
    expect(r.ok && r.value.warnings).toContainEqual({ code: "scheme-assumed" });
    expect(r.ok && r.value.warnings).toContainEqual({ code: "utm-replaced", keys: ["utm_source", "utm_medium"] });
  });
  it("codifica valores com unicode quando não se remove acento", () => {
    const r = buildUtmUrl("https://a.com", { ...F, campaign: "verão" }, { lowercase: true, stripAccents: false, separator: "-" });
    expect(r.ok && r.value.url).toContain("utm_campaign=ver%C3%A3o");
  });
  it.each([
    ["", F, "empty-url"],
    ["ftp://a.com", F, "unsupported-scheme"],
    ["javascript:alert(1)", F, "unsupported-scheme"],
    ["http://", F, "invalid-url"],
    ["a b", F, "invalid-url"],
    [`https://a.com/${"x".repeat(9000)}`, F, "url-too-long"],
    ["https://a.com", { ...F, source: " ! " }, "missing-source"],
    ["https://a.com", { ...F, medium: "" }, "missing-medium"],
    ["https://a.com", { ...F, campaign: "***" }, "missing-campaign"],
  ] as const)("recusa %j", (url, fields, error) => {
    expect(buildUtmUrl(url, fields, DEFAULT_RULES)).toEqual({ ok: false, error });
  });
  it("nunca lança e sempre devolve URL http(s) parseável", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), fc.string({ unit: "binary" }), (url, v) => {
        const r = buildUtmUrl(url, { source: v, medium: v, campaign: v }, DEFAULT_RULES);
        if (r.ok) expect(["http:", "https:"]).toContain(new URL(r.value.url).protocol);
      }),
    );
  });
});

describe("lote", () => {
  it("modo urls preserva vírgulas dentro da URL", () => {
    const r = parseBatch("https://a.com/?x=1,2\n\n https://b.com \n", "urls");
    expect(r.ok && r.value.map((x) => x.url)).toEqual(["https://a.com/?x=1,2", "https://b.com"]);
  });
  it("modo csv com cabeçalho (ponto e vírgula) e override por linha", () => {
    const r = parseBatch("url;utm_source;campaign\nhttps://a.com;News;Verão\nhttps://b.com;;", "csv");
    expect(r.ok && r.value[0]?.fields).toEqual({ source: "News", campaign: "Verão" });
    expect(r.ok && r.value[1]?.fields).toEqual({});
  });
  it("modo csv sem cabeçalho usa posição e ignora colunas extras", () => {
    const r = parseBatch("https://a.com,fb,social,promo,t,c,9,extra", "csv");
    expect(r.ok && r.value[0]?.fields).toEqual({ source: "fb", medium: "social", campaign: "promo", term: "t", content: "c", id: "9" });
  });
  it("recusa vazio e excesso", () => {
    expect(parseBatch(" \n ", "urls")).toEqual({ ok: false, error: "empty" });
    expect(parseBatch("\n", "csv")).toEqual({ ok: false, error: "empty" });
    expect(parseBatch("https://a.com\n".repeat(MAX_BATCH_ROWS + 1), "urls")).toEqual({ ok: false, error: "too-many-rows" });
  });
  it("uma linha ruim não derruba as outras e o CSV sai protegido", () => {
    const rows = parseBatch("=HYPERLINK(\"http://evil\")\nhttps://ok.com/a", "urls");
    if (!rows.ok) throw new Error("parse");
    const results = buildBatch(rows.value, F, DEFAULT_RULES);
    expect(results.map((x) => x.result.ok)).toEqual([false, true]);
    const csv = batchToCsv(results);
    expect(csv.startsWith("\uFEFFline,original,url,status,warnings")).toBe(true);
    expect(csv).toContain("\"'=HYPERLINK(");
    expect(csv).toContain("value-normalized");
    expect(csv.split("\r\n")).toHaveLength(3);
  });
});
