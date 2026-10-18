import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { identifyClickId } from "./click-ids";
import { decodeComponent, encodeComponent } from "./codec";
import { inspectUrl } from "./inspect-url";
import { parseHttpUrl } from "./parse-http-url";

const inspect = (u: string) => {
  const r = inspectUrl(u);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};
const codes = (u: string) => inspect(u).issues.map((i) => `${i.code}${i.param ? `:${i.param}` : ""}`);

describe("parseHttpUrl", () => {
  it("presume https, aceita host:porta e localhost", () => {
    expect(parseHttpUrl("example.com/a")).toMatchObject({ ok: true, value: { assumedScheme: true } });
    expect(parseHttpUrl("example.com:8080/a")).toMatchObject({ ok: true, value: { assumedScheme: true } });
    expect(parseHttpUrl("//example.com")).toMatchObject({ ok: true });
    expect(parseHttpUrl("http://localhost:3000")).toMatchObject({ ok: true, value: { assumedScheme: false } });
  });
  it.each([["", "empty"], ["data:text/html,x", "unsupported-scheme"], ["file:///etc/passwd", "unsupported-scheme"], ["https://", "invalid"], ["foo", "invalid"]] as const)(
    "recusa %j", (t, e) => expect(parseHttpUrl(t)).toEqual({ ok: false, error: e }),
  );
});

describe("inspectUrl", () => {
  it("quebra os parâmetros e acha identificadores de clique", () => {
    const r = inspect("https://a.com/p?utm_source=g&gclid=abc&fbclid=1&x=%C3%A9&y=a+b#h");
    expect(r.params.map((p) => [p.key, p.value, p.kind])).toEqual([
      ["utm_source", "g", "utm"], ["gclid", "abc", "click-id"], ["fbclid", "1", "click-id"], ["x", "é", "other"], ["y", "a b", "other"],
    ]);
    expect(r.params[1]?.clickId?.platform).toBe("Google Ads");
    expect(r).toMatchObject({ host: "a.com", path: "/p", hash: "#h", protocol: "https", port: "" });
  });
  it("aponta duplicada, conflitante, maiúscula, espaço e obrigatórias", () => {
    expect(codes("https://a.com/?utm_source=a&utm_source=a&utm_medium=x&utm_medium=y&utm_campaign=Verao%20Quente")).toEqual(
      expect.arrayContaining(["utm-duplicate:utm_source", "utm-conflict:utm_medium", "utm-uppercase:utm_campaign", "utm-whitespace:utm_campaign"]),
    );
    expect(codes("https://a.com/?utm_source=a")).toEqual(["utm-missing-required:utm_medium", "utm-missing-required:utm_campaign"]);
  });
  it("chave em caixa errada, vazia, desconhecida, no fragmento, dupla codificação", () => {
    expect(codes("https://a.com/?UTM_Source=a&utm_medium=&utm_foo=1&utm_campaign=a%2520b#x?utm_term=1")).toEqual(
      expect.arrayContaining(["utm-key-case:utm_source", "utm-empty:utm_medium", "utm-unknown-key:utm_foo", "double-encoded:utm_campaign", "utm-in-fragment"]),
    );
  });
  it("codificação malformada nunca quebra", () => {
    const r = inspect("https://a.com/?a=%E0%A4%A&b=%");
    expect(r.params.map((p) => p.value)).toEqual(["%E0%A4%A", "%"]);
    expect(r.issues.filter((i) => i.code === "malformed-encoding")).toHaveLength(2);
  });
  it("credenciais, esquema presumido, vários click ids, parâmetro repetido comum", () => {
    expect(codes("user:pw@a.com/?gclid=1&msclkid=2&k=1&k=2")).toEqual(
      expect.arrayContaining(["scheme-assumed", "multiple-click-ids", "duplicate-param:k"]),
    );
    expect(codes("https://u:p@a.com/")).toContain("credentials-in-url");
  });
  it("URL inválida devolve erro, nunca exceção", () => {
    expect(inspectUrl("")).toEqual({ ok: false, error: "empty" });
    expect(inspectUrl("javascript:alert(1)")).toEqual({ ok: false, error: "unsupported-scheme" });
    fc.assert(fc.property(fc.string({ unit: "binary" }), (s) => { expect(() => inspectUrl(s)).not.toThrow(); }));
  });
  it("parâmetro sem valor e sem query", () => {
    expect(inspect("https://a.com/?flag&&x=").params.map((p) => [p.key, p.value])).toEqual([["flag", ""], ["x", ""]]);
    expect(inspect("https://a.com:8443/").port).toBe("8443");
  });
});

describe("click ids", () => {
  it("identifica sem diferenciar caixa e não herda propriedades do Object", () => {
    expect(identifyClickId("GCLID")?.platform).toBe("Google Ads");
    expect(identifyClickId("ScCid")?.platform).toBe("Snapchat");
    expect(identifyClickId("constructor")).toBeUndefined();
    expect(identifyClickId("__proto__")).toBeUndefined();
  });
});

describe("codec", () => {
  it("codifica e decodifica unicode", () => {
    expect(encodeComponent("verão & café")).toBe("ver%C3%A3o%20%26%20caf%C3%A9");
    expect(decodeComponent("ver%C3%A3o")).toEqual({ ok: true, value: "verão" });
    expect(decodeComponent("a+b", true)).toEqual({ ok: true, value: "a b" });
    expect(decodeComponent("a+b")).toEqual({ ok: true, value: "a+b" });
    expect(decodeComponent("%E0%A4%A")).toEqual({ ok: false, error: "malformed" });
  });
  it("propriedade: decodificar(codificar(x)) == x (surrogate solto vira U+FFFD)", () => {
    fc.assert(fc.property(fc.string({ unit: "binary" }), (s) => {
      expect(decodeComponent(encodeComponent(s))).toEqual({ ok: true, value: s.toWellFormed() });
    }));
  });
});
