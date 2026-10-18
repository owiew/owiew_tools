/** Tipos de correspondência de palavra-chave do Google Ads (busca). */
export type MatchType = "broad" | "phrase" | "exact";

/** Ordem canônica dos tipos (usada em listas, CSV e na UI). */
export const MATCH_TYPES: readonly MatchType[] = ["broad", "phrase", "exact"];

/**
 * Aplica a sintaxe do tipo de correspondência a um termo.
 *
 * O quê: ampla = o termo puro; frase = entre aspas; exata = entre colchetes
 * (sintaxe oficial da Ajuda do Google Ads; o "+" de ampla modificada foi
 * descontinuado e não é gerado). A mesma sintaxe vale para negativas.
 * Onde: combinador, limpador e gerador de negativas. Entradas: termo e tipo.
 * Saída: texto formatado. Sem efeitos.
 */
export function formatKeyword(term: string, type: MatchType): string {
  if (type === "phrase") return `"${term}"`;
  if (type === "exact") return `[${term}]`;
  return term;
}
