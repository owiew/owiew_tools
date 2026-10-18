import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Gerador de link de WhatsApp. */
export interface WhatsappStrings {
  readonly countryCode: string;
  readonly countryCodeHint: string;
  readonly phone: string;
  readonly phoneHint: string;
  readonly message: string;
  readonly messageHint: string;
  readonly charCount: (n: number, max: number) => string;
  readonly url: string;
  readonly urlHint: string;
  readonly addUtm: string;
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly utmHint: string;
  readonly result: string;
  readonly linkLabel: string;
  readonly preview: string;
  readonly previewEmpty: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly test: string;
  readonly testHint: string;
  readonly example: {
    readonly phone: string; readonly message: string; readonly url: string;
    readonly source: string; readonly medium: string; readonly campaign: string;
  };
  readonly errors: Record<string, string>;
  readonly warnings: Record<string, string>;
}

const pt: WhatsappStrings = {
  countryCode: "Código do país (DDI)",
  countryCodeHint: "Só números, sem o +. Brasil é 55.",
  phone: "Número com DDD",
  phoneHint: "Pode usar parênteses, espaço e hífen. Se colar com +, o DDI ao lado é ignorado.",
  message: "Mensagem inicial (opcional)",
  messageHint: "Aparece pronta na caixa de conversa. Até 1.000 caracteres.",
  charCount: (n, max) => `${n} de ${max} caracteres`,
  url: "Link para citar na mensagem (opcional)",
  urlHint: "Página de destino. Vai numa linha própria, depois do texto.",
  addUtm: "Adicionar UTM ao link citado",
  source: "Origem (utm_source)",
  medium: "Mídia (utm_medium)",
  campaign: "Campanha (utm_campaign)",
  utmHint: "Usa o padrão de nomenclatura da casa: minúsculas, sem acento, hífen no lugar de espaço.",
  result: "Seu link de WhatsApp",
  linkLabel: "Link pronto para copiar",
  preview: "Mensagem que a pessoa vai ver",
  previewEmpty: "Sem mensagem: o link só abre a conversa.",
  copy: "Copiar link",
  copied: "Link copiado",
  copyFailed: "Não foi possível copiar. Selecione o link e copie manualmente.",
  test: "Testar no WhatsApp",
  testHint: "abre em nova aba",
  example: {
    phone: "(11) 91234-5678", message: "Olá! Vim pelo Instagram e quero saber mais.", url: "https://loja.com/oferta",
    source: "instagram", medium: "bio", campaign: "lancamento",
  },
  errors: {
    empty: "Informe o número de telefone.",
    "invalid-chars": "O número só pode ter dígitos, espaço, parênteses, hífen e um + no início.",
    "invalid-country-code": "Informe o código do país com 1 a 3 dígitos, sem zero na frente (Brasil: 55).",
    "too-short": "O número está curto demais. Confira DDI e DDD.",
    "too-long": "O número está longo demais: o máximo internacional é 15 dígitos com o DDI.",
    "message-too-long": "A mensagem passa de 1.000 caracteres. Encurte o texto.",
    "invalid-message": "A mensagem tem caracteres inválidos (de controle ou emoji quebrado).",
    "utm-without-url": "Informe o link a citar para anexar a UTM, ou limpe os campos de UTM.",
    "empty-url": "Informe o link de destino.",
    "invalid-url": "Esse link não parece válido. Exemplo: https://loja.com/oferta.",
    "unsupported-scheme": "Só aceitamos links http:// ou https://.",
    "url-too-long": "O link de destino é longo demais.",
    "missing-source": "Informe a origem (utm_source).",
    "missing-medium": "Informe a mídia (utm_medium).",
    "missing-campaign": "Informe a campanha (utm_campaign).",
  },
  warnings: {
    "leading-zero-removed": "Removemos o zero à esquerda do número, como pede o WhatsApp. Confira se o resultado está certo.",
    "br-length": "Números do Brasil têm DDD + 8 ou 9 dígitos. Confira se não falta ou sobra algum.",
    "url-long": "O link passou de 2.000 caracteres e alguns apps podem cortá-lo. Encurte a mensagem.",
    "scheme-assumed": "O link citado estava sem https://, então acrescentamos.",
  },
};

const en: WhatsappStrings = {
  countryCode: "Country code",
  countryCodeHint: "Digits only, without the +. The US is 1.",
  phone: "Phone number",
  phoneHint: "Brackets, spaces and hyphens are fine. If you paste it with +, the country code next to it is ignored.",
  message: "First message (optional)",
  messageHint: "Appears ready in the chat box. Up to 1,000 characters.",
  charCount: (n, max) => `${n} of ${max} characters`,
  url: "Link to quote in the message (optional)",
  urlHint: "Destination page. It goes on its own line, after the text.",
  addUtm: "Add UTM to the quoted link",
  source: "Source (utm_source)",
  medium: "Medium (utm_medium)",
  campaign: "Campaign (utm_campaign)",
  utmHint: "Uses the house naming pattern: lowercase, no accents, hyphen instead of spaces.",
  result: "Your WhatsApp link",
  linkLabel: "Link ready to copy",
  preview: "Message the person will see",
  previewEmpty: "No message: the link only opens the chat.",
  copy: "Copy link",
  copied: "Link copied",
  copyFailed: "Could not copy. Select the link and copy it manually.",
  test: "Test on WhatsApp",
  testHint: "opens in a new tab",
  example: {
    phone: "415 555 0123", message: "Hi! I found you on Instagram and want to know more.", url: "https://shop.com/offer",
    source: "instagram", medium: "bio", campaign: "launch",
  },
  errors: {
    empty: "Enter the phone number.",
    "invalid-chars": "The number can only have digits, spaces, brackets, hyphens and a + at the start.",
    "invalid-country-code": "Enter a country code of 1 to 3 digits, with no leading zero (US: 1).",
    "too-short": "The number is too short. Check the country and area codes.",
    "too-long": "The number is too long: the international maximum is 15 digits including the country code.",
    "message-too-long": "The message is over 1,000 characters. Shorten the text.",
    "invalid-message": "The message has invalid characters (control characters or a broken emoji).",
    "utm-without-url": "Enter the link to quote to attach the UTM, or clear the UTM fields.",
    "empty-url": "Enter the destination link.",
    "invalid-url": "That link does not look valid. Example: https://shop.com/offer.",
    "unsupported-scheme": "We only accept http:// or https:// links.",
    "url-too-long": "The destination link is too long.",
    "missing-source": "Enter the source (utm_source).",
    "missing-medium": "Enter the medium (utm_medium).",
    "missing-campaign": "Enter the campaign (utm_campaign).",
  },
  warnings: {
    "leading-zero-removed": "We removed the leading zero from the number, as WhatsApp asks. Check that the result is right.",
    "br-length": "Brazilian numbers have an area code plus 8 or 9 digits. Check that none is missing or extra.",
    "url-long": "The link went over 2,000 characters and some apps may cut it. Shorten the message.",
    "scheme-assumed": "The quoted link had no https://, so we added it.",
  },
};

const es: WhatsappStrings = {
  countryCode: "Código de país",
  countryCodeHint: "Solo números, sin el +. España es 34.",
  phone: "Número de teléfono",
  phoneHint: "Puedes usar paréntesis, espacios y guiones. Si lo pegas con +, el código de al lado se ignora.",
  message: "Mensaje inicial (opcional)",
  messageHint: "Aparece listo en la caja del chat. Hasta 1.000 caracteres.",
  charCount: (n, max) => `${n} de ${max} caracteres`,
  url: "Enlace para citar en el mensaje (opcional)",
  urlHint: "Página de destino. Va en una línea propia, después del texto.",
  addUtm: "Añadir UTM al enlace citado",
  source: "Origen (utm_source)",
  medium: "Medio (utm_medium)",
  campaign: "Campaña (utm_campaign)",
  utmHint: "Usa el patrón de nomenclatura de la casa: minúsculas, sin tildes, guion en lugar de espacios.",
  result: "Tu enlace de WhatsApp",
  linkLabel: "Enlace listo para copiar",
  preview: "Mensaje que verá la persona",
  previewEmpty: "Sin mensaje: el enlace solo abre el chat.",
  copy: "Copiar enlace",
  copied: "Enlace copiado",
  copyFailed: "No se pudo copiar. Selecciona el enlace y cópialo a mano.",
  test: "Probar en WhatsApp",
  testHint: "se abre en una pestaña nueva",
  example: {
    phone: "612 34 56 78", message: "¡Hola! Vengo de Instagram y quiero saber más.", url: "https://tienda.com/oferta",
    source: "instagram", medium: "bio", campaign: "lanzamiento",
  },
  errors: {
    empty: "Indica el número de teléfono.",
    "invalid-chars": "El número solo puede tener dígitos, espacios, paréntesis, guiones y un + al inicio.",
    "invalid-country-code": "Indica un código de país de 1 a 3 dígitos, sin cero delante (España: 34).",
    "too-short": "El número es demasiado corto. Revisa el código de país y el prefijo.",
    "too-long": "El número es demasiado largo: el máximo internacional es de 15 dígitos con el código de país.",
    "message-too-long": "El mensaje supera los 1.000 caracteres. Acorta el texto.",
    "invalid-message": "El mensaje tiene caracteres no válidos (de control o un emoji roto).",
    "utm-without-url": "Indica el enlace a citar para adjuntar la UTM, o borra los campos de UTM.",
    "empty-url": "Indica el enlace de destino.",
    "invalid-url": "Ese enlace no parece válido. Ejemplo: https://tienda.com/oferta.",
    "unsupported-scheme": "Solo aceptamos enlaces http:// o https://.",
    "url-too-long": "El enlace de destino es demasiado largo.",
    "missing-source": "Indica el origen (utm_source).",
    "missing-medium": "Indica el medio (utm_medium).",
    "missing-campaign": "Indica la campaña (utm_campaign).",
  },
  warnings: {
    "leading-zero-removed": "Quitamos el cero inicial del número, como pide WhatsApp. Comprueba que el resultado es correcto.",
    "br-length": "Los números de Brasil tienen prefijo más 8 o 9 dígitos. Comprueba que no falte ni sobre ninguno.",
    "url-long": "El enlace superó los 2.000 caracteres y algunas apps pueden cortarlo. Acorta el mensaje.",
    "scheme-assumed": "El enlace citado no tenía https://, así que lo añadimos.",
  },
};

const ALL: Record<Lang, WhatsappStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Gerador de link de WhatsApp no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): WhatsappStrings {
  return ALL[lang];
}

/** DDI inicial por idioma (Brasil, Estados Unidos, Espanha). */
export const DEFAULT_CODE: Record<Lang, string> = { "pt-br": "55", en: "1", es: "34" };
