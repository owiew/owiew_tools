import fc from "fast-check";
import jsQR from "jsqr";
import { describe, expect, it } from "vitest";
import { type QrInput, type QrPlan, contrastRatio, parseHexColor, planQr, qrPathData, renderQrSvg } from "./index";

const base: QrInput = { url: "https://loja.com/oferta", ecc: "M", sizePx: 512, margin: 4, fg: "#000000", bg: "#ffffff" };

/** Rasteriza o plano em RGBA (decodificador só existe no teste, nunca em produção). */
function raster(plan: QrPlan, fg: [number, number, number], bg: [number, number, number]): { data: Uint8ClampedArray; side: number } {
  const n = plan.matrix.length + plan.margin * 2;
  const k = plan.pixelsPerModule;
  const side = n * k;
  const data = new Uint8ClampedArray(side * side * 4);
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const mx = Math.floor(x / k) - plan.margin;
      const my = Math.floor(y / k) - plan.margin;
      const dark = plan.matrix[my]?.[mx] === true;
      const c = dark ? fg : bg;
      data.set([c[0], c[1], c[2], 255], (y * side + x) * 4);
    }
  }
  return { data, side };
}

/** Decodifica o plano de volta para texto. */
function decode(plan: QrPlan): string | null {
  const { data, side } = raster(plan, [0, 0, 0], [255, 255, 255]);
  return jsQR(data, side, side)?.data ?? null;
}

const get = (r: ReturnType<typeof planQr>): QrPlan => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("planQr", () => {
  it("decodifica de volta para o link, em todos os níveis de correção", () => {
    for (const ecc of ["L", "M", "Q", "H"] as const) {
      const plan = get(planQr({ ...base, ecc }));
      expect(plan.payload).toBe("https://loja.com/oferta");
      expect(decode(plan)).toBe("https://loja.com/oferta");
    }
  });
  it("decodifica o link com UTM e caracteres especiais", () => {
    const plan = get(planQr({ ...base, url: "loja.com/p?a=1&b=ç#x", utm: { source: "QR", medium: "Flyer", campaign: "Verão 2026" } }));
    expect(plan.payload).toBe("https://loja.com/p?a=1&b=%C3%A7&utm_source=qr&utm_medium=flyer&utm_campaign=verao-2026#x");
    expect(plan.warnings).toContain("scheme-assumed");
    expect(decode(plan)).toBe(plan.payload);
  });
  it("tamanho em pixels é múltiplo inteiro do módulo e avisa do arredondamento", () => {
    const plan = get(planQr({ ...base, sizePx: 500 }));
    expect(plan.imageSizePx % (plan.matrix.length + 8)).toBe(0);
    expect(plan.imageSizePx).toBeLessThanOrEqual(500);
    expect(plan.warnings).toContain("size-rounded");
  });
  it("SVG tem o tamanho, as cores e o mesmo caminho da matriz, sem script", () => {
    const plan = get(planQr({ ...base, fg: "#102A43", bg: "#FFF" }));
    expect(plan.svg).toContain(`width="${plan.imageSizePx}"`);
    expect(plan.svg).toContain('fill="#102a43"');
    expect(plan.svg).toContain('fill="#fff"');
    expect(plan.svg).toContain(`d="${plan.path}"`);
    expect(plan.svg).not.toMatch(/<script|on\w+=|href=/i);
  });
  it("avisa margem pequena e cores invertidas", () => {
    expect(get(planQr({ ...base, margin: 2 })).warnings).toContain("margin-small");
    expect(get(planQr({ ...base, fg: "#ffffff", bg: "#000000" })).warnings).toContain("inverted");
    expect(get(planQr({ ...base, sizePx: 495 })).warnings).toEqual([]);
  });
  it.each([
    [{ url: "" }, "empty-url"],
    [{ url: "javascript:alert(1)" }, "unsupported-scheme"],
    [{ url: "a b" }, "invalid-url"],
    [{ url: `https://a.com/${"x".repeat(3000)}` }, "too-long"],
    [{ ecc: "X" as never }, "invalid-ecc"],
    [{ sizePx: 64 }, "invalid-size"],
    [{ sizePx: 4096 }, "invalid-size"],
    [{ sizePx: 200.5 }, "invalid-size"],
    [{ margin: -1 }, "invalid-margin"],
    [{ margin: 17 }, "invalid-margin"],
    [{ fg: "red" }, "invalid-color"],
    [{ bg: '#fff" onload="x' }, "invalid-color"],
    [{ fg: "#777777", bg: "#888888" }, "low-contrast"],
    [{ utm: { source: "a", medium: "", campaign: "" } }, "missing-medium"],
    [{ url: `https://a.com/${"y".repeat(1200)}`, sizePx: 128, margin: 16, ecc: "H" }, "size-too-small"],
  ] as const)("recusa entrada hostil %#", (patch, error) => {
    expect(planQr({ ...base, ...(patch as Partial<QrInput>) })).toEqual({ ok: false, error });
  });
  it("propriedade: qualquer URL válida decodifica para si mesma", () => {
    fc.assert(
      fc.property(fc.webUrl({ withQueryParameters: true, withFragments: true }), fc.constantFrom("L", "M", "Q", "H" as const), (url, ecc) => {
        const r = planQr({ ...base, url, ecc });
        if (r.ok) expect(decode(r.value)).toBe(r.value.payload);
      }),
      { numRuns: 15 },
    );
  }, 60_000);
});

describe("contraste e cor", () => {
  it("preto sobre branco é 21 e a razão é simétrica", () => {
    const k = parseHexColor("#000");
    const w = parseHexColor("#FFFFFF");
    if (!k.ok || !w.ok) throw new Error("cor");
    expect(contrastRatio(k.value, w.value)).toBeCloseTo(21, 5);
    expect(contrastRatio(w.value, k.value)).toBeCloseTo(21, 5);
    expect(contrastRatio(k.value, k.value)).toBeCloseTo(1, 5);
  });
  it.each(["", "#12", "#12345", "#1234567", "#ggg", "blue", "rgb(0,0,0)", "#000\u0000"])("recusa cor %j", (c) => {
    expect(parseHexColor(c)).toEqual({ ok: false, error: "invalid-color" });
  });
  it("propriedade: razão sempre entre 1 e 21", () => {
    fc.assert(fc.property(fc.tuple(fc.nat(255), fc.nat(255), fc.nat(255)), fc.tuple(fc.nat(255), fc.nat(255), fc.nat(255)), (a, b) => {
      const r = contrastRatio(a, b);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(21.0000001);
    }));
  });
});

describe("render", () => {
  it("funde sequências de módulos e aplica a margem", () => {
    expect(qrPathData([[true, true, false, true]], 2)).toBe("M2 2h2v1h-2zM5 2h1v1h-1z");
    expect(qrPathData([[false]], 0)).toBe("");
  });
  it("viewBox soma a margem dos dois lados", () => {
    expect(renderQrSvg([[true]], { margin: 4, sizePx: 90, fg: "#000", bg: "#fff" })).toContain('viewBox="0 0 9 9"');
  });
});
