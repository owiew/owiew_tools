import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { buildWhatsappLink, parseWhatsappNumber } from "./index";

const base = { countryCode: "55", phone: "(11) 91234-5678", message: "" };

describe("parseWhatsappNumber", () => {
  it("junta DDI e número nacional ignorando a formatação", () => {
    const r = parseWhatsappNumber("+55", "(11) 91234-5678");
    expect(r).toEqual({ ok: true, value: { digits: "5511912345678", e164: "+5511912345678", warnings: [] } });
  });
  it("número já internacional ignora o campo de DDI", () => {
    for (const phone of ["+55 11 91234-5678", "0055 11 91234-5678"]) {
      const r = parseWhatsappNumber("1", phone);
      expect(r.ok && r.value.digits).toBe("5511912345678");
    }
  });
  it("remove zero à esquerda do número nacional com aviso", () => {
    const r = parseWhatsappNumber("55", "011912345678");
    expect(r.ok && r.value.digits).toBe("5511912345678");
    expect(r.ok && r.value.warnings).toContain("leading-zero-removed");
  });
  it("avisa quando o número brasileiro tem tamanho estranho", () => {
    const r = parseWhatsappNumber("55", "119123456789");
    expect(r.ok && r.value.warnings).toContain("br-length");
  });
  it.each([
    ["55", "", "empty"],
    ["55", "   ", "empty"],
    ["55", "000", "invalid-country-code"],
    ["55", "11abc45678", "invalid-chars"],
    ["55", "1191234\u00005678", "invalid-chars"],
    ["55", "٣٤٥٦٧٨٩٠١٢", "invalid-chars"],
    ["", "11912345678", "invalid-country-code"],
    ["0", "11912345678", "invalid-country-code"],
    ["5555", "11912345678", "invalid-country-code"],
    ["5a", "11912345678", "invalid-country-code"],
    ["55", "1234", "too-short"],
    ["55", "1234567890123456", "too-long"],
    ["55", "+0551234567890", "invalid-country-code"],
  ] as const)("recusa ddi=%j fone=%j", (cc, phone, error) => {
    expect(parseWhatsappNumber(cc, phone)).toEqual({ ok: false, error });
  });
  it("propriedade: sucesso sempre tem 8 a 15 dígitos sem zero inicial", () => {
    fc.assert(fc.property(fc.string({ maxLength: 8 }), fc.string({ maxLength: 24 }), (cc, phone) => {
      const r = parseWhatsappNumber(cc, phone);
      if (r.ok) {
        expect(r.value.digits).toMatch(/^[1-9]\d{7,14}$/);
        expect(r.value.e164).toBe(`+${r.value.digits}`);
      }
    }));
  });
});

describe("buildWhatsappLink", () => {
  it("sem mensagem devolve só o número", () => {
    const r = buildWhatsappLink(base);
    expect(r.ok && r.value.link).toBe("https://wa.me/5511912345678");
  });
  it("codifica espaços, acentos, símbolos e quebra de linha", () => {
    const r = buildWhatsappLink({ ...base, message: "Olá! Quero o plano A&B (50%)\r\nObrigado #1" });
    expect(r.ok && r.value.link).toBe("https://wa.me/5511912345678?text=Ol%C3%A1!%20Quero%20o%20plano%20A%26B%20(50%25)%0AObrigado%20%231");
  });
  it("cita o link de destino com UTM em linha própria", () => {
    const r = buildWhatsappLink({
      ...base, message: "Veja a oferta", destinationUrl: "loja.com/oferta?x=1",
      utm: { source: "Instagram", medium: "Bio", campaign: "Black Friday" },
    });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.destination).toBe("https://loja.com/oferta?x=1&utm_source=instagram&utm_medium=bio&utm_campaign=black-friday");
    expect(r.value.text).toBe(`Veja a oferta\n${r.value.destination}`);
    expect(r.value.warnings).toContain("scheme-assumed");
    expect(r.value.link).toContain("%0Ahttps%3A%2F%2Floja.com%2Foferta%3Fx%3D1%26utm_source%3Dinstagram");
  });
  it("destino sem UTM não acrescenta parâmetros", () => {
    const r = buildWhatsappLink({ ...base, destinationUrl: "https://a.com/x" });
    expect(r.ok && r.value.text).toBe("https://a.com/x");
  });
  it("UTM incompleta herda o erro do gerador de UTM", () => {
    const r = buildWhatsappLink({ ...base, destinationUrl: "https://a.com", utm: { source: "ig", medium: "", campaign: "" } });
    expect(r).toEqual({ ok: false, error: "missing-medium" });
  });
  it("UTM sem destino é erro", () => {
    expect(buildWhatsappLink({ ...base, utm: { source: "a", medium: "b", campaign: "c" } })).toEqual({ ok: false, error: "utm-without-url" });
  });
  it.each([
    ["javascript:alert(1)", "unsupported-scheme"],
    ["a b", "invalid-url"],
    [`https://a.com/${"x".repeat(9000)}`, "url-too-long"],
  ] as const)("destino hostil %#", (url, error) => {
    expect(buildWhatsappLink({ ...base, destinationUrl: url })).toEqual({ ok: false, error });
  });
  it("recusa controle, byte nulo, substituto solto e mensagem longa", () => {
    expect(buildWhatsappLink({ ...base, message: "a\u0000b" })).toEqual({ ok: false, error: "invalid-message" });
    expect(buildWhatsappLink({ ...base, message: "a\u0007b" })).toEqual({ ok: false, error: "invalid-message" });
    expect(buildWhatsappLink({ ...base, message: "x\ud800y" })).toEqual({ ok: false, error: "invalid-message" });
    expect(buildWhatsappLink({ ...base, message: "a".repeat(1001) })).toEqual({ ok: false, error: "message-too-long" });
    expect(buildWhatsappLink({ ...base, message: "a".repeat(1000) }).ok).toBe(true);
  });
  it("emoji e unicode fazem ida e volta sem perda", () => {
    const msg = "Olá 👋 こんにちは ñ";
    const r = buildWhatsappLink({ ...base, message: msg });
    if (!r.ok) throw new Error(r.error);
    expect(decodeURIComponent(r.value.link.split("?text=")[1] ?? "")).toBe(msg);
  });
  it("erro de número é repassado", () => {
    expect(buildWhatsappLink({ ...base, phone: "" })).toEqual({ ok: false, error: "empty" });
  });
  it("propriedade: o texto decodificado é sempre a mensagem normalizada e nunca lança", () => {
    fc.assert(fc.property(fc.string({ unit: "binary", maxLength: 200 }), (message) => {
      const r = buildWhatsappLink({ ...base, message });
      if (r.ok && r.value.text !== "") {
        const q = r.value.link.split("?text=")[1] ?? "";
        expect(q).not.toMatch(/[\s"<>]/);
        expect(decodeURIComponent(q)).toBe(r.value.text);
      }
    }));
  });
  it("avisa de link muito longo", () => {
    const r = buildWhatsappLink({ ...base, message: "ç".repeat(500) });
    expect(r.ok && r.value.warnings).toContain("url-long");
  });
});
