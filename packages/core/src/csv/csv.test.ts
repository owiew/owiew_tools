import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { detectDelimiter, parseCsv } from "./parse";
import { escapeCsvCell, neutralizeFormula, serializeCsv } from "./serialize";

describe("CSV injection", () => {
  it.each(["=1+1", "+cmd|' /C calc'!A0", "-2+3", "@SUM(A1)", "\t=1", "\r=1", "  =HYPERLINK(\"x\")"])(
    "neutraliza %j",
    (v) => {
      expect(neutralizeFormula(v)).toBe(`'${v}`);
      expect(escapeCsvCell(v).replace(/^"/, "")).toMatch(/^'/);
    },
  );
  it("não mexe em texto comum nem em URL", () => {
    expect(neutralizeFormula("https://x.com/?a=1")).toBe("https://x.com/?a=1");
    expect(neutralizeFormula("a=b")).toBe("a=b");
  });
  it("propriedade: nenhuma célula serializada começa com caractere de fórmula", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary" }), (s) => {
        const cell = escapeCsvCell(s).replace(/^"/, "");
        expect(/^[=+\-@\t\r]/.test(cell)).toBe(false);
      }),
    );
  });
  it("remove null byte", () => {
    expect(escapeCsvCell("a\0b")).toBe("ab");
  });
});

describe("serializeCsv / parseCsv", () => {
  it("escapa vírgula, aspas e quebra de linha", () => {
    expect(serializeCsv([["a,b", 'c"d', "e\nf"]])).toBe('"a,b","c""d","e\nf"');
  });
  it("BOM e delimitador", () => {
    expect(serializeCsv([["a", "b"]], { bom: true, delimiter: ";" })).toBe("\uFEFFa;b");
  });
  it("detecta delimitador", () => {
    expect(detectDelimiter("a;b;c")).toBe(";");
    expect(detectDelimiter("a\tb")).toBe("\t");
    expect(detectDelimiter("abc")).toBe(",");
    expect(detectDelimiter("")).toBe(",");
  });
  it("lê aspas, CRLF, linhas vazias e aspa aberta sem lançar", () => {
    expect(parseCsv('a,"b ""q"" c"\r\n\r\nx,y\n')).toEqual([["a", 'b "q" c'], ["x", "y"]]);
    expect(parseCsv('a,"aberta')).toEqual([["a", "aberta"]]);
    expect(parseCsv("\uFEFFa;b\nc;d")).toEqual([["a", "b"], ["c", "d"]]);
    expect(parseCsv("")).toEqual([]);
  });
  it("propriedade: serializar e ler devolve as mesmas células (sem prefixo de fórmula)", () => {
    const safe = fc.string({ unit: "binary" }).filter((s) => !/[\0\r]/.test(s) && neutralizeFormula(s) === s && s.trim() !== "");
    fc.assert(
      fc.property(fc.array(fc.array(safe, { minLength: 1, maxLength: 4 }), { minLength: 1, maxLength: 5 }), (rows) => {
        const width = rows[0]?.length ?? 1;
        const rect = rows.map((r) => r.slice(0, width).concat(Array<string>(Math.max(0, width - r.length)).fill("x")));
        expect(parseCsv(serializeCsv(rect), ",")).toEqual(rect);
      }),
    );
  });
});
