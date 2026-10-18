import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Combinador de palavras-chave. */
export interface CombinerStrings {
  readonly listA: string;
  readonly listB: string;
  readonly listC: string;
  readonly listHint: string;
  readonly matchTypes: string;
  readonly broad: string;
  readonly phrase: string;
  readonly exact: string;
  readonly limit: string;
  readonly options: string;
  readonly lowercase: string;
  readonly stripAccents: string;
  readonly results: string;
  readonly summary: (shown: number, total: number) => string;
  readonly truncated: (total: number) => string;
  readonly overLimit: (n: number) => string;
  readonly output: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly exportCsv: string;
  readonly errors: Record<string, string>;
  readonly example: { readonly a: string; readonly b: string; readonly c: string };
}

const pt: CombinerStrings = {
  listA: "Lista A", listB: "Lista B", listC: "Lista C (opcional)", listHint: "Um termo por linha. Repetidos e linhas vazias são ignorados.",
  matchTypes: "Tipos de correspondência", broad: "Ampla: termo", phrase: "Frase: “termo”", exact: "Exata: [termo]",
  limit: "Limite de linhas na saída", options: "Opções", lowercase: "Converter para minúsculas", stripAccents: "Remover acentos",
  results: "Resultado", summary: (shown, total) => `${shown} de ${total} linhas.`, truncated: (total) => `Há ${total} combinações no total; mostrando só até o limite. Aumente o limite ou reduza as listas.`,
  overLimit: (n) => `${n} combinação(ões) passam de 80 caracteres ou 10 palavras e o Google as rejeita.`,
  output: "Palavras-chave geradas", copy: "Copiar lista", copied: "Copiado", copyFailed: "Não foi possível copiar", exportCsv: "Exportar CSV",
  errors: { "no-terms": "Escreva pelo menos um termo em alguma lista.", "no-match-type": "Marque pelo menos um tipo de correspondência.", "invalid-limit": "Escolha um limite válido.", "list-too-long": "Cada lista aceita até 10.000 linhas.", "too-many-lists": "São no máximo 3 listas." },
  example: { a: "comprar\npreço\norçamento", b: "tênis\nsapato", c: "masculino\nfeminino" },
};

const en: CombinerStrings = {
  listA: "List A", listB: "List B", listC: "List C (optional)", listHint: "One term per line. Duplicates and empty lines are ignored.",
  matchTypes: "Match types", broad: "Broad: term", phrase: "Phrase: “term”", exact: "Exact: [term]",
  limit: "Output line limit", options: "Options", lowercase: "Convert to lowercase", stripAccents: "Remove accents",
  results: "Result", summary: (shown, total) => `${shown} of ${total} lines.`, truncated: (total) => `There are ${total} combinations in total; showing only up to the limit. Raise the limit or shrink the lists.`,
  overLimit: (n) => `${n} combination(s) exceed 80 characters or 10 words and Google rejects them.`,
  output: "Generated keywords", copy: "Copy list", copied: "Copied", copyFailed: "Could not copy", exportCsv: "Export CSV",
  errors: { "no-terms": "Write at least one term in some list.", "no-match-type": "Tick at least one match type.", "invalid-limit": "Pick a valid limit.", "list-too-long": "Each list accepts up to 10,000 lines.", "too-many-lists": "At most 3 lists." },
  example: { a: "buy\nprice\nquote", b: "sneakers\nshoes", c: "men\nwomen" },
};

const es: CombinerStrings = {
  listA: "Lista A", listB: "Lista B", listC: "Lista C (opcional)", listHint: "Un término por línea. Los repetidos y las líneas vacías se ignoran.",
  matchTypes: "Tipos de concordancia", broad: "Amplia: término", phrase: "Frase: “término”", exact: "Exacta: [término]",
  limit: "Límite de líneas en la salida", options: "Opciones", lowercase: "Convertir a minúsculas", stripAccents: "Quitar acentos",
  results: "Resultado", summary: (shown, total) => `${shown} de ${total} líneas.`, truncated: (total) => `Hay ${total} combinaciones en total; se muestran solo hasta el límite. Sube el límite o reduce las listas.`,
  overLimit: (n) => `${n} combinación(es) pasan de 80 caracteres o 10 palabras y Google las rechaza.`,
  output: "Palabras clave generadas", copy: "Copiar lista", copied: "Copiado", copyFailed: "No se pudo copiar", exportCsv: "Exportar CSV",
  errors: { "no-terms": "Escribe al menos un término en alguna lista.", "no-match-type": "Marca al menos un tipo de concordancia.", "invalid-limit": "Elige un límite válido.", "list-too-long": "Cada lista admite hasta 10.000 líneas.", "too-many-lists": "Máximo 3 listas." },
  example: { a: "comprar\nprecio\npresupuesto", b: "zapatillas\nzapatos", c: "hombre\nmujer" },
};

const ALL: Record<Lang, CombinerStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Combinador no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): CombinerStrings {
  return ALL[lang];
}
