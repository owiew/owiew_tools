import { serializeCsv } from "../csv/serialize";
import { type KeywordGroup } from "./group";
import { type MatchType, formatKeyword } from "./match-type";

/** Nome do tipo como o Editor do Google Ads espera na coluna de tipo. */
const TYPE_LABEL: Record<MatchType, string> = { broad: "Broad", phrase: "Phrase", exact: "Exact" };

/**
 * Exporta palavras-chave (ou negativas) em CSV: keyword, match type, formatted, kind.
 *
 * O quê: uma linha por item; células protegidas contra CSV injection pelo
 * `serializeCsv` do core (inclusive o "+" que prefixa palavra-chave legada).
 * Onde: botão "Exportar CSV" do combinador e do gerador de negativas.
 * Entradas: itens e o tipo da lista ("keyword" ou "negative"). Saída: CSV com BOM. Sem efeitos.
 */
export function keywordRowsToCsv(rows: readonly { keyword: string; type: MatchType }[], kind: "keyword" | "negative"): string {
  const body = rows.map((r) => [r.keyword, TYPE_LABEL[r.type], formatKeyword(r.keyword, r.type), kind]);
  return serializeCsv([["keyword", "match type", "formatted", "kind"], ...body], { bom: true });
}

/**
 * Exporta os grupos do limpador em CSV: group, keyword.
 *
 * Onde: botão "Exportar CSV" do limpador com agrupamento. Entrada: grupos (o de
 * termo vazio sai com o nome "other"). Saída: CSV com BOM. Sem efeitos.
 */
export function groupsToCsv(groups: readonly KeywordGroup[]): string {
  const rows = groups.flatMap((g) => g.keywords.map((k) => [g.term === "" ? "other" : g.term, k]));
  return serializeCsv([["group", "keyword"], ...rows], { bom: true });
}
