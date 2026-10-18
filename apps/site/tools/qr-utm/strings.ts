import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Gerador de QR Code. */
export interface QrStrings {
  readonly url: string;
  readonly urlHint: string;
  readonly addUtm: string;
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly utmHint: string;
  readonly ecc: string;
  readonly eccOptions: Record<"L" | "M" | "Q" | "H", string>;
  readonly size: string;
  readonly sizeHint: string;
  readonly margin: string;
  readonly marginHint: string;
  readonly fg: string;
  readonly bg: string;
  readonly colorsHint: string;
  readonly result: string;
  readonly previewLabel: (url: string) => string;
  readonly facts: (version: number, px: number, contrast: string) => string;
  readonly payload: string;
  readonly downloadSvg: string;
  readonly downloadPng: string;
  readonly downloaded: string;
  readonly pngFailed: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly example: { readonly url: string; readonly source: string; readonly medium: string; readonly campaign: string };
  readonly errors: Record<string, string>;
  readonly warnings: Record<string, string>;
}

const pt: QrStrings = {
  url: "Link de destino",
  urlHint: "Página final, com https://. Endereços curtos geram códigos mais simples e fáceis de ler.",
  addUtm: "Adicionar UTM ao link",
  source: "Origem (utm_source)",
  medium: "Mídia (utm_medium)",
  campaign: "Campanha (utm_campaign)",
  utmHint: "Usa o padrão de nomenclatura da casa: minúsculas, sem acento, hífen no lugar de espaço.",
  ecc: "Correção de erro",
  eccOptions: { L: "L: 7% (código mais simples)", M: "M: 15% (recomendado)", Q: "Q: 25%", H: "H: 30% (aceita logo)" },
  size: "Tamanho (px)",
  sizeHint: "De 128 a 2048. É ajustado a um múltiplo inteiro do módulo.",
  margin: "Margem (módulos)",
  marginHint: "De 0 a 16. A norma pede pelo menos 4.",
  fg: "Cor dos módulos",
  bg: "Cor do fundo",
  colorsHint: "Módulos escuros sobre fundo claro, com contraste mínimo de 4:1.",
  result: "Seu QR Code",
  previewLabel: (url) => `QR Code que abre ${url}`,
  facts: (v, px, c) => `Versão ${v}, imagem de ${px} × ${px} px, contraste ${c}:1.`,
  payload: "Link gravado no código",
  downloadSvg: "Baixar SVG",
  downloadPng: "Baixar PNG",
  downloaded: "Arquivo baixado.",
  pngFailed: "Não foi possível gerar o PNG neste navegador. Baixe o SVG.",
  copy: "Copiar link",
  copied: "Link copiado",
  copyFailed: "Não foi possível copiar. Selecione o link e copie manualmente.",
  example: { url: "https://loja.com/cardapio", source: "mesa", medium: "qr", campaign: "cardapio-2026" },
  errors: {
    "empty-url": "Informe o link de destino.",
    "invalid-url": "Esse link não parece válido. Exemplo: https://loja.com/cardapio.",
    "unsupported-scheme": "Só aceitamos links http:// ou https://.",
    "url-too-long": "O link é longo demais para um QR Code legível.",
    "too-long": "O link é longo demais para um QR Code legível. Use um endereço mais curto.",
    "missing-source": "Informe a origem (utm_source).",
    "missing-medium": "Informe a mídia (utm_medium).",
    "missing-campaign": "Informe a campanha (utm_campaign).",
    "invalid-ecc": "Escolha um nível de correção de erro.",
    "invalid-size": "Use um tamanho inteiro entre 128 e 2048 px.",
    "invalid-margin": "Use uma margem inteira entre 0 e 16 módulos.",
    "invalid-color": "Escolha cores válidas.",
    "low-contrast": "Contraste baixo demais: o código não seria lido. Escureça os módulos ou clareie o fundo (mínimo 4:1).",
    "size-too-small": "O tamanho é pequeno demais para este link. Aumente o tamanho ou reduza a margem.",
  },
  warnings: {
    "scheme-assumed": "O link estava sem https://, então acrescentamos.",
    "margin-small": "Margem abaixo de 4 módulos: alguns leitores podem falhar.",
    inverted: "Módulos mais claros que o fundo: alguns leitores não leem código invertido.",
    "size-rounded": "O tamanho foi ajustado a um múltiplo inteiro do módulo para as bordas ficarem nítidas.",
  },
};

const en: QrStrings = {
  url: "Destination link",
  urlHint: "Final page, with https://. Short addresses make simpler, easier-to-scan codes.",
  addUtm: "Add UTM to the link",
  source: "Source (utm_source)",
  medium: "Medium (utm_medium)",
  campaign: "Campaign (utm_campaign)",
  utmHint: "Uses the house naming pattern: lowercase, no accents, hyphen instead of spaces.",
  ecc: "Error correction",
  eccOptions: { L: "L: 7% (simplest code)", M: "M: 15% (recommended)", Q: "Q: 25%", H: "H: 30% (allows a logo)" },
  size: "Size (px)",
  sizeHint: "From 128 to 2048. It is adjusted to a whole multiple of the module.",
  margin: "Margin (modules)",
  marginHint: "From 0 to 16. The standard asks for at least 4.",
  fg: "Module color",
  bg: "Background color",
  colorsHint: "Dark modules on a light background, with at least 4:1 contrast.",
  result: "Your QR code",
  previewLabel: (url) => `QR code that opens ${url}`,
  facts: (v, px, c) => `Version ${v}, ${px} × ${px} px image, contrast ${c}:1.`,
  payload: "Link stored in the code",
  downloadSvg: "Download SVG",
  downloadPng: "Download PNG",
  downloaded: "File downloaded.",
  pngFailed: "Could not generate the PNG in this browser. Download the SVG.",
  copy: "Copy link",
  copied: "Link copied",
  copyFailed: "Could not copy. Select the link and copy it manually.",
  example: { url: "https://shop.com/menu", source: "table", medium: "qr", campaign: "menu-2026" },
  errors: {
    "empty-url": "Enter the destination link.",
    "invalid-url": "That link does not look valid. Example: https://shop.com/menu.",
    "unsupported-scheme": "We only accept http:// or https:// links.",
    "url-too-long": "The link is too long for a readable QR code.",
    "too-long": "The link is too long for a readable QR code. Use a shorter address.",
    "missing-source": "Enter the source (utm_source).",
    "missing-medium": "Enter the medium (utm_medium).",
    "missing-campaign": "Enter the campaign (utm_campaign).",
    "invalid-ecc": "Choose an error correction level.",
    "invalid-size": "Use a whole size between 128 and 2048 px.",
    "invalid-margin": "Use a whole margin between 0 and 16 modules.",
    "invalid-color": "Choose valid colors.",
    "low-contrast": "Contrast is too low: the code would not scan. Darken the modules or lighten the background (minimum 4:1).",
    "size-too-small": "The size is too small for this link. Increase the size or reduce the margin.",
  },
  warnings: {
    "scheme-assumed": "The link had no https://, so we added it.",
    "margin-small": "Margin below 4 modules: some readers may fail.",
    inverted: "Modules lighter than the background: some readers cannot scan inverted codes.",
    "size-rounded": "The size was adjusted to a whole multiple of the module so edges stay sharp.",
  },
};

const es: QrStrings = {
  url: "Enlace de destino",
  urlHint: "Página final, con https://. Las direcciones cortas generan códigos más simples y fáciles de leer.",
  addUtm: "Añadir UTM al enlace",
  source: "Origen (utm_source)",
  medium: "Medio (utm_medium)",
  campaign: "Campaña (utm_campaign)",
  utmHint: "Usa el patrón de nomenclatura de la casa: minúsculas, sin tildes, guion en lugar de espacios.",
  ecc: "Corrección de errores",
  eccOptions: { L: "L: 7% (código más simple)", M: "M: 15% (recomendado)", Q: "Q: 25%", H: "H: 30% (admite logo)" },
  size: "Tamaño (px)",
  sizeHint: "De 128 a 2048. Se ajusta a un múltiplo entero del módulo.",
  margin: "Margen (módulos)",
  marginHint: "De 0 a 16. La norma pide al menos 4.",
  fg: "Color de los módulos",
  bg: "Color del fondo",
  colorsHint: "Módulos oscuros sobre fondo claro, con contraste mínimo de 4:1.",
  result: "Tu código QR",
  previewLabel: (url) => `Código QR que abre ${url}`,
  facts: (v, px, c) => `Versión ${v}, imagen de ${px} × ${px} px, contraste ${c}:1.`,
  payload: "Enlace grabado en el código",
  downloadSvg: "Descargar SVG",
  downloadPng: "Descargar PNG",
  downloaded: "Archivo descargado.",
  pngFailed: "No se pudo generar el PNG en este navegador. Descarga el SVG.",
  copy: "Copiar enlace",
  copied: "Enlace copiado",
  copyFailed: "No se pudo copiar. Selecciona el enlace y cópialo a mano.",
  example: { url: "https://tienda.com/carta", source: "mesa", medium: "qr", campaign: "carta-2026" },
  errors: {
    "empty-url": "Indica el enlace de destino.",
    "invalid-url": "Ese enlace no parece válido. Ejemplo: https://tienda.com/carta.",
    "unsupported-scheme": "Solo aceptamos enlaces http:// o https://.",
    "url-too-long": "El enlace es demasiado largo para un código QR legible.",
    "too-long": "El enlace es demasiado largo para un código QR legible. Usa una dirección más corta.",
    "missing-source": "Indica el origen (utm_source).",
    "missing-medium": "Indica el medio (utm_medium).",
    "missing-campaign": "Indica la campaña (utm_campaign).",
    "invalid-ecc": "Elige un nivel de corrección de errores.",
    "invalid-size": "Usa un tamaño entero entre 128 y 2048 px.",
    "invalid-margin": "Usa un margen entero entre 0 y 16 módulos.",
    "invalid-color": "Elige colores válidos.",
    "low-contrast": "Contraste demasiado bajo: el código no se leería. Oscurece los módulos o aclara el fondo (mínimo 4:1).",
    "size-too-small": "El tamaño es demasiado pequeño para este enlace. Aumenta el tamaño o reduce el margen.",
  },
  warnings: {
    "scheme-assumed": "El enlace no tenía https://, así que lo añadimos.",
    "margin-small": "Margen inferior a 4 módulos: algunos lectores pueden fallar.",
    inverted: "Módulos más claros que el fondo: algunos lectores no leen códigos invertidos.",
    "size-rounded": "El tamaño se ajustó a un múltiplo entero del módulo para que los bordes queden nítidos.",
  },
};

const ALL: Record<Lang, QrStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Gerador de QR Code no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): QrStrings {
  return ALL[lang];
}
