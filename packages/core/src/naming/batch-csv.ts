import { serializeCsv } from "../csv/serialize";
import { type BlockKey, type NameOutput } from "./types";

/** Rótulos das colunas do CSV (traduzidos pela UI). */
export type CsvLabels = Record<BlockKey | "name" | "length", string>;

/**
 * Serializa o lote em CSV (uma coluna por bloco da ordem, nome e tamanho).
 *
 * O quê: usa serializeCsv do core, que neutraliza CSV injection e põe BOM.
 * Onde: botão "baixar CSV" do lote. Entradas: nomes, ordem e rótulos.
 * Saída: texto CSV. Blocos que não existem num nome ficam em branco.
 */
export function namingBatchToCsv(items: readonly NameOutput[], order: readonly BlockKey[], labels: CsvLabels): string {
  const rows: string[][] = [[...order.map((k) => labels[k]), labels.name, labels.length]];
  for (const item of items) {
    rows.push([...order.map((k) => item.parts.find((p) => p.key === k)?.text ?? ""), item.name, String(item.length)]);
  }
  return serializeCsv(rows, { bom: true });
}
