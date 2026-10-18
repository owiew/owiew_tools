/** Faixas de caracteres de largura dupla (CJK, kana, hangul, formas de largura total). */
const DOUBLE_WIDTH: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f], [0x2e80, 0x303e], [0x3041, 0x33ff], [0x3400, 0x4dbf], [0x4e00, 0x9fff],
  [0xa960, 0xa97f], [0xac00, 0xd7a3], [0xf900, 0xfaff], [0xfe30, 0xfe6f], [0xff00, 0xff60],
  [0xffe0, 0xffe6], [0x20000, 0x3fffd],
];

/**
 * Peso de um ponto de código na contagem do Google Ads: 2 se largura dupla, senão 1.
 *
 * Onde: etapa interna de `countAdChars`. Entrada: ponto de código Unicode.
 * Saída: 1 ou 2. Sem efeitos.
 */
function weight(codePoint: number): 1 | 2 {
  return DOUBLE_WIDTH.some(([lo, hi]) => codePoint >= lo && codePoint <= hi) ? 2 : 1;
}

/**
 * Conta caracteres como o Google Ads: cada caractere vale 1 e cada caractere de
 * idioma de largura dupla (chinês, japonês, coreano) vale 2.
 *
 * O quê: conta por ponto de código (um emoji ou letra acentuada composta de um
 * só ponto vale 1, e não os 2 "code units" do JavaScript); espaços internos
 * contam; espaços nas pontas são ignorados (o Google os remove ao salvar).
 * Onde: verificação do anúncio Google e, por reaproveitamento, do Meta.
 * Entrada: texto digitado. Saída: contagem inteira. Sem efeitos.
 * Regra oficial: Ajuda do Google Ads, "Sobre anúncios responsivos de pesquisa".
 */
export function countAdChars(text: string): number {
  let total = 0;
  for (const ch of text.trim().replace(/\0/g, "")) total += weight(ch.codePointAt(0) ?? 0);
  return total;
}

/**
 * Corta um texto em no máximo `limit` unidades de contagem, sem partir um ponto de código.
 *
 * Onde: simulação de truncamento da prévia do Meta. Entradas: texto e limite
 * (inteiro >= 0). Saída: o prefixo que cabe, já sem espaço no fim. Sem efeitos.
 */
export function cutToLimit(text: string, limit: number): string {
  let used = 0;
  let out = "";
  for (const ch of text.replace(/\0/g, "")) {
    const w = weight(ch.codePointAt(0) ?? 0);
    if (used + w > limit) break;
    used += w;
    out += ch;
  }
  return out.trimEnd();
}
