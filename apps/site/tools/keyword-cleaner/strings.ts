import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Limpador de palavras-chave e gerador de negativas. */
export interface CleanerStrings {
  readonly tabClean: string;
  readonly tabNegatives: string;
  readonly input: string;
  readonly inputHint: string;
  readonly options: string;
  readonly lowercase: string;
  readonly stripAccents: string;
  readonly stripSymbols: string;
  readonly ignoreOrder: string;
  readonly removeOverLimit: string;
  readonly group: string;
  readonly sort: string;
  readonly sortNone: string;
  readonly sortAz: string;
  readonly results: string;
  readonly stats: (input: number, kept: number, dup: number, over: number) => string;
  readonly output: string;
  readonly removed: string;
  readonly colText: string;
  readonly colReason: string;
  readonly reasons: Record<string, string>;
  readonly groupOther: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly exportCsv: string;
  readonly errors: Record<string, string>;
  readonly searchTerms: string;
  readonly searchTermsHint: string;
  readonly keepKeywords: string;
  readonly keepKeywordsHint: string;
  readonly minCount: string;
  readonly seeds: string;
  readonly seedsHint: string;
  readonly matchType: string;
  readonly broad: string;
  readonly phrase: string;
  readonly exact: string;
  readonly suggestions: string;
  readonly colWord: string;
  readonly colCount: string;
  readonly negativesOut: string;
  readonly negativesNote: string;
  readonly none: string;
  readonly example: { readonly list: string; readonly terms: string; readonly keep: string };
}

const pt: CleanerStrings = {
  tabClean: "Limpar lista", tabNegatives: "Gerar negativas",
  input: "Palavras-chave", inputHint: "Cole uma por linha, ou separadas por vírgula ou ponto e vírgula.",
  options: "Opções", lowercase: "Converter para minúsculas", stripAccents: "Remover acentos", stripSymbols: "Remover símbolos que o Google rejeita", ignoreOrder: "Tratar “tênis azul” e “azul tênis” como repetidas", removeOverLimit: "Remover o que passa de 80 caracteres ou 10 palavras",
  group: "Agrupar por termo", sort: "Ordem", sortNone: "Como foi colada", sortAz: "A a Z",
  results: "Resultado", stats: (i, k, d, o) => `${i} entradas, ${k} mantidas, ${d} repetidas removidas, ${o} fora do limite.`,
  output: "Lista limpa", removed: "Removidas", colText: "Texto", colReason: "Motivo",
  reasons: { empty: "Vazia depois da limpeza", duplicate: "Repetida", "too-long": "Mais de 80 caracteres", "too-many-words": "Mais de 10 palavras" },
  groupOther: "Outros",
  copy: "Copiar lista", copied: "Copiado", copyFailed: "Não foi possível copiar", exportCsv: "Exportar CSV",
  errors: { "too-many-lines": "A lista passa de 100.000 itens. Divida em partes.", "no-search-terms": "Cole pelo menos um termo de pesquisa.", "invalid-min-count": "Escolha uma frequência mínima válida.", "too-many-terms": "Há termos demais (máximo de 100.000)." },
  searchTerms: "Termos de pesquisa", searchTermsHint: "Cole a coluna de termos do relatório “Termos de pesquisa” do Google Ads, um por linha.",
  keepKeywords: "Suas palavras-chave", keepKeywordsHint: "Palavras que aparecem aqui nunca viram negativa.",
  minCount: "Aparece em pelo menos", seeds: "Incluir negativas comuns", seedsHint: "Grátis, emprego, curso, download… Revise: se você vende curso, não negative “curso”.",
  matchType: "Correspondência das negativas", broad: "Ampla: termo", phrase: "Frase: “termo”", exact: "Exata: [termo]",
  suggestions: "Palavras sugeridas", colWord: "Palavra", colCount: "Termos", negativesOut: "Lista de negativas", negativesNote: "Negativas não pegam plural, sinônimo nem variação próxima: inclua as formas que quiser bloquear.",
  none: "Nenhuma palavra sugerida com essa frequência.",
  example: {
    list: "Tênis Azul\ntênis azul\nTênis de corrida!\ncomprar tênis (barato)\nazul tênis\nTenis de corrida\n\nsapato social",
    terms: "tênis azul grátis\ntênis de corrida download\ncomprar tênis de corrida\nemprego fábrica de tênis\ntênis azul grátis pdf\ncurso de tênis",
    keep: "tênis azul\ncomprar tênis de corrida",
  },
};

const en: CleanerStrings = {
  tabClean: "Clean list", tabNegatives: "Generate negatives",
  input: "Keywords", inputHint: "Paste one per line, or separated by commas or semicolons.",
  options: "Options", lowercase: "Convert to lowercase", stripAccents: "Remove accents", stripSymbols: "Remove symbols Google rejects", ignoreOrder: "Treat “blue shoes” and “shoes blue” as duplicates", removeOverLimit: "Remove anything over 80 characters or 10 words",
  group: "Group by term", sort: "Order", sortNone: "As pasted", sortAz: "A to Z",
  results: "Result", stats: (i, k, d, o) => `${i} entries, ${k} kept, ${d} duplicates removed, ${o} over the limit.`,
  output: "Clean list", removed: "Removed", colText: "Text", colReason: "Reason",
  reasons: { empty: "Empty after cleaning", duplicate: "Duplicate", "too-long": "Over 80 characters", "too-many-words": "Over 10 words" },
  groupOther: "Other",
  copy: "Copy list", copied: "Copied", copyFailed: "Could not copy", exportCsv: "Export CSV",
  errors: { "too-many-lines": "The list has more than 100,000 items. Split it into parts.", "no-search-terms": "Paste at least one search term.", "invalid-min-count": "Pick a valid minimum frequency.", "too-many-terms": "Too many terms (maximum 100,000)." },
  searchTerms: "Search terms", searchTermsHint: "Paste the terms column from the Google Ads “Search terms” report, one per line.",
  keepKeywords: "Your keywords", keepKeywordsHint: "Words that appear here never become negatives.",
  minCount: "Appears in at least", seeds: "Include common negatives", seedsHint: "Free, jobs, course, download… Review: if you sell courses, do not negate “course”.",
  matchType: "Negative match type", broad: "Broad: term", phrase: "Phrase: “term”", exact: "Exact: [term]",
  suggestions: "Suggested words", colWord: "Word", colCount: "Terms", negativesOut: "Negative list", negativesNote: "Negatives do not match plurals, synonyms or close variants: include every form you want to block.",
  none: "No word suggested at this frequency.",
  example: {
    list: "Blue Shoes\nblue shoes\nRunning shoes!\nbuy shoes (cheap)\nshoes blue\nRunning  shoes\n\ndress shoes",
    terms: "blue shoes free\nrunning shoes download\nbuy running shoes\nrunning shoes factory jobs\nblue shoes free pdf\nrunning shoes course",
    keep: "blue shoes\nbuy running shoes",
  },
};

const es: CleanerStrings = {
  tabClean: "Limpiar lista", tabNegatives: "Generar negativas",
  input: "Palabras clave", inputHint: "Pega una por línea, o separadas por comas o punto y coma.",
  options: "Opciones", lowercase: "Convertir a minúsculas", stripAccents: "Quitar acentos", stripSymbols: "Quitar símbolos que Google rechaza", ignoreOrder: "Tratar “zapatillas azules” y “azules zapatillas” como repetidas", removeOverLimit: "Quitar lo que pase de 80 caracteres o 10 palabras",
  group: "Agrupar por término", sort: "Orden", sortNone: "Como se pegó", sortAz: "A a Z",
  results: "Resultado", stats: (i, k, d, o) => `${i} entradas, ${k} conservadas, ${d} repetidas quitadas, ${o} fuera del límite.`,
  output: "Lista limpia", removed: "Quitadas", colText: "Texto", colReason: "Motivo",
  reasons: { empty: "Vacía tras la limpieza", duplicate: "Repetida", "too-long": "Más de 80 caracteres", "too-many-words": "Más de 10 palabras" },
  groupOther: "Otros",
  copy: "Copiar lista", copied: "Copiado", copyFailed: "No se pudo copiar", exportCsv: "Exportar CSV",
  errors: { "too-many-lines": "La lista pasa de 100.000 elementos. Divídela en partes.", "no-search-terms": "Pega al menos un término de búsqueda.", "invalid-min-count": "Elige una frecuencia mínima válida.", "too-many-terms": "Hay demasiados términos (máximo 100.000)." },
  searchTerms: "Términos de búsqueda", searchTermsHint: "Pega la columna de términos del informe “Términos de búsqueda” de Google Ads, uno por línea.",
  keepKeywords: "Tus palabras clave", keepKeywordsHint: "Las palabras que aparecen aquí nunca se vuelven negativas.",
  minCount: "Aparece en al menos", seeds: "Incluir negativas comunes", seedsHint: "Gratis, empleo, curso, descargar… Revisa: si vendes cursos, no negativices “curso”.",
  matchType: "Concordancia de las negativas", broad: "Amplia: término", phrase: "Frase: “término”", exact: "Exacta: [término]",
  suggestions: "Palabras sugeridas", colWord: "Palabra", colCount: "Términos", negativesOut: "Lista de negativas", negativesNote: "Las negativas no cubren plurales, sinónimos ni variantes cercanas: incluye todas las formas que quieras bloquear.",
  none: "Ninguna palabra sugerida con esa frecuencia.",
  example: {
    list: "Zapatillas Azules\nzapatillas azules\nZapatillas de running!\ncomprar zapatillas (baratas)\nazules zapatillas\nZapatillas  de running\n\nzapato formal",
    terms: "zapatillas azules gratis\nzapatillas de running descargar\ncomprar zapatillas de running\nempleo fábrica de zapatillas\nzapatillas azules gratis pdf\ncurso de zapatillas",
    keep: "zapatillas azules\ncomprar zapatillas de running",
  },
};

const ALL: Record<Lang, CleanerStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Limpador no idioma pedido.
 *
 * Onde: Ui.tsx e painéis. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): CleanerStrings {
  return ALL[lang];
}
