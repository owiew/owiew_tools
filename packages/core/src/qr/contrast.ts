import { type Result, fail, ok } from "../result";

/** Cor RGB com canais de 0 a 255. */
export type Rgb = readonly [number, number, number];

/**
 * Lê uma cor hexadecimal `#rgb` ou `#rrggbb` (sem nomes de cor, sem alfa).
 *
 * Onde: campos de cor do gerador de QR Code e `planQr`. Também é a barreira que
 * impede texto livre de entrar no atributo `fill` do SVG gerado.
 * Entrada: texto. Saída: Result com [r,g,b] ou "invalid-color". Sem efeitos.
 */
export function parseHexColor(text: string): Result<Rgb, "invalid-color"> {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!m || m[1] === undefined) return fail("invalid-color");
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return ok([0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb);
}

/**
 * Luminância relativa de uma cor (WCAG 2.x).
 *
 * Onde: etapa de `contrastRatio`. Entrada: cor RGB. Saída: número de 0 a 1.
 */
export function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Razão de contraste entre duas cores (1 a 21), simétrica.
 *
 * Onde: validação do QR Code (módulos escuros sobre fundo claro). Entradas:
 * duas cores RGB. Saída: razão WCAG. Sem efeitos.
 */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
