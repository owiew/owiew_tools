import { type Result, fail, ok } from "../result";

/** Erros de leitura de URL. */
export type ParseUrlError = "empty" | "too-long" | "invalid" | "unsupported-scheme";

/** URL lida, com a indicação de que o esquema foi presumido. */
export interface ParsedUrl {
  readonly url: URL;
  /** true quando o usuário digitou sem http(s):// e o core presumiu https. */
  readonly assumedScheme: boolean;
}

/** Limite de tamanho aceito (navegadores e servidores cortam acima disso). */
export const MAX_URL_LENGTH = 8192;

/** Esquemas sem "//" que precisam ser recusados explicitamente (não viram host). */
const OPAQUE_SCHEME = /^(javascript|data|vbscript|file|mailto|tel|sms|blob|about):/i;

/**
 * Lê um texto como URL http(s) sem nunca lançar exceção.
 *
 * O quê: tira espaços/quebras das pontas, presume https quando falta o esquema
 * e recusa esquemas perigosos (javascript:, data:, file:...).
 * Onde: gerador de UTM (URL base) e inspetor de URL.
 * Entrada: texto cru. Saída: Result com URL e flag de esquema presumido.
 */
export function parseHttpUrl(input: string): Result<ParsedUrl, ParseUrlError> {
  const text = input.trim();
  if (text === "") return fail("empty");
  if (text.length > MAX_URL_LENGTH) return fail("too-long");
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) || OPAQUE_SCHEME.test(text);
  const candidate = hasScheme ? text : `https://${text.replace(/^\/\//, "")}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return fail("invalid");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return fail("unsupported-scheme");
  if (url.hostname === "" || !isPlausibleHost(url.hostname)) return fail("invalid");
  return ok({ url, assumedScheme: !hasScheme });
}

/**
 * Confere se o host parece um domínio, IP ou localhost.
 *
 * Onde: etapa interna de `parseHttpUrl`, para "abc" ou "a b" não virarem URL.
 * Entrada: hostname já normalizado pelo URL. Saída: boolean.
 */
function isPlausibleHost(host: string): boolean {
  return host === "localhost" || host.includes(".") || host.startsWith("[");
}
