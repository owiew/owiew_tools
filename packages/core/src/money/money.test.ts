import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { mulDivRound } from "./bigint-math";
import { formatBp, formatCents, formatNumber, parseMoneyToCents, parsePercentToBp } from "./format";
import { defaultCurrency, intlLocale } from "./locale";
import { parseScaled } from "./parse-scaled";

describe("parseMoneyToCents", () => {
  it.each([
    ["R$ 1.234,56", "pt-br", 123456],
    ["1.234,56", "pt-br", 123456],
    ["1234,5", "pt-br", 123450],
    ["1.234", "pt-br", 123400],
    ["$1,234.56", "en", 123456],
    ["1,234", "en", 123400],
    ["0.99", "en", 99],
    ["1.234,56 €", "es", 123456],
    ["12", "en", 1200],
    ["1.234.567,89", "pt-br", 123456789],
    ["R$1,50", "pt-br", 150],
    ["US$ 2.50", "en", 250],
    ["1.234,56 EUR", "es", 123456],
    ["1.234,56€", "es", 123456],
    ["1,234,567.89", "en", 123456789],
  ] as const)("%s (%s) -> %i", (text, locale, cents) => {
    expect(parseMoneyToCents(text, locale)).toEqual({ ok: true, value: cents });
  });

  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["abc", "invalid"],
    ["1a2", "invalid"],
    ["12abc", "invalid"],
    ["R$R$ 5", "invalid"],
    ["5 reais", "invalid"],
    ["1.2.3", "invalid"],
    ["1,23,4", "invalid"],
    ["-5", "negative"],
    ["(5,00)", "negative"],
    ["1,234", "too-many-decimals"],
    ["99999999999999999999", "too-large"],
    ["1\u00002", "invalid"],
    ["..", "invalid"],
  ] as const)("recusa %j com %s", (text, error) => {
    const locale = text === "1,234" ? "pt-br" : "pt-br";
    const r = parseMoneyToCents(text, locale);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(error);
  });

  it("aceita unicode de espaço fino e minus recusado", () => {
    expect(parseMoneyToCents("1\u202f234,50", "pt-br")).toEqual({ ok: true, value: 123450 });
    expect(parseMoneyToCents("\u22125", "pt-br")).toEqual({ ok: false, error: "negative" });
  });

  it("round-trip: formatar centavos e ler de volta não perde um centavo", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 ** 11 }), fc.constantFrom("pt-br", "en", "es"), (cents, loc) => {
        const text = formatCents(cents, "USD", loc);
        const back = parseMoneyToCents(text, loc);
        expect(back).toEqual({ ok: true, value: cents });
      }),
    );
  });

  it("nunca lança com texto arbitrário", () => {
    fc.assert(fc.property(fc.string({ unit: "binary" }), (s) => {
      expect(() => parseMoneyToCents(s, "pt-br")).not.toThrow();
    }));
  });
});

describe("parsePercentToBp / parseScaled", () => {
  it("40,5% -> 4050 pontos-base", () => {
    expect(parsePercentToBp("40,5%", "pt-br")).toEqual({ ok: true, value: 4050 });
    expect(parsePercentToBp("40.5 %", "en")).toEqual({ ok: true, value: 4050 });
  });
  it("scale 0 recusa decimais", () => {
    expect(parseScaled("1,5", "pt-br", 0)).toEqual({ ok: false, error: "too-many-decimals" });
  });
});

describe("mulDivRound", () => {
  it("arredonda meio para cima sem float", () => {
    expect(mulDivRound(1, 1, 2)).toBe(1);
    expect(mulDivRound(1, 1, 3)).toBe(0);
    expect(mulDivRound(5, 1, 10)).toBe(1);
    expect(mulDivRound(10_000_000_000, 4050, 10_000)).toBe(4_050_000_000);
  });
  it("0.1 + 0.2 de dinheiro fecha exato (30 centavos)", () => {
    expect(mulDivRound(10, 100, 100) + mulDivRound(20, 100, 100)).toBe(30);
  });
  it.each([[-1, 1, 1], [1, -1, 1], [1, 1, 0], [1.5, 1, 1], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1]])(
    "contrato violado (%s,%s,%s) lança RangeError",
    (a, b, d) => {
      expect(() => mulDivRound(a, b, d)).toThrow(RangeError);
    },
  );
  it("propriedade: resultado difere do exato por no máximo meio", () => {
    fc.assert(
      fc.property(fc.nat(10 ** 9), fc.nat(10_000), fc.integer({ min: 1, max: 10_000 }), (a, b, d) => {
        const r = mulDivRound(a, b, d);
        expect(Math.abs(r * d - a * b)).toBeLessThanOrEqual(d / 2);
      }),
    );
  });
});

describe("formatação", () => {
  it("moeda por idioma", () => {
    expect(formatCents(123456, "BRL", "pt-br").replace(/\s/g, " ")).toBe("R$ 1.234,56");
    expect(formatCents(123456, "USD", "en")).toBe("$1,234.56");
  });
  it("moeda inválida não quebra", () => {
    expect(formatCents(1050, "xx", "en")).toBe("10.50 xx");
  });
  it("número e porcentagem", () => {
    expect(formatNumber(3.2512, 2, "pt-br")).toBe("3,25");
    expect(formatBp(4050, "en")).toBe("40.50%");
  });
  it("locale e moeda padrão", () => {
    expect(intlLocale("pt-br")).toBe("pt-BR");
    expect(intlLocale("es")).toBe("es");
    expect(intlLocale("en")).toBe("en-US");
    expect([defaultCurrency("pt-br"), defaultCurrency("en"), defaultCurrency("es")]).toEqual(["BRL", "USD", "EUR"]);
  });
});
