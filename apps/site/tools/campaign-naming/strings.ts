import { type BlockKey, type CaseMode, type CsvLabels, type DateFormat, type NamingSeparator, type TextBlockKey } from "@owiew/core/naming";
import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Gerador de nomenclatura de campanhas. */
export interface NamingStrings {
  readonly single: string;
  readonly batch: string;
  readonly blocksTitle: string;
  readonly blocksHint: string;
  readonly blockLabels: Record<BlockKey, string>;
  readonly blockHints: Record<BlockKey, string>;
  readonly blockNames: Record<BlockKey, string>;
  readonly example: Record<TextBlockKey, string>;
  readonly moveUp: (block: string) => string;
  readonly moveDown: (block: string) => string;
  readonly moved: (block: string, pos: number, total: number) => string;
  readonly position: (n: number) => string;
  readonly dateFormat: string;
  readonly dateFormats: Record<DateFormat, string>;
  readonly dateEmpty: string;
  readonly useToday: string;
  readonly dateErrors: Record<string, string>;
  readonly optionsTitle: string;
  readonly separator: string;
  readonly separators: Record<NamingSeparator, string>;
  readonly caseLabel: string;
  readonly cases: Record<CaseMode, string>;
  readonly stripAccents: string;
  readonly joinerNote: (sep: string, joiner: string) => string;
  readonly result: string;
  readonly resultEmpty: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly length: (n: number) => string;
  readonly tooLong: (limit: number) => string;
  readonly errors: Record<string, string>;
  readonly fieldTooLong: string;
  readonly decodeTitle: string;
  readonly decodeIntro: (sep: string) => string;
  readonly decodeSteps: string;
  readonly colBlock: string;
  readonly colPiece: string;
  readonly batchIntro: string;
  readonly batchLists: Record<TextBlockKey, string>;
  readonly batchListHint: string;
  readonly batchSummary: (n: number, limit: number) => string;
  readonly dupNote: (n: number) => string;
  readonly longNote: (n: number, limit: number) => string;
  readonly batchErrors: Record<string, string>;
  readonly batchEmpty: string;
  readonly exportCsv: string;
  readonly csvFile: string;
  readonly copyAll: string;
  readonly colNum: string;
  readonly colName: string;
  readonly colLength: string;
  readonly truncated: (shown: number, total: number) => string;
  readonly csvLabels: CsvLabels;
}

const pt: NamingStrings = {
  single: "Um nome",
  batch: "Em lote",
  blocksTitle: "Blocos do nome",
  blocksHint: "O nome sai na ordem desta lista. Use os botões para subir ou descer um bloco; bloco vazio é ignorado.",
  blockLabels: {
    channel: "Canal ou plataforma (opcional)",
    objective: "Objetivo",
    audience: "Público",
    offer: "Oferta",
    date: "Data",
  },
  blockHints: {
    channel: "Onde a campanha roda, por exemplo Meta Ads ou Google.",
    objective: "O que a campanha quer gerar, por exemplo Conversão ou Tráfego.",
    audience: "Quem vê o anúncio, por exemplo Remarketing 30d.",
    offer: "A promoção ou o tema, por exemplo Black Friday.",
    date: "Início da campanha. Deixe vazio para não incluir a data.",
  },
  blockNames: { channel: "Canal", objective: "Objetivo", audience: "Público", offer: "Oferta", date: "Data" },
  example: { channel: "Meta Ads", objective: "Conversão", audience: "Remarketing 30d", offer: "Black Friday" },
  moveUp: (b) => `Subir ${b}`,
  moveDown: (b) => `Descer ${b}`,
  moved: (b, pos, total) => `${b} agora é o bloco ${pos} de ${total}.`,
  position: (n) => `Posição ${n}`,
  dateFormat: "Formato da data",
  dateFormats: {
    YYYYMMDD: "AAAAMMDD (20261101)",
    "YYYY-MM-DD": "AAAA-MM-DD (2026-11-01)",
    YYYYMM: "AAAAMM (202611)",
    "YYYY-MM": "AAAA-MM (2026-11)",
    YYMMDD: "AAMMDD (261101)",
    MMMYY: "MMMAA (nov26)",
  },
  dateEmpty: "Sem data: o bloco será ignorado.",
  useToday: "Usar a data de hoje",
  dateErrors: { "invalid-date": "Use uma data válida no formato AAAA-MM-DD." },
  optionsTitle: "Padrão de escrita",
  separator: "Separador entre blocos",
  separators: { _: "_ (sublinhado)", "-": "- (hífen)", ".": ". (ponto)", "|": "| (barra vertical)" },
  caseLabel: "Caixa das letras",
  cases: { lower: "minúsculas", upper: "MAIÚSCULAS", keep: "Manter como digitado" },
  stripAccents: "Remover acentos",
  joinerNote: (sep, j) => `Dentro de um bloco, espaços e símbolos viram "${j}". Assim o separador "${sep}" aparece só entre blocos e o nome pode ser dividido de volta.`,
  result: "Nome gerado",
  resultEmpty: "Preencha ao menos um bloco para ver o nome.",
  copy: "Copiar nome",
  copied: "Copiado",
  copyFailed: "Não foi possível copiar. Selecione o texto e copie manualmente.",
  length: (n) => `${n} ${n === 1 ? "caractere" : "caracteres"}`,
  tooLong: (limit) => `O nome passa de ${limit} caracteres. Algumas plataformas e relatórios cortam nomes longos; confira o limite da sua.`,
  errors: {
    empty: "Preencha ao menos um bloco para ver o nome.",
    "invalid-order": "A ordem dos blocos é inválida.",
    "value-too-long": "Um dos blocos tem texto demais (máximo de 200 caracteres).",
  },
  fieldTooLong: "Este bloco passa de 200 caracteres. Encurte o texto.",
  decodeTitle: "Como decodificar este nome no relatório",
  decodeIntro: (sep) => `Como o separador "${sep}" só aparece entre blocos, dá para dividir o nome de volta em colunas e filtrar ou somar por objetivo, público ou oferta.`,
  decodeSteps: "Na planilha, cole os nomes numa coluna e use Dados > Dividir texto em colunas (Google Planilhas) ou Dados > Texto para Colunas (Excel), com o separador acima como delimitador personalizado. Cada coluna passa a ser um bloco, na ordem desta tabela.",
  colBlock: "Bloco",
  colPiece: "Trecho do nome",
  batchIntro: "Escreva um valor por linha nos blocos que variam. Blocos com a lista vazia usam o valor do campo acima. O gerador combina tudo.",
  batchLists: {
    channel: "Vários canais (um por linha)",
    objective: "Vários objetivos (um por linha)",
    audience: "Vários públicos (um por linha)",
    offer: "Várias ofertas (uma por linha)",
  },
  batchListHint: "Vazio usa o campo acima.",
  batchSummary: (n, limit) => `${n} ${n === 1 ? "nome gerado" : "nomes gerados"} (limite de ${limit}).`,
  dupNote: (n) => `${n} ${n === 1 ? "combinação repetida foi descartada" : "combinações repetidas foram descartadas"} depois da limpeza.`,
  longNote: (n, limit) => `${n} ${n === 1 ? "nome passa" : "nomes passam"} de ${limit} caracteres.`,
  batchErrors: {
    empty: "Nenhum nome para gerar. Preencha ao menos um bloco.",
    "too-many": "São combinações demais: o limite é de 500 nomes. Reduza as listas.",
    "invalid-order": "A ordem dos blocos é inválida.",
    "value-too-long": "Algum valor tem texto demais (máximo de 200 caracteres).",
  },
  batchEmpty: "Cole listas nos blocos que variam para gerar as combinações.",
  exportCsv: "Baixar CSV",
  csvFile: "nomes-de-campanha.csv",
  copyAll: "Copiar todos os nomes",
  colNum: "N.º",
  colName: "Nome",
  colLength: "Tamanho",
  truncated: (shown, total) => `Mostrando ${shown} de ${total}. O CSV e o botão de copiar levam todos.`,
  csvLabels: { channel: "canal", objective: "objetivo", audience: "publico", offer: "oferta", date: "data", name: "nome", length: "tamanho" },
};

const en: NamingStrings = {
  single: "One name",
  batch: "Batch",
  blocksTitle: "Name blocks",
  blocksHint: "The name follows the order of this list. Use the buttons to move a block up or down; an empty block is skipped.",
  blockLabels: {
    channel: "Channel or platform (optional)",
    objective: "Objective",
    audience: "Audience",
    offer: "Offer",
    date: "Date",
  },
  blockHints: {
    channel: "Where the campaign runs, for example Meta Ads or Google.",
    objective: "What the campaign aims for, for example Conversion or Traffic.",
    audience: "Who sees the ad, for example Remarketing 30d.",
    offer: "The promotion or theme, for example Black Friday.",
    date: "Campaign start. Leave empty to leave the date out.",
  },
  blockNames: { channel: "Channel", objective: "Objective", audience: "Audience", offer: "Offer", date: "Date" },
  example: { channel: "Meta Ads", objective: "Conversion", audience: "Remarketing 30d", offer: "Black Friday" },
  moveUp: (b) => `Move ${b} up`,
  moveDown: (b) => `Move ${b} down`,
  moved: (b, pos, total) => `${b} is now block ${pos} of ${total}.`,
  position: (n) => `Position ${n}`,
  dateFormat: "Date format",
  dateFormats: {
    YYYYMMDD: "YYYYMMDD (20261101)",
    "YYYY-MM-DD": "YYYY-MM-DD (2026-11-01)",
    YYYYMM: "YYYYMM (202611)",
    "YYYY-MM": "YYYY-MM (2026-11)",
    YYMMDD: "YYMMDD (261101)",
    MMMYY: "MMMYY (nov26)",
  },
  dateEmpty: "No date: the block will be skipped.",
  useToday: "Use today's date",
  dateErrors: { "invalid-date": "Use a valid date in the YYYY-MM-DD format." },
  optionsTitle: "Writing pattern",
  separator: "Separator between blocks",
  separators: { _: "_ (underscore)", "-": "- (hyphen)", ".": ". (dot)", "|": "| (vertical bar)" },
  caseLabel: "Letter case",
  cases: { lower: "lowercase", upper: "UPPERCASE", keep: "Keep as typed" },
  stripAccents: "Remove accents",
  joinerNote: (sep, j) => `Inside a block, spaces and symbols become "${j}". That way the "${sep}" separator appears only between blocks and the name can be split back.`,
  result: "Generated name",
  resultEmpty: "Fill in at least one block to see the name.",
  copy: "Copy name",
  copied: "Copied",
  copyFailed: "Could not copy. Select the text and copy it manually.",
  length: (n) => `${n} ${n === 1 ? "character" : "characters"}`,
  tooLong: (limit) => `The name is longer than ${limit} characters. Some platforms and reports truncate long names; check the limit of yours.`,
  errors: {
    empty: "Fill in at least one block to see the name.",
    "invalid-order": "The block order is invalid.",
    "value-too-long": "One of the blocks has too much text (200 characters at most).",
  },
  fieldTooLong: "This block is over 200 characters. Shorten the text.",
  decodeTitle: "How to decode this name in your report",
  decodeIntro: (sep) => `Because the "${sep}" separator only appears between blocks, you can split the name back into columns and filter or sum by objective, audience or offer.`,
  decodeSteps: "In a spreadsheet, paste the names into one column and use Data > Split text to columns (Google Sheets) or Data > Text to Columns (Excel), with the separator above as a custom delimiter. Each column becomes one block, in the order of this table.",
  colBlock: "Block",
  colPiece: "Piece of the name",
  batchIntro: "Write one value per line in the blocks that vary. Blocks with an empty list use the value of the field above. The generator combines everything.",
  batchLists: {
    channel: "Several channels (one per line)",
    objective: "Several objectives (one per line)",
    audience: "Several audiences (one per line)",
    offer: "Several offers (one per line)",
  },
  batchListHint: "Empty uses the field above.",
  batchSummary: (n, limit) => `${n} ${n === 1 ? "name generated" : "names generated"} (limit of ${limit}).`,
  dupNote: (n) => `${n} repeated ${n === 1 ? "combination was" : "combinations were"} dropped after cleaning.`,
  longNote: (n, limit) => `${n} ${n === 1 ? "name is" : "names are"} longer than ${limit} characters.`,
  batchErrors: {
    empty: "No names to generate. Fill in at least one block.",
    "too-many": "Too many combinations: the limit is 500 names. Shorten the lists.",
    "invalid-order": "The block order is invalid.",
    "value-too-long": "A value has too much text (200 characters at most).",
  },
  batchEmpty: "Paste lists in the blocks that vary to generate the combinations.",
  exportCsv: "Download CSV",
  csvFile: "campaign-names.csv",
  copyAll: "Copy all names",
  colNum: "No.",
  colName: "Name",
  colLength: "Length",
  truncated: (shown, total) => `Showing ${shown} of ${total}. The CSV and the copy button include all of them.`,
  csvLabels: { channel: "channel", objective: "objective", audience: "audience", offer: "offer", date: "date", name: "name", length: "length" },
};

const es: NamingStrings = {
  single: "Un nombre",
  batch: "En lote",
  blocksTitle: "Bloques del nombre",
  blocksHint: "El nombre sale en el orden de esta lista. Usa los botones para subir o bajar un bloque; un bloque vacío se ignora.",
  blockLabels: {
    channel: "Canal o plataforma (opcional)",
    objective: "Objetivo",
    audience: "Público",
    offer: "Oferta",
    date: "Fecha",
  },
  blockHints: {
    channel: "Dónde corre la campaña, por ejemplo Meta Ads o Google.",
    objective: "Qué busca la campaña, por ejemplo Conversión o Tráfico.",
    audience: "Quién ve el anuncio, por ejemplo Remarketing 30d.",
    offer: "La promoción o el tema, por ejemplo Black Friday.",
    date: "Inicio de la campaña. Déjalo vacío para no incluir la fecha.",
  },
  blockNames: { channel: "Canal", objective: "Objetivo", audience: "Público", offer: "Oferta", date: "Fecha" },
  example: { channel: "Meta Ads", objective: "Conversión", audience: "Remarketing 30d", offer: "Black Friday" },
  moveUp: (b) => `Subir ${b}`,
  moveDown: (b) => `Bajar ${b}`,
  moved: (b, pos, total) => `${b} ahora es el bloque ${pos} de ${total}.`,
  position: (n) => `Posición ${n}`,
  dateFormat: "Formato de la fecha",
  dateFormats: {
    YYYYMMDD: "AAAAMMDD (20261101)",
    "YYYY-MM-DD": "AAAA-MM-DD (2026-11-01)",
    YYYYMM: "AAAAMM (202611)",
    "YYYY-MM": "AAAA-MM (2026-11)",
    YYMMDD: "AAMMDD (261101)",
    MMMYY: "MMMAA (nov26)",
  },
  dateEmpty: "Sin fecha: el bloque se ignorará.",
  useToday: "Usar la fecha de hoy",
  dateErrors: { "invalid-date": "Usa una fecha válida con el formato AAAA-MM-DD." },
  optionsTitle: "Patrón de escritura",
  separator: "Separador entre bloques",
  separators: { _: "_ (guion bajo)", "-": "- (guion)", ".": ". (punto)", "|": "| (barra vertical)" },
  caseLabel: "Mayúsculas y minúsculas",
  cases: { lower: "minúsculas", upper: "MAYÚSCULAS", keep: "Mantener como se escribió" },
  stripAccents: "Quitar acentos",
  joinerNote: (sep, j) => `Dentro de un bloque, los espacios y símbolos se vuelven "${j}". Así el separador "${sep}" aparece solo entre bloques y el nombre se puede dividir de vuelta.`,
  result: "Nombre generado",
  resultEmpty: "Completa al menos un bloque para ver el nombre.",
  copy: "Copiar nombre",
  copied: "Copiado",
  copyFailed: "No se pudo copiar. Selecciona el texto y cópialo a mano.",
  length: (n) => `${n} ${n === 1 ? "carácter" : "caracteres"}`,
  tooLong: (limit) => `El nombre supera los ${limit} caracteres. Algunas plataformas e informes recortan los nombres largos; revisa el límite de la tuya.`,
  errors: {
    empty: "Completa al menos un bloque para ver el nombre.",
    "invalid-order": "El orden de los bloques no es válido.",
    "value-too-long": "Uno de los bloques tiene demasiado texto (máximo 200 caracteres).",
  },
  fieldTooLong: "Este bloque pasa de 200 caracteres. Acorta el texto.",
  decodeTitle: "Cómo decodificar este nombre en el informe",
  decodeIntro: (sep) => `Como el separador "${sep}" solo aparece entre bloques, puedes dividir el nombre de vuelta en columnas y filtrar o sumar por objetivo, público u oferta.`,
  decodeSteps: "En una hoja de cálculo, pega los nombres en una columna y usa Datos > Dividir texto en columnas (Google Sheets) o Datos > Texto en columnas (Excel), con el separador de arriba como delimitador personalizado. Cada columna pasa a ser un bloque, en el orden de esta tabla.",
  colBlock: "Bloque",
  colPiece: "Tramo del nombre",
  batchIntro: "Escribe un valor por línea en los bloques que varían. Los bloques con la lista vacía usan el valor del campo de arriba. El generador combina todo.",
  batchLists: {
    channel: "Varios canales (uno por línea)",
    objective: "Varios objetivos (uno por línea)",
    audience: "Varios públicos (uno por línea)",
    offer: "Varias ofertas (una por línea)",
  },
  batchListHint: "Vacío usa el campo de arriba.",
  batchSummary: (n, limit) => `${n} ${n === 1 ? "nombre generado" : "nombres generados"} (límite de ${limit}).`,
  dupNote: (n) => `${n} ${n === 1 ? "combinación repetida se descartó" : "combinaciones repetidas se descartaron"} después de la limpieza.`,
  longNote: (n, limit) => `${n} ${n === 1 ? "nombre supera" : "nombres superan"} los ${limit} caracteres.`,
  batchErrors: {
    empty: "No hay nombres para generar. Completa al menos un bloque.",
    "too-many": "Demasiadas combinaciones: el límite es de 500 nombres. Reduce las listas.",
    "invalid-order": "El orden de los bloques no es válido.",
    "value-too-long": "Algún valor tiene demasiado texto (máximo 200 caracteres).",
  },
  batchEmpty: "Pega listas en los bloques que varían para generar las combinaciones.",
  exportCsv: "Descargar CSV",
  csvFile: "nombres-de-campana.csv",
  copyAll: "Copiar todos los nombres",
  colNum: "N.º",
  colName: "Nombre",
  colLength: "Tamaño",
  truncated: (shown, total) => `Mostrando ${shown} de ${total}. El CSV y el botón de copiar incluyen todos.`,
  csvLabels: { channel: "canal", objective: "objetivo", audience: "publico", offer: "oferta", date: "fecha", name: "nombre", length: "tamano" },
};

/**
 * Devolve os textos da ferramenta no idioma da página.
 *
 * Onde: Ui.tsx e os painéis. Entrada: idioma. Saída: objeto de textos. Sem efeitos.
 */
export function strings(lang: Lang): NamingStrings {
  if (lang === "en") return en;
  if (lang === "es") return es;
  return pt;
}
