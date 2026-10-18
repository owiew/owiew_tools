import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Gerador de UTM. */
export interface UtmStrings {
  readonly single: string;
  readonly batch: string;
  readonly url: string;
  readonly urlHint: string;
  readonly source: string;
  readonly sourceHint: string;
  readonly medium: string;
  readonly mediumHint: string;
  readonly campaign: string;
  readonly campaignHint: string;
  readonly term: string;
  readonly content: string;
  readonly id: string;
  readonly optional: string;
  readonly rulesTitle: string;
  readonly lowercase: string;
  readonly stripAccents: string;
  readonly separator: string;
  readonly sepDash: string;
  readonly sepUnderscore: string;
  readonly sepDot: string;
  readonly savePattern: string;
  readonly saved: string;
  readonly resetPattern: string;
  readonly storageOff: string;
  readonly result: string;
  readonly resultEmpty: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly batchInput: string;
  readonly batchMode: string;
  readonly modeUrls: string;
  readonly modeCsv: string;
  readonly batchHint: string;
  readonly batchDefaults: string;
  readonly exportCsv: string;
  readonly copyAll: string;
  readonly summary: (ok: number, bad: number) => string;
  readonly colLine: string;
  readonly colUrl: string;
  readonly colStatus: string;
  readonly statusOk: string;
  readonly truncated: (shown: number, total: number) => string;
  readonly errors: Record<string, string>;
  readonly batchErrors: Record<string, string>;
  readonly warnings: {
    readonly schemeAssumed: string;
    readonly replaced: (keys: string) => string;
    readonly normalized: (key: string, from: string, to: string) => string;
  };
}

const pt: UtmStrings = {
  single: "Um link",
  batch: "Em lote",
  url: "URL de destino",
  urlHint: "Página para onde o clique vai. Pode colar com ou sem https://.",
  source: "Origem (utm_source)",
  sourceHint: "Quem envia o tráfego: google, meta, newsletter.",
  medium: "Mídia (utm_medium)",
  mediumHint: "Tipo de canal: cpc, social, email.",
  campaign: "Campanha (utm_campaign)",
  campaignHint: "Nome da campanha: black-friday-2026.",
  term: "Termo (utm_term)",
  content: "Conteúdo (utm_content)",
  id: "ID da campanha (utm_id)",
  optional: "opcional",
  rulesTitle: "Padrão de nomenclatura",
  lowercase: "Converter para minúsculas",
  stripAccents: "Remover acentos",
  separator: "Separador no lugar de espaços e símbolos",
  sepDash: "Hífen ( - )",
  sepUnderscore: "Sublinhado ( _ )",
  sepDot: "Ponto ( . )",
  savePattern: "Salvar este padrão",
  saved: "Padrão salvo neste navegador.",
  resetPattern: "Restaurar padrão da casa",
  storageOff: "Este navegador bloqueou o armazenamento local; o padrão vale só nesta página.",
  result: "Link com UTM",
  resultEmpty: "Preencha a URL, a origem, a mídia e a campanha para gerar o link.",
  copy: "Copiar link",
  copied: "Link copiado",
  copyFailed: "Não foi possível copiar. Selecione o texto e copie manualmente.",
  batchInput: "URLs ou CSV",
  batchMode: "Formato da entrada",
  modeUrls: "Uma URL por linha",
  modeCsv: "CSV com colunas",
  batchHint: "CSV: url, source, medium, campaign, term, content, id (com ou sem cabeçalho; vírgula, ponto e vírgula ou tab). Células vazias usam os valores padrão abaixo.",
  batchDefaults: "Valores padrão do lote",
  exportCsv: "Exportar CSV",
  copyAll: "Copiar todas as URLs",
  summary: (ok, bad) => `${ok} gerada${ok === 1 ? "" : "s"}, ${bad} com erro.`,
  colLine: "Linha",
  colUrl: "Resultado",
  colStatus: "Situação",
  statusOk: "Pronta",
  truncated: (shown, total) => `Mostrando ${shown} de ${total} linhas. O CSV exportado tem todas.`,
  errors: {
    "empty-url": "Informe a URL de destino.",
    "invalid-url": "Essa URL não parece válida.",
    "unsupported-scheme": "Só aceitamos links http:// ou https://.",
    "url-too-long": "A URL é longa demais.",
    "missing-source": "Informe a origem (utm_source).",
    "missing-medium": "Informe a mídia (utm_medium).",
    "missing-campaign": "Informe a campanha (utm_campaign).",
  },
  batchErrors: {
    empty: "Cole pelo menos uma linha.",
    "too-many-rows": "O lote passa de 2.000 linhas. Divida em partes menores.",
  },
  warnings: {
    schemeAssumed: "Faltava o https://, então ele foi adicionado.",
    replaced: (keys) => `A URL já tinha ${keys}; os valores antigos foram substituídos.`,
    normalized: (key, from, to) => `${key}: "${from}" virou "${to}".`,
  },
};

const en: UtmStrings = {
  single: "One link",
  batch: "Batch",
  url: "Destination URL",
  urlHint: "The page the click lands on. You can paste it with or without https://.",
  source: "Source (utm_source)",
  sourceHint: "Who sends the traffic: google, meta, newsletter.",
  medium: "Medium (utm_medium)",
  mediumHint: "Channel type: cpc, social, email.",
  campaign: "Campaign (utm_campaign)",
  campaignHint: "Campaign name: black-friday-2026.",
  term: "Term (utm_term)",
  content: "Content (utm_content)",
  id: "Campaign ID (utm_id)",
  optional: "optional",
  rulesTitle: "Naming rules",
  lowercase: "Convert to lowercase",
  stripAccents: "Remove accents",
  separator: "Separator in place of spaces and symbols",
  sepDash: "Hyphen ( - )",
  sepUnderscore: "Underscore ( _ )",
  sepDot: "Dot ( . )",
  savePattern: "Save these rules",
  saved: "Rules saved in this browser.",
  resetPattern: "Restore recommended rules",
  storageOff: "This browser blocked local storage; the rules apply to this page only.",
  result: "Link with UTM",
  resultEmpty: "Fill in the URL, source, medium and campaign to build the link.",
  copy: "Copy link",
  copied: "Link copied",
  copyFailed: "Could not copy. Select the text and copy it manually.",
  batchInput: "URLs or CSV",
  batchMode: "Input format",
  modeUrls: "One URL per line",
  modeCsv: "CSV with columns",
  batchHint: "CSV: url, source, medium, campaign, term, content, id (with or without header; comma, semicolon or tab). Empty cells use the default values below.",
  batchDefaults: "Batch default values",
  exportCsv: "Export CSV",
  copyAll: "Copy all URLs",
  summary: (ok, bad) => `${ok} built, ${bad} with errors.`,
  colLine: "Line",
  colUrl: "Result",
  colStatus: "Status",
  statusOk: "Ready",
  truncated: (shown, total) => `Showing ${shown} of ${total} rows. The exported CSV has them all.`,
  errors: {
    "empty-url": "Enter the destination URL.",
    "invalid-url": "That URL does not look valid.",
    "unsupported-scheme": "Only http:// or https:// links are accepted.",
    "url-too-long": "The URL is too long.",
    "missing-source": "Enter the source (utm_source).",
    "missing-medium": "Enter the medium (utm_medium).",
    "missing-campaign": "Enter the campaign (utm_campaign).",
  },
  batchErrors: {
    empty: "Paste at least one line.",
    "too-many-rows": "The batch is over 2,000 rows. Split it into smaller parts.",
  },
  warnings: {
    schemeAssumed: "The https:// was missing, so it was added.",
    replaced: (keys) => `The URL already had ${keys}; the old values were replaced.`,
    normalized: (key, from, to) => `${key}: "${from}" became "${to}".`,
  },
};

const es: UtmStrings = {
  single: "Un enlace",
  batch: "En lote",
  url: "URL de destino",
  urlHint: "La página a la que llega el clic. Puedes pegarla con o sin https://.",
  source: "Origen (utm_source)",
  sourceHint: "Quién envía el tráfico: google, meta, newsletter.",
  medium: "Medio (utm_medium)",
  mediumHint: "Tipo de canal: cpc, social, email.",
  campaign: "Campaña (utm_campaign)",
  campaignHint: "Nombre de la campaña: black-friday-2026.",
  term: "Término (utm_term)",
  content: "Contenido (utm_content)",
  id: "ID de campaña (utm_id)",
  optional: "opcional",
  rulesTitle: "Reglas de nomenclatura",
  lowercase: "Convertir a minúsculas",
  stripAccents: "Quitar acentos",
  separator: "Separador en lugar de espacios y símbolos",
  sepDash: "Guion ( - )",
  sepUnderscore: "Guion bajo ( _ )",
  sepDot: "Punto ( . )",
  savePattern: "Guardar estas reglas",
  saved: "Reglas guardadas en este navegador.",
  resetPattern: "Restaurar reglas recomendadas",
  storageOff: "Este navegador bloqueó el almacenamiento local; las reglas valen solo en esta página.",
  result: "Enlace con UTM",
  resultEmpty: "Completa la URL, el origen, el medio y la campaña para generar el enlace.",
  copy: "Copiar enlace",
  copied: "Enlace copiado",
  copyFailed: "No se pudo copiar. Selecciona el texto y cópialo manualmente.",
  batchInput: "URLs o CSV",
  batchMode: "Formato de entrada",
  modeUrls: "Una URL por línea",
  modeCsv: "CSV con columnas",
  batchHint: "CSV: url, source, medium, campaign, term, content, id (con o sin encabezado; coma, punto y coma o tab). Las celdas vacías usan los valores predeterminados de abajo.",
  batchDefaults: "Valores predeterminados del lote",
  exportCsv: "Exportar CSV",
  copyAll: "Copiar todas las URLs",
  summary: (ok, bad) => `${ok} generada${ok === 1 ? "" : "s"}, ${bad} con error.`,
  colLine: "Línea",
  colUrl: "Resultado",
  colStatus: "Estado",
  statusOk: "Lista",
  truncated: (shown, total) => `Mostrando ${shown} de ${total} filas. El CSV exportado las tiene todas.`,
  errors: {
    "empty-url": "Indica la URL de destino.",
    "invalid-url": "Esa URL no parece válida.",
    "unsupported-scheme": "Solo se aceptan enlaces http:// o https://.",
    "url-too-long": "La URL es demasiado larga.",
    "missing-source": "Indica el origen (utm_source).",
    "missing-medium": "Indica el medio (utm_medium).",
    "missing-campaign": "Indica la campaña (utm_campaign).",
  },
  batchErrors: {
    empty: "Pega al menos una línea.",
    "too-many-rows": "El lote supera las 2.000 filas. Divídelo en partes más pequeñas.",
  },
  warnings: {
    schemeAssumed: "Faltaba el https://, así que se agregó.",
    replaced: (keys) => `La URL ya tenía ${keys}; se reemplazaron los valores anteriores.`,
    normalized: (key, from, to) => `${key}: "${from}" pasó a "${to}".`,
  },
};

const ALL: Record<Lang, UtmStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Gerador de UTM no idioma pedido.
 *
 * Onde: Ui.tsx e subcomponentes. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): UtmStrings {
  return ALL[lang];
}
