/** Opções de normalização de um termo. */
export interface NormalizeOptions {
  readonly lowercase: boolean;
  readonly stripAccents: boolean;
  /** Troca por espaço os símbolos que o Google Ads rejeita em palavra-chave e a sintaxe de correspondência ("", []). */
  readonly stripSymbols: boolean;
}

/**
 * Símbolos que o Google Ads não aceita em palavra-chave (lista dos erros da
 * Google Ads API) e a sintaxe de correspondência, que o gerador acrescenta sozinho.
 */
const FORBIDDEN = /[!@%^()={};~`<>?\\|,"[\]]/gu;

/**
 * Normaliza um termo de palavra-chave.
 *
 * O quê: tira byte nulo e caracteres de controle, junta espaços repetidos,
 * opcionalmente minúscula (por locale neutro), remove acentos (NFD sem marcas) e
 * símbolos proibidos. Nunca lança e nunca deixa espaço nas pontas.
 * Onde: combinador (cada item das listas) e limpador (cada linha).
 * Entradas: texto cru e opções. Saída: termo normalizado (pode ser vazio).
 */
export function normalizeTerm(raw: string, opts: NormalizeOptions): string {
  let t = Array.from(raw, (ch) => ((ch.codePointAt(0) ?? 32) <= 0x1f || ch === "\x7f" ? " " : ch)).join("");
  if (opts.stripSymbols) t = t.replace(FORBIDDEN, " ");
  if (opts.stripAccents) t = t.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  if (opts.lowercase) t = t.toLowerCase();
  return t.replace(/\s+/gu, " ").trim();
}

/** Limites de palavra-chave da Google Ads API (KeywordInfo): 80 caracteres e 10 palavras. */
export const KEYWORD_LIMITS = { chars: 80, words: 10 } as const;

/**
 * Conta as palavras de um termo (separadas por espaço).
 *
 * Onde: validação de limite de 10 palavras. Entrada: termo. Saída: contagem. Sem efeitos.
 */
export function wordCount(term: string): number {
  const t = term.trim();
  return t === "" ? 0 : t.split(/\s+/u).length;
}

/**
 * Diz se um termo estoura o limite de tamanho do Google Ads.
 *
 * Onde: combinador (aviso) e limpador (remoção). Entrada: termo. Saída: "chars",
 * "words" ou null se cabe. Conta por ponto de código. Sem efeitos.
 */
export function limitViolation(term: string): "chars" | "words" | null {
  if (Array.from(term).length > KEYWORD_LIMITS.chars) return "chars";
  return wordCount(term) > KEYWORD_LIMITS.words ? "words" : null;
}
