import { type Result, fail, ok } from "../result";
import { parseHttpUrl } from "../url/parse-http-url";
import { type UtmError, buildUtmUrl } from "../utm/build-utm-url";
import { DEFAULT_RULES } from "../utm/rules";
import { type PhoneError, type PhoneWarning, parseWhatsappNumber } from "./phone";

/** UTM opcional do link de destino citado na mensagem. */
export interface WhatsappUtm {
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly term?: string;
  readonly content?: string;
}

/** Entrada do gerador: tudo texto cru vindo dos campos. */
export interface WhatsappInput {
  readonly countryCode: string;
  readonly phone: string;
  readonly message: string;
  /** Link que será citado na mensagem (opcional). */
  readonly destinationUrl?: string;
  readonly utm?: WhatsappUtm;
}

/** Erros que impedem o link. */
export type WhatsappError =
  | PhoneError
  | UtmError
  | "message-too-long"
  | "invalid-message"
  | "utm-without-url";

/** Avisos do link. */
export type WhatsappWarning = PhoneWarning | "url-long" | "scheme-assumed";

/** Resultado: link wa.me, texto final da mensagem e o link de destino já com UTM. */
export interface WhatsappLink {
  readonly link: string;
  readonly e164: string;
  /** Mensagem pré-preenchida exatamente como o contato vai ver. */
  readonly text: string;
  readonly destination: string | null;
  readonly warnings: readonly WhatsappWarning[];
}

/** Limite de caracteres da mensagem pré-preenchida (mantém o link utilizável). */
export const MAX_MESSAGE_CHARS = 1000;

/** Acima deste tamanho alguns apps e redes cortam o link: só avisamos. */
export const URL_WARN_LENGTH = 2000;

/**
 * Diz se o texto tem caractere de controle (tab e quebra de linha são permitidos).
 *
 * Onde: validação da mensagem em `buildWhatsappLink`. Entrada: texto. Saída: boolean.
 */
function hasControlChar(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if ((c < 32 && c !== 9 && c !== 10) || c === 127) return true;
  }
  return false;
}

/**
 * Monta o link `https://wa.me/<número>?text=<mensagem>` com encoding correto.
 *
 * O quê: valida o número (DDI), normaliza a mensagem (quebras CRLF viram LF,
 * controle e substituto solto são recusados), anexa em linha própria o link de
 * destino (com UTM do padrão da casa quando informada) e codifica o texto com
 * encodeURIComponent. Nunca usa encurtador: o link sai pronto e legível.
 * Onde: ilha do gerador de link de WhatsApp. Entrada: campos crus. Saída: Result.
 */
export function buildWhatsappLink(input: WhatsappInput): Result<WhatsappLink, WhatsappError> {
  const number = parseWhatsappNumber(input.countryCode, input.phone);
  if (!number.ok) return fail(number.error);
  const warnings: WhatsappWarning[] = [...number.value.warnings];

  const message = input.message.replace(/\r\n?/g, "\n").trim();
  if (hasControlChar(message)) return fail("invalid-message");
  if ([...message].length > MAX_MESSAGE_CHARS) return fail("message-too-long");

  const dest = destinationLink(input, warnings);
  if (!dest.ok) return fail(dest.error);

  const text = [message, dest.value].filter((part) => part !== "").join("\n");
  let encoded: string;
  try {
    encoded = encodeURIComponent(text);
  } catch {
    return fail("invalid-message");
  }
  const link = `https://wa.me/${number.value.digits}${text === "" ? "" : `?text=${encoded}`}`;
  if (link.length > URL_WARN_LENGTH) warnings.push("url-long");
  return ok({ link, e164: number.value.e164, text, destination: dest.value === "" ? null : dest.value, warnings });
}

/**
 * Resolve o link de destino citado na mensagem, com ou sem UTM.
 *
 * Onde: etapa interna de `buildWhatsappLink`. Entradas: campos e a lista de
 * avisos (recebe "scheme-assumed"). Saída: texto do link ("" se não há destino).
 */
function destinationLink(input: WhatsappInput, warnings: WhatsappWarning[]): Result<string, WhatsappError> {
  const url = (input.destinationUrl ?? "").trim();
  const utm = input.utm;
  const hasUtm = utm !== undefined && [utm.source, utm.medium, utm.campaign, utm.term ?? "", utm.content ?? ""].some((v) => v.trim() !== "");
  if (url === "") return hasUtm ? fail("utm-without-url") : ok("");
  if (!hasUtm) {
    const parsed = parseHttpUrl(url);
    if (!parsed.ok) return fail(parsed.error === "empty" ? "empty-url" : parsed.error === "too-long" ? "url-too-long" : parsed.error === "invalid" ? "invalid-url" : "unsupported-scheme");
    if (parsed.value.assumedScheme) warnings.push("scheme-assumed");
    return ok(parsed.value.url.href);
  }
  const built = buildUtmUrl(url, utm, DEFAULT_RULES);
  if (!built.ok) return fail(built.error);
  if (built.value.warnings.some((w) => w.code === "scheme-assumed")) warnings.push("scheme-assumed");
  return ok(built.value.url);
}
