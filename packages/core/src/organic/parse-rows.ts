import { parseCsv } from "../csv/parse";
import { type AppLocale } from "../money/locale";
import { parseScaled } from "../money/parse-scaled";
import { type KeywordInput, MAX_KEYWORDS, MAX_POSITION } from "./estimate";

/** Erro de uma linha digitada. */
export interface RowError {
  /** Número da linha no texto (a partir de 1). */
  readonly line: number;
  readonly error: "columns" | "volume" | "position" | "keyword";
}

/** Linhas lidas e erros por linha. */
export interface ParsedRows {
  readonly rows: readonly KeywordInput[];
  readonly errors: readonly RowError[];
  /** true se havia mais linhas que o limite (as extras foram ignoradas). */
  readonly truncated: boolean;
}

/**
 * Diz se o texto tem caractere de controle.
 *
 * Onde: validação da palavra-chave em `parseKeywordRows`. Entrada: texto. Saída: boolean.
 */
function hasControlChar(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 32 || c === 127) return true;
  }
  return false;
}

/**
 * Lê linhas "palavra-chave; volume; posição" (separador `;`, `,` ou tab).
 *
 * Onde: campo de texto do estimador. Entradas: texto cru e idioma (milhar x
 * decimal do volume). Saída: linhas válidas e erro por linha (nunca lança). A
 * primeira linha é ignorada se for cabeçalho (volume não numérico). Linhas
 * vazias são puladas; o limite é `MAX_KEYWORDS`.
 */
export function parseKeywordRows(text: string, locale: AppLocale): ParsedRows {
  const rows: KeywordInput[] = [];
  const errors: RowError[] = [];
  const table = parseCsv(text);
  let truncated = false;
  table.forEach((cells, i) => {
    const line = i + 1;
    if (cells.every((c) => c.trim() === "")) return;
    if (cells.length !== 3) { errors.push({ line, error: "columns" }); return; }
    const [keyword = "", volumeText = "", positionText = ""] = cells.map((c) => c.trim());
    const volume = parseScaled(volumeText, locale, 0);
    if (i === 0 && !volume.ok && /\D/.test(positionText) && !/^\d+$/.test(positionText)) return;
    if (keyword === "" || hasControlChar(keyword)) { errors.push({ line, error: "keyword" }); return; }
    if (!volume.ok) { errors.push({ line, error: "volume" }); return; }
    if (!/^\d{1,3}$/.test(positionText) || Number(positionText) < 1 || Number(positionText) > MAX_POSITION) {
      errors.push({ line, error: "position" });
      return;
    }
    if (rows.length >= MAX_KEYWORDS) { truncated = true; return; }
    rows.push({ keyword, volume: volume.value, position: Number(positionText) });
  });
  return { rows, errors, truncated };
}
