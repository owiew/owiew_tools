import { parseCsv } from "../csv/parse";
import { serializeCsv } from "../csv/serialize";
import { type Result, fail, ok } from "../result";
import { type UtmError, type UtmFields, type UtmOutput, buildUtmUrl } from "./build-utm-url";
import { type NamingRules } from "./rules";

/** Teto de linhas por lote (protege a aba do navegador). */
export const MAX_BATCH_ROWS = 2000;

/** Linha do lote: URL e campos opcionais que sobrepõem os padrões do formulário. */
export interface BatchRow {
  /** Número da linha na entrada colada (1 = primeira linha de dados). */
  readonly line: number;
  readonly url: string;
  readonly fields: Partial<UtmFields>;
}

/** Resultado por linha. */
export interface BatchResult {
  readonly row: BatchRow;
  readonly result: Result<UtmOutput, UtmError>;
}

/** Modo de entrada: uma URL por linha, ou CSV com colunas. */
export type BatchMode = "urls" | "csv";

/** Erros de leitura do lote inteiro. */
export type BatchError = "empty" | "too-many-rows";

/** Colunas aceitas no CSV, em ordem posicional quando não há cabeçalho. */
const COLUMNS = ["url", "source", "medium", "campaign", "term", "content", "id"] as const;

/**
 * Lê o texto colado e devolve as linhas do lote.
 *
 * O quê: modo "urls" trata cada linha como uma URL (vírgulas dentro da URL são
 * preservadas); modo "csv" usa cabeçalho (url,source,...) ou posição.
 * Onde: caixa de lote do gerador de UTM. Entradas: texto e modo.
 * Saída: Result com linhas, ou erro (vazio / acima do teto).
 */
export function parseBatch(text: string, mode: BatchMode): Result<BatchRow[], BatchError> {
  const rows: BatchRow[] = [];
  if (mode === "urls") {
    text.split(/\r?\n/).forEach((l) => {
      if (l.trim() !== "") rows.push({ line: rows.length + 1, url: l.trim(), fields: {} });
    });
  } else {
    const table = parseCsv(text);
    const header = (table[0] ?? []).map((c) => c.trim().toLowerCase().replace(/^utm_/, ""));
    const hasHeader = header.includes("url");
    const order: readonly string[] = hasHeader ? header : COLUMNS;
    (hasHeader ? table.slice(1) : table).forEach((cells) => {
      const fields: Record<string, string> = {};
      let url = "";
      order.forEach((name, i) => {
        const cell = (cells[i] ?? "").trim();
        if (name === "url") url = cell;
        else if (cell !== "" && (COLUMNS as readonly string[]).includes(name)) fields[name] = cell;
      });
      rows.push({ line: rows.length + 1, url, fields });
    });
  }
  if (rows.length === 0) return fail("empty");
  if (rows.length > MAX_BATCH_ROWS) return fail("too-many-rows");
  return ok(rows);
}

/**
 * Gera as URLs de todas as linhas usando os campos do formulário como padrão.
 *
 * Onde: botão "gerar lote". Entradas: linhas, campos padrão, regras.
 * Saída: um BatchResult por linha, na mesma ordem. Uma linha ruim não derruba
 * as outras. Sem efeitos.
 */
export function buildBatch(
  rows: readonly BatchRow[],
  defaults: UtmFields,
  rules: NamingRules,
): BatchResult[] {
  return rows.map((row) => ({
    row,
    result: buildUtmUrl(row.url, { ...defaults, ...row.fields }, rules),
  }));
}

/**
 * Serializa o lote em CSV seguro (CSV injection neutralizado).
 *
 * Onde: botão "exportar CSV". Entrada: resultados do lote. Saída: texto CSV
 * com BOM, colunas line, original, url, status, warnings.
 */
export function batchToCsv(results: readonly BatchResult[]): string {
  const rows: string[][] = [["line", "original", "url", "status", "warnings"]];
  for (const { row, result } of results) {
    if (result.ok) {
      rows.push([String(row.line), row.url, result.value.url, "ok", result.value.warnings.map((w) => w.code).join(" ")]);
    } else rows.push([String(row.line), row.url, "", result.error, ""]);
  }
  return serializeCsv(rows, { bom: true });
}
