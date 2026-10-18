import { type IssueCode } from "@owiew/core";
import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Inspetor de URL. */
export interface InspectorStrings {
  readonly label: string;
  readonly hint: string;
  readonly empty: string;
  readonly errors: Record<string, string>;
  readonly summary: string;
  readonly protocol: string;
  readonly host: string;
  readonly port: string;
  readonly path: string;
  readonly fragment: string;
  readonly none: string;
  readonly params: string;
  readonly noParams: string;
  readonly colName: string;
  readonly colValue: string;
  readonly colType: string;
  readonly types: { readonly utm: string; readonly click: string; readonly other: string };
  readonly issues: string;
  readonly noIssues: string;
  readonly severity: { readonly error: string; readonly warning: string; readonly info: string };
  readonly issueText: Record<IssueCode, (param: string) => string>;
  readonly codec: string;
  readonly codecLabel: string;
  readonly encoded: string;
  readonly decoded: string;
  readonly decodeFailed: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly clickNote: Record<string, string>;
}

const pt: InspectorStrings = {
  label: "URL para inspecionar",
  hint: "Cole o link completo, com ou sem https://.",
  empty: "Cole uma URL para ver os parâmetros e os alertas.",
  errors: {
    empty: "Cole uma URL para começar.",
    invalid: "Isso não parece uma URL válida. Confira o endereço.",
    "unsupported-scheme": "Só inspecionamos links http:// ou https://.",
    "too-long": "A URL é longa demais para inspecionar.",
  },
  summary: "Estrutura do link",
  protocol: "Protocolo",
  host: "Domínio",
  port: "Porta",
  path: "Caminho",
  fragment: "Fragmento (#)",
  none: "nenhum",
  params: "Parâmetros",
  noParams: "Esta URL não tem parâmetros depois do ?.",
  colName: "Nome",
  colValue: "Valor decodificado",
  colType: "Tipo",
  types: { utm: "UTM", click: "ID de clique", other: "Outro" },
  issues: "Alertas",
  noIssues: "Nenhum problema encontrado nas UTM.",
  severity: { error: "Erro", warning: "Atenção", info: "Informação" },
  issueText: {
    "scheme-assumed": () => "A URL estava sem https://; consideramos https para analisar.",
    "credentials-in-url": () => "A URL contém usuário e senha. Nunca publique um link assim.",
    "utm-conflict": (p) => `${p} aparece mais de uma vez com valores diferentes. Cada ferramenta pode ler um valor distinto.`,
    "utm-duplicate": (p) => `${p} aparece repetido com o mesmo valor. Deixe só uma ocorrência.`,
    "duplicate-param": (p) => `O parâmetro ${p} aparece mais de uma vez.`,
    "utm-uppercase": (p) => `O valor de ${p} tem letra maiúscula. O GA4 trata Google e google como valores diferentes.`,
    "utm-key-case": (p) => `O nome do parâmetro não está em minúsculas. O correto é ${p}.`,
    "utm-whitespace": (p) => `O valor de ${p} tem espaço. Prefira hífen ou sublinhado.`,
    "utm-empty": (p) => `${p} está vazio e não ajuda em nenhum relatório.`,
    "utm-unknown-key": (p) => `${p} não é um parâmetro UTM padrão. Confirme se é intencional.`,
    "utm-missing-required": (p) => `A URL usa UTM, mas falta ${p}.`,
    "utm-in-fragment": () => "Há UTM depois do #. O navegador não envia o fragmento ao servidor, então ele não será contabilizado.",
    "malformed-encoding": (p) => `O parâmetro ${p} tem codificação % inválida; mostramos o texto original.`,
    "double-encoded": (p) => `O valor de ${p} parece codificado duas vezes (aparece %25).`,
    "multiple-click-ids": () => "Há mais de um identificador de clique. Isso é comum ao passar por redirecionamentos, mas confira.",
  },
  codec: "Codificar e decodificar",
  codecLabel: "Texto ou trecho de URL",
  encoded: "Codificado (percent-encoding)",
  decoded: "Decodificado",
  decodeFailed: "Não foi possível decodificar: há um % inválido.",
  copy: "Copiar",
  copied: "Copiado",
  copyFailed: "Não foi possível copiar. Selecione e copie manualmente.",
  clickNote: {
    click: "Identifica o clique no anúncio.",
    "ios-web-to-app": "Clique de web para app em iOS (Google Ads).",
    "web-to-app": "Clique de web para app (Google Ads).",
    "campaign-manager": "Clique em campanha do Campaign Manager ou DV360.",
  },
};

const en: InspectorStrings = {
  label: "URL to inspect",
  hint: "Paste the full link, with or without https://.",
  empty: "Paste a URL to see its parameters and warnings.",
  errors: {
    empty: "Paste a URL to get started.",
    invalid: "That does not look like a valid URL. Check the address.",
    "unsupported-scheme": "We only inspect http:// or https:// links.",
    "too-long": "The URL is too long to inspect.",
  },
  summary: "Link structure",
  protocol: "Protocol",
  host: "Domain",
  port: "Port",
  path: "Path",
  fragment: "Fragment (#)",
  none: "none",
  params: "Parameters",
  noParams: "This URL has no parameters after the ?.",
  colName: "Name",
  colValue: "Decoded value",
  colType: "Type",
  types: { utm: "UTM", click: "Click ID", other: "Other" },
  issues: "Warnings",
  noIssues: "No problems found in the UTMs.",
  severity: { error: "Error", warning: "Warning", info: "Info" },
  issueText: {
    "scheme-assumed": () => "The URL had no https://; we assumed https to analyze it.",
    "credentials-in-url": () => "The URL contains a username and password. Never publish a link like this.",
    "utm-conflict": (p) => `${p} appears more than once with different values. Each tool may read a different one.`,
    "utm-duplicate": (p) => `${p} is repeated with the same value. Keep a single occurrence.`,
    "duplicate-param": (p) => `The ${p} parameter appears more than once.`,
    "utm-uppercase": (p) => `The value of ${p} has uppercase letters. GA4 treats Google and google as different values.`,
    "utm-key-case": (p) => `The parameter name is not lowercase. The correct name is ${p}.`,
    "utm-whitespace": (p) => `The value of ${p} has a space. Prefer a hyphen or underscore.`,
    "utm-empty": (p) => `${p} is empty and helps no report.`,
    "utm-unknown-key": (p) => `${p} is not a standard UTM parameter. Confirm it is intentional.`,
    "utm-missing-required": (p) => `The URL uses UTMs, but ${p} is missing.`,
    "utm-in-fragment": () => "There is a UTM after the #. Browsers do not send the fragment to the server, so it will not be counted.",
    "malformed-encoding": (p) => `The ${p} parameter has invalid % encoding; we show the original text.`,
    "double-encoded": (p) => `The value of ${p} looks encoded twice (it contains %25).`,
    "multiple-click-ids": () => "There is more than one click identifier. That is common after redirects, but double-check.",
  },
  codec: "Encode and decode",
  codecLabel: "Text or URL fragment",
  encoded: "Encoded (percent-encoding)",
  decoded: "Decoded",
  decodeFailed: "Could not decode: there is an invalid %.",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Could not copy. Select and copy manually.",
  clickNote: {
    click: "Identifies the ad click.",
    "ios-web-to-app": "Web-to-app click on iOS (Google Ads).",
    "web-to-app": "Web-to-app click (Google Ads).",
    "campaign-manager": "Click in a Campaign Manager or DV360 campaign.",
  },
};

const es: InspectorStrings = {
  label: "URL a inspeccionar",
  hint: "Pega el enlace completo, con o sin https://.",
  empty: "Pega una URL para ver sus parámetros y alertas.",
  errors: {
    empty: "Pega una URL para empezar.",
    invalid: "Eso no parece una URL válida. Revisa la dirección.",
    "unsupported-scheme": "Solo inspeccionamos enlaces http:// o https://.",
    "too-long": "La URL es demasiado larga para inspeccionar.",
  },
  summary: "Estructura del enlace",
  protocol: "Protocolo",
  host: "Dominio",
  port: "Puerto",
  path: "Ruta",
  fragment: "Fragmento (#)",
  none: "ninguno",
  params: "Parámetros",
  noParams: "Esta URL no tiene parámetros después del ?.",
  colName: "Nombre",
  colValue: "Valor decodificado",
  colType: "Tipo",
  types: { utm: "UTM", click: "ID de clic", other: "Otro" },
  issues: "Alertas",
  noIssues: "No se encontraron problemas en las UTM.",
  severity: { error: "Error", warning: "Atención", info: "Información" },
  issueText: {
    "scheme-assumed": () => "La URL no tenía https://; asumimos https para analizarla.",
    "credentials-in-url": () => "La URL contiene usuario y contraseña. Nunca publiques un enlace así.",
    "utm-conflict": (p) => `${p} aparece más de una vez con valores distintos. Cada herramienta puede leer uno diferente.`,
    "utm-duplicate": (p) => `${p} aparece repetido con el mismo valor. Deja una sola aparición.`,
    "duplicate-param": (p) => `El parámetro ${p} aparece más de una vez.`,
    "utm-uppercase": (p) => `El valor de ${p} tiene mayúsculas. GA4 trata Google y google como valores distintos.`,
    "utm-key-case": (p) => `El nombre del parámetro no está en minúsculas. Lo correcto es ${p}.`,
    "utm-whitespace": (p) => `El valor de ${p} tiene un espacio. Prefiere guion o guion bajo.`,
    "utm-empty": (p) => `${p} está vacío y no ayuda en ningún informe.`,
    "utm-unknown-key": (p) => `${p} no es un parámetro UTM estándar. Confirma que sea intencional.`,
    "utm-missing-required": (p) => `La URL usa UTM, pero falta ${p}.`,
    "utm-in-fragment": () => "Hay una UTM después del #. El navegador no envía el fragmento al servidor, así que no se contabilizará.",
    "malformed-encoding": (p) => `El parámetro ${p} tiene una codificación % inválida; mostramos el texto original.`,
    "double-encoded": (p) => `El valor de ${p} parece codificado dos veces (aparece %25).`,
    "multiple-click-ids": () => "Hay más de un identificador de clic. Es común tras redirecciones, pero revísalo.",
  },
  codec: "Codificar y decodificar",
  codecLabel: "Texto o fragmento de URL",
  encoded: "Codificado (percent-encoding)",
  decoded: "Decodificado",
  decodeFailed: "No se pudo decodificar: hay un % inválido.",
  copy: "Copiar",
  copied: "Copiado",
  copyFailed: "No se pudo copiar. Selecciona y copia manualmente.",
  clickNote: {
    click: "Identifica el clic en el anuncio.",
    "ios-web-to-app": "Clic de web a app en iOS (Google Ads).",
    "web-to-app": "Clic de web a app (Google Ads).",
    "campaign-manager": "Clic en una campaña de Campaign Manager o DV360.",
  },
};

const ALL: Record<Lang, InspectorStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Inspetor de URL no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): InspectorStrings {
  return ALL[lang];
}
