import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseCsv } from "../csv/parse";
import { buildNameBatch, parseValueList } from "./batch";
import { namingBatchToCsv, type CsvLabels } from "./batch-csv";
import { buildName, isValidOrder } from "./build-name";
import { formatNamingDate, isValidDate, parseIsoDate } from "./format-date";
import { sanitizeBlock, wordJoiner } from "./sanitize-block";
import { splitName } from "./split-name";
import {
  DATE_FORMATS, DEFAULT_NAMING_OPTIONS, MAX_BLOCK_INPUT, MAX_NAMES, SEPARATORS, type BlockKey, type NamingInput,
  type NamingOptions,
} from "./types";

const ORDER: BlockKey[] = ["channel", "objective", "audience", "offer", "date"];
const base: NamingInput = {
  order: ORDER,
  values: { channel: "Meta Ads", objective: "Conversão", audience: "Remarketing 30d", offer: "Black Friday" },
  date: { year: 2026, month: 11, day: 1 },
  dateFormat: "YYYYMMDD",
  locale: "pt-br",
  options: DEFAULT_NAMING_OPTIONS,
};
const good = (i: NamingInput) => {
  const r = buildName(i);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("sanitizeBlock", () => {
  it("minúsculas, sem acento e joiner no lugar de espaços e símbolos", () => {
    expect(sanitizeBlock("  Promoção de Verão! ", DEFAULT_NAMING_OPTIONS)).toBe("promocao-de-verao");
  });
  it("caixa alta e manter", () => {
    expect(sanitizeBlock("Black Friday", { ...DEFAULT_NAMING_OPTIONS, caseMode: "upper" })).toBe("BLACK-FRIDAY");
    expect(sanitizeBlock("Black Friday", { ...DEFAULT_NAMING_OPTIONS, caseMode: "keep" })).toBe("Black-Friday");
  });
  it("mantém acento quando pedido", () => {
    expect(sanitizeBlock("Conversão", { ...DEFAULT_NAMING_OPTIONS, stripAccents: false })).toBe("conversão");
  });
  it("joiner nunca é o separador", () => {
    expect(wordJoiner("-")).toBe("_");
    for (const s of ["_", ".", "|"] as const) expect(wordJoiner(s)).toBe("-");
    expect(sanitizeBlock("a b", { ...DEFAULT_NAMING_OPTIONS, separator: "-" })).toBe("a_b");
  });
  it("entradas hostis viram texto limpo", () => {
    expect(sanitizeBlock("\u0000", DEFAULT_NAMING_OPTIONS)).toBe("");
    expect(sanitizeBlock("a\u0000b", DEFAULT_NAMING_OPTIONS)).toBe("a-b");
    expect(sanitizeBlock("=HYPERLINK(\"x\")", DEFAULT_NAMING_OPTIONS)).toBe("hyperlink-x");
    expect(sanitizeBlock("   ", DEFAULT_NAMING_OPTIONS)).toBe("");
    expect(sanitizeBlock("\u{1F600} oi", DEFAULT_NAMING_OPTIONS)).toBe("oi");
  });
  it("propriedade: idempotente e sem o separador no resultado", () => {
    const opts = fc.record({
      separator: fc.constantFrom(...SEPARATORS),
      caseMode: fc.constantFrom("lower", "upper", "keep" as const),
      stripAccents: fc.boolean(),
    }) as fc.Arbitrary<NamingOptions>;
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), opts, (s, o) => {
        const once = sanitizeBlock(s, o);
        expect(sanitizeBlock(once, o)).toBe(once);
        expect(once.includes(o.separator)).toBe(false);
      }),
    );
  });
});

describe("datas", () => {
  const d = { year: 2026, month: 3, day: 7 };
  it("formatos", () => {
    const out = DATE_FORMATS.map((f) => formatNamingDate(d, f, "pt-br"));
    expect(out).toEqual(["20260307", "2026-03-07", "202603", "2026-03", "260307", "mar26"]);
  });
  it("mês abreviado por idioma", () => {
    const dec = { year: 2025, month: 12, day: 1 };
    expect(formatNamingDate(dec, "MMMYY", "pt-br")).toBe("dez25");
    expect(formatNamingDate(dec, "MMMYY", "en")).toBe("dec25");
    expect(formatNamingDate(dec, "MMMYY", "es")).toBe("dic25");
  });
  it("valida calendário, bissexto incluso", () => {
    expect(isValidDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidDate({ year: 2026, month: 2, day: 29 })).toBe(false);
    expect(isValidDate({ year: 2100, month: 2, day: 29 })).toBe(false);
    expect(isValidDate({ year: 2000, month: 2, day: 29 })).toBe(true);
    expect(isValidDate({ year: 2026, month: 13, day: 1 })).toBe(false);
    expect(isValidDate({ year: 2026, month: 4, day: 31 })).toBe(false);
    expect(isValidDate({ year: 2026, month: 1, day: 0 })).toBe(false);
    expect(isValidDate({ year: NaN, month: 1, day: 1 })).toBe(false);
    expect(isValidDate({ year: 2026.5, month: 1, day: 1 })).toBe(false);
    expect(isValidDate({ year: Infinity, month: 1, day: 1 })).toBe(false);
    expect(isValidDate({ year: 99, month: 1, day: 1 })).toBe(false);
  });
  it("data inexistente formata vazio", () => {
    expect(formatNamingDate({ year: 2026, month: 2, day: 31 }, "YYYYMMDD", "en")).toBe("");
  });
  it("parseIsoDate", () => {
    expect(parseIsoDate("2026-11-01")).toEqual({ ok: true, value: { year: 2026, month: 11, day: 1 } });
    for (const bad of ["", "2026-13-01", "2026-02-30", "26-01-01", "2026/01/01", "2026-1-1", "\u0000", "NaN", "9999999-01-01"]) {
      expect(parseIsoDate(bad)).toEqual({ ok: false, error: "invalid-date" });
    }
  });
});

describe("buildName", () => {
  it("exemplo canônico", () => {
    const o = good(base);
    expect(o.name).toBe("meta-ads_conversao_remarketing-30d_black-friday_20261101");
    expect(o.parts.map((p) => p.key)).toEqual(ORDER);
    expect(o.length).toBe(o.name.length);
    expect(o.warnings).toEqual([]);
  });
  it("ordem editável", () => {
    const o = good({ ...base, order: ["date", "offer", "objective"] });
    expect(o.name).toBe("20261101_black-friday_conversao");
  });
  it("blocos vazios são ignorados e sem data o bloco some", () => {
    const o = good({ ...base, values: { objective: "Leads", offer: "  " }, date: null });
    expect(o.name).toBe("leads");
  });
  it("hífens da data viram joiner conforme o separador", () => {
    expect(good({ ...base, dateFormat: "YYYY-MM", order: ["date"] }).name).toBe("2026-11");
    expect(good({ ...base, dateFormat: "YYYY-MM", order: ["date"], options: { ...DEFAULT_NAMING_OPTIONS, separator: "-" } }).name).toBe("2026_11");
  });
  it("MAIÚSCULAS e separador pipe", () => {
    const o = good({ ...base, order: ["channel", "date"], dateFormat: "MMMYY", options: { separator: "|", caseMode: "upper", stripAccents: true } });
    expect(o.name).toBe("META-ADS|NOV26");
  });
  it("erros estáveis", () => {
    expect(buildName({ ...base, values: {}, date: null })).toEqual({ ok: false, error: "empty" });
    expect(buildName({ ...base, order: ["offer", "offer"] })).toEqual({ ok: false, error: "invalid-order" });
    expect(buildName({ ...base, order: ["foo" as BlockKey] })).toEqual({ ok: false, error: "invalid-order" });
    expect(buildName({ ...base, values: { offer: "x".repeat(MAX_BLOCK_INPUT + 1) } })).toEqual({ ok: false, error: "value-too-long" });
    expect(buildName({ ...base, values: { offer: "\u0000" }, date: null })).toEqual({ ok: false, error: "empty" });
    expect(buildName({ ...base, order: [] })).toEqual({ ok: false, error: "empty" });
  });
  it("aviso de tamanho acima de 100", () => {
    const o = good({ ...base, values: { offer: "a".repeat(120) } });
    expect(o.warnings).toEqual(["too-long"]);
    const edge = good({ ...base, order: ["offer"], values: { offer: "a".repeat(100) } });
    expect(edge.warnings).toEqual([]);
  });
  it("conta pontos de código, não unidades UTF-16", () => {
    const o = good({ ...base, order: ["offer"], values: { offer: "𝒜𝒜" }, options: { ...DEFAULT_NAMING_OPTIONS, caseMode: "keep" } });
    expect(o.length).toBe(2);
    expect(o.name.length).toBe(4);
  });
  it("isValidOrder", () => {
    expect(isValidOrder(ORDER)).toBe(true);
    expect(isValidOrder([])).toBe(true);
    expect(isValidOrder(["date", "date"])).toBe(false);
  });
  it("propriedade: nunca lança, separador só entre blocos e divisão devolve as partes", () => {
    const blockText = fc.string({ unit: "binary", maxLength: 30 });
    fc.assert(
      fc.property(
        fc.record({ channel: blockText, objective: blockText, audience: blockText, offer: blockText }),
        fc.constantFrom(...SEPARATORS),
        fc.shuffledSubarray(ORDER),
        (values, separator, order) => {
          const r = buildName({ ...base, values, order, options: { ...DEFAULT_NAMING_OPTIONS, separator } });
          if (!r.ok) return;
          expect(splitName(r.value.name, separator)).toEqual(r.value.parts.map((p) => p.text));
          expect(r.value.parts.every((p) => p.text !== "")).toBe(true);
        },
      ),
    );
  });
});

describe("splitName", () => {
  it("divide e trata vazios", () => {
    expect(splitName("a_b_c", "_")).toEqual(["a", "b", "c"]);
    expect(splitName("a|b", "|")).toEqual(["a", "b"]);
    expect(splitName("", "_")).toEqual([]);
    expect(splitName("abc", "")).toEqual(["abc"]);
  });
});

describe("lote", () => {
  it("parseValueList apara, remove vazias e repetidas", () => {
    expect(parseValueList(" a \r\n\n b\na\n ")).toEqual(["a", "b"]);
    expect(parseValueList("")).toEqual([]);
  });
  it("produto cartesiano na ordem dos blocos", () => {
    const r = buildNameBatch(
      { ...base, order: ["channel", "offer", "date"], values: {} },
      { channel: ["Meta", "Google"], offer: ["Black Friday", "Natal", "Verão"] },
    );
    if (!r.ok) throw new Error(r.error);
    expect(r.value.items.map((i) => i.name)).toEqual([
      "meta_black-friday_20261101", "meta_natal_20261101", "meta_verao_20261101",
      "google_black-friday_20261101", "google_natal_20261101", "google_verao_20261101",
    ]);
  });
  it("lista vazia cai no valor do campo", () => {
    const r = buildNameBatch(base, { offer: ["A", "B"] });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.items).toHaveLength(2);
    expect(r.value.items[0]?.name).toBe("meta-ads_conversao_remarketing-30d_a_20261101");
  });
  it("descarta nomes repetidos após normalizar", () => {
    const r = buildNameBatch({ ...base, order: ["offer"] }, { offer: ["Black Friday", "black-friday", "BLACK FRIDAY"] });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.items).toHaveLength(1);
    expect(r.value.duplicates).toBe(2);
  });
  it("conta nomes longos", () => {
    const r = buildNameBatch({ ...base, order: ["offer"] }, { offer: ["a".repeat(120), "b"] });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.tooLong).toBe(1);
  });
  it("teto de 500 combinações, exato e acima", () => {
    const list = (n: number) => Array.from({ length: n }, (_, i) => `v${i}`);
    const ok500 = buildNameBatch({ ...base, order: ["channel", "offer"] }, { channel: list(25), offer: list(20) });
    expect(ok500.ok && ok500.value.items.length).toBe(MAX_NAMES);
    expect(buildNameBatch({ ...base, order: ["channel", "offer"] }, { channel: list(26), offer: list(20) })).toEqual({ ok: false, error: "too-many" });
    expect(buildNameBatch(base, { channel: list(1e5) })).toEqual({ ok: false, error: "too-many" });
  });
  it("erros", () => {
    expect(buildNameBatch({ ...base, order: ["a" as BlockKey] }, {})).toEqual({ ok: false, error: "invalid-order" });
    expect(buildNameBatch({ ...base, values: {}, date: null }, {})).toEqual({ ok: false, error: "empty" });
    expect(buildNameBatch(base, { offer: ["x".repeat(MAX_BLOCK_INPUT + 1)] })).toEqual({ ok: false, error: "value-too-long" });
  });
  it("lista só com vazios é ignorada e vale o campo", () => {
    const r = buildNameBatch({ ...base, order: ["offer"] }, { offer: ["", "  "] });
    expect(r.ok && r.value.items.map((i) => i.name)).toEqual(["black-friday"]);
    expect(buildNameBatch({ ...base, order: ["offer"], values: {} }, { offer: ["", "  "] })).toEqual({ ok: false, error: "empty" });
  });
  it("propriedade: nunca passa de MAX_NAMES e nomes são únicos", () => {
    fc.assert(
      fc.property(fc.array(fc.string({ maxLength: 8 }), { maxLength: 30 }), fc.array(fc.string({ maxLength: 8 }), { maxLength: 30 }), (a, b) => {
        const r = buildNameBatch({ ...base, order: ["channel", "offer"], values: {} }, { channel: a, offer: b });
        if (!r.ok) return;
        const names = r.value.items.map((i) => i.name);
        expect(names.length).toBeLessThanOrEqual(MAX_NAMES);
        expect(new Set(names).size).toBe(names.length);
      }),
    );
  });
});

describe("CSV", () => {
  const labels: CsvLabels = { channel: "canal", objective: "objetivo", audience: "publico", offer: "oferta", date: "data", name: "nome", length: "tamanho" };
  it("cabeçalho, colunas por bloco e neutralização de fórmula", () => {
    const r = buildNameBatch({ ...base, order: ["channel", "offer"], values: {}, options: { ...DEFAULT_NAMING_OPTIONS, caseMode: "keep" } }, { channel: ["Meta"], offer: ["Black"] });
    if (!r.ok) throw new Error(r.error);
    const csv = namingBatchToCsv(r.value.items, ["channel", "offer"], labels);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(parseCsv(csv)).toEqual([["canal", "oferta", "nome", "tamanho"], ["Meta", "Black", "Meta_Black", "10"]]);
  });
  it("célula começando com fórmula é protegida", () => {
    const csv = namingBatchToCsv([{ name: "-x", parts: [{ key: "offer", text: "-x" }], length: 2, warnings: [] }], ["offer", "date"], labels);
    expect(csv).toContain("'-x");
    expect(csv.split("\r\n")[1]).toBe("'-x,,'-x,2");
  });
});

describe("exemplos publicados na página", () => {
  const name = (i: NamingInput) => good(i);
  it("exemplo 1 nos três idiomas (56, 57 e 56 caracteres)", () => {
    const pt = name(base);
    expect(pt.name).toBe("meta-ads_conversao_remarketing-30d_black-friday_20261101");
    expect(pt.length).toBe(56);
    const en = name({ ...base, locale: "en", values: { ...base.values, objective: "Conversion" } });
    expect(en.name).toBe("meta-ads_conversion_remarketing-30d_black-friday_20261101");
    expect(en.length).toBe(57);
    const es = name({ ...base, locale: "es", values: { ...base.values, objective: "Conversión" } });
    expect(es.name).toBe("meta-ads_conversion_remarketing-30d_black-friday_20261101");
  });
  it("exemplo 2: maiúsculas, ponto, MMMAA e ordem trocada", () => {
    const i: NamingInput = { ...base, order: ["objective", "offer", "date"], dateFormat: "MMMYY", options: { separator: ".", caseMode: "upper", stripAccents: true } };
    expect(name(i).name).toBe("CONVERSAO.BLACK-FRIDAY.NOV26");
    expect(name({ ...i, order: ["date", "objective", "offer"] }).name).toBe("NOV26.CONVERSAO.BLACK-FRIDAY");
    expect(name({ ...i, locale: "en", values: { objective: "Conversion", offer: "Black Friday" } }).name).toBe("CONVERSION.BLACK-FRIDAY.NOV26");
  });
  it("exemplo 3: 2 x 3 = 6 nomes em cada idioma", () => {
    const run = (offers: string[]) => {
      const r = buildNameBatch({ ...base, order: ["channel", "offer", "date"], values: {} }, { channel: ["Meta", "Google"], offer: offers });
      if (!r.ok) throw new Error(r.error);
      return r.value.items.map((x) => x.name);
    };
    const pt = run(["Black Friday", "Natal", "Verão"]);
    expect(pt).toHaveLength(6);
    expect(pt[0]).toBe("meta_black-friday_20261101");
    expect(pt[5]).toBe("google_verao_20261101");
    expect(run(["Black Friday", "Christmas", "Summer"])[5]).toBe("google_summer_20261101");
    expect(run(["Black Friday", "Navidad", "Verano"])[5]).toBe("google_verano_20261101");
  });
  it("separador hífen liga palavras com sublinhado e o lote do teste e2e dá 52 caracteres", () => {
    const h = name({ ...base, options: { ...DEFAULT_NAMING_OPTIONS, separator: "-" } });
    expect(h.name).toBe("meta_ads-conversao-remarketing_30d-black_friday-20261101");
    const b = name({ ...base, values: { ...base.values, channel: "Meta" } });
    expect(b.name).toBe("meta_conversao_remarketing-30d_black-friday_20261101");
    expect(b.length).toBe(52);
    expect(name({ ...base, order: ["channel", "objective", "audience", "offer"], dateFormat: "MMMYY", values: { objective: "Traffic", channel: "Meta Ads" } }).name).toBe("meta-ads_traffic");
  });
});
