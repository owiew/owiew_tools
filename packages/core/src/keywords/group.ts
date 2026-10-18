/** Um grupo de palavras-chave que compartilham um termo. `term` vazio = os que não agrupam com ninguém. */
export interface KeywordGroup {
  readonly term: string;
  readonly keywords: readonly string[];
}

/** Palavras de ligação ignoradas ao escolher o termo do grupo (pt, en, es). */
const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "para", "com", "em", "no", "na", "por", "um", "uma", "e", "ou", "a", "o", "as", "os",
  "the", "of", "for", "and", "in", "on", "to", "with", "an", "or", "at", "by",
  "el", "la", "los", "las", "con", "y", "en", "un", "una", "del", "al", "se", "que",
]);

/**
 * Palavras candidatas a "termo" de um grupo (sem ligação e com 3+ letras).
 *
 * Onde: etapa interna de `groupByTerm`. Entrada: palavra-chave. Saída: palavras únicas. Sem efeitos.
 */
function candidates(keyword: string): string[] {
  const words = keyword.toLowerCase().split(/\s+/u).filter((w) => Array.from(w).length >= 3 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

/**
 * Agrupa palavras-chave por termo compartilhado (base para criar grupos de anúncios).
 *
 * O quê: conta em quantas palavras-chave cada palavra aparece; cada palavra-chave
 * entra no grupo da sua palavra mais frequente (empate: a mais longa, depois a
 * ordem alfabética), de forma determinística. Grupos com menos de `minSize`
 * itens vão para o grupo de termo vazio ("outros").
 * Onde: limpador de palavras-chave (opção "agrupar por termo"). Entradas: lista
 * já limpa e tamanho mínimo (>= 1). Saída: grupos do maior para o menor; "outros" por último. Sem efeitos.
 */
export function groupByTerm(keywords: readonly string[], minSize = 2): KeywordGroup[] {
  const freq = new Map<string, number>();
  for (const k of keywords) for (const w of candidates(k)) freq.set(w, (freq.get(w) ?? 0) + 1);
  const chosen = new Map<string, string[]>();
  for (const k of keywords) {
    const best = candidates(k).sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0) || b.length - a.length || a.localeCompare(b, "en"))[0] ?? "";
    chosen.set(best, [...(chosen.get(best) ?? []), k]);
  }
  const groups: KeywordGroup[] = [];
  const others: string[] = [...(chosen.get("") ?? [])];
  for (const [term, list] of chosen) {
    if (term === "") continue;
    if (list.length >= Math.max(1, minSize)) groups.push({ term, keywords: list });
    else others.push(...list);
  }
  groups.sort((a, b) => b.keywords.length - a.keywords.length || a.term.localeCompare(b.term, "en"));
  if (others.length > 0) groups.push({ term: "", keywords: others });
  return groups;
}
