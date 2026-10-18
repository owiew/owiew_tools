import { type Result, fail, ok } from "../result";
import { normalizeTerm } from "./normalize";

/** Idiomas das listas-semente. */
export type SeedLang = "pt-br" | "en" | "es";

/**
 * Termos que costumam atrair clique sem intenção de compra (grátis, emprego,
 * curso, baixar...). São SUGESTÃO inicial: o que serve a uma empresa pode ser o
 * produto de outra (quem vende curso não negativa "curso"). Revise antes de usar.
 */
const SEEDS: Record<SeedLang, readonly string[]> = {
  "pt-br": ["grátis", "gratis", "gratuito", "gratuita", "emprego", "vaga", "vagas", "curso", "cursos", "download", "baixar", "pdf", "torrent", "pirata", "usado", "usada", "wikipedia", "o que é", "significado", "como fazer", "diy", "receita"],
  en: ["free", "jobs", "job", "career", "salary", "course", "courses", "download", "torrent", "pdf", "crack", "used", "wiki", "wikipedia", "definition", "meaning", "diy", "how to", "recipe"],
  es: ["gratis", "gratuito", "empleo", "trabajo", "vacantes", "curso", "cursos", "descargar", "pdf", "torrent", "usado", "wikipedia", "definición", "significado", "cómo hacer", "casero", "receta"],
};

/**
 * Devolve a lista-semente de negativas de um idioma.
 *
 * Onde: opção "incluir negativas comuns" do gerador. Entrada: idioma. Saída:
 * cópia da lista (pode ser alterada pelo chamador). Sem efeitos.
 */
export function seedNegatives(lang: SeedLang): string[] {
  return [...SEEDS[lang]];
}

/** Uma negativa sugerida e em quantos termos de pesquisa ela aparece. */
export interface NegativeSuggestion {
  readonly word: string;
  readonly count: number;
}

/** Entrada do sugestor. */
export interface NegativeInput {
  /** Termos de pesquisa reais (relatório de termos de pesquisa), um por item. */
  readonly searchTerms: readonly string[];
  /** Suas palavras-chave (palavras que aparecem nelas NUNCA viram negativa). */
  readonly keepKeywords: readonly string[];
  /** Ignora palavras que aparecem em menos termos que isto (>= 1). */
  readonly minCount: number;
}

/** Erros estáveis. */
export type NegativeError = "no-search-terms" | "invalid-min-count" | "too-many-terms";

/** Teto de termos de pesquisa processados. */
export const MAX_SEARCH_TERMS = 100_000;

/** Palavras de ligação nunca sugeridas como negativa (negativar "de" bloqueia quase tudo). */
const LINKS = new Set(["de", "da", "do", "das", "dos", "para", "com", "em", "no", "na", "por", "um", "uma", "e", "ou", "a", "o", "as", "os", "the", "of", "for", "and", "in", "on", "to", "with", "an", "or", "at", "by", "el", "la", "los", "las", "con", "y", "en", "un", "una", "del", "al", "se", "que"]);

/**
 * Sugere negativas: palavras dos termos de pesquisa que não aparecem nas suas palavras-chave.
 *
 * O quê: normaliza tudo (minúscula, sem acento para comparar), separa em
 * palavras, ignora palavras de ligação e as que fazem parte das suas
 * palavras-chave, e conta em quantos termos cada sobra aparece.
 * Onde: ilha do limpador de palavras-chave (aba negativas). Entrada: NegativeInput.
 * Saída: Result com sugestões da mais frequente à menos (empate alfabético), ou erro. Sem efeitos.
 */
export function suggestNegatives(input: NegativeInput): Result<NegativeSuggestion[], NegativeError> {
  if (!Number.isSafeInteger(input.minCount) || input.minCount < 1) return fail("invalid-min-count");
  if (input.searchTerms.length > MAX_SEARCH_TERMS) return fail("too-many-terms");
  const fold = (t: string): string => normalizeTerm(t, { lowercase: true, stripAccents: true, stripSymbols: true });
  const keep = new Set(input.keepKeywords.flatMap((k) => fold(k).split(" ")).filter((w) => w !== ""));
  const display = new Map<string, string>();
  const counts = new Map<string, number>();
  let any = false;
  for (const raw of input.searchTerms) {
    const words = new Set<string>();
    for (const original of normalizeTerm(raw, { lowercase: true, stripAccents: false, stripSymbols: true }).split(" ")) {
      const key = fold(original);
      if (key === "" || LINKS.has(key) || keep.has(key)) continue;
      words.add(key);
      if (!display.has(key)) display.set(key, original);
    }
    if (normalizeTerm(raw, { lowercase: true, stripAccents: false, stripSymbols: true }) !== "") any = true;
    for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  if (!any) return fail("no-search-terms");
  const out = [...counts]
    .filter(([, c]) => c >= input.minCount)
    .map(([key, count]) => ({ word: display.get(key) ?? key, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "en"));
  return ok(out);
}
