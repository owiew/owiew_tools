import { type Result, fail, ok } from "../result";

/** Erros de validação do número de WhatsApp. */
export type PhoneError =
  | "empty"
  | "invalid-chars"
  | "invalid-country-code"
  | "too-short"
  | "too-long";

/** Avisos que não impedem o link. */
export type PhoneWarning = "leading-zero-removed" | "br-length";

/** Número validado em formato internacional. */
export interface WhatsappNumber {
  /** Só dígitos, DDI + número nacional (é o que o wa.me espera). */
  readonly digits: string;
  /** Mesmo número com "+" na frente, para exibir. */
  readonly e164: string;
  readonly warnings: readonly PhoneWarning[];
}

/** Menor e maior quantidade de dígitos de um número internacional (E.164 limita em 15). */
const MIN_DIGITS = 8;
const MAX_DIGITS = 15;

/**
 * Tira os enfeites de formatação que as pessoas digitam num telefone.
 *
 * Onde: etapa interna de `parseWhatsappNumber`. Entrada: texto cru. Saída: texto
 * sem espaços (\s cobre NBSP), parênteses, hífens e pontos.
 */
function stripFormatting(text: string): string {
  return text.replace(/[\s().\-‐-–]/g, "");
}

/**
 * Valida DDI e telefone e devolve o número no formato que o wa.me aceita.
 *
 * O quê: aceita o número nacional com DDI à parte ("55" + "(11) 91234-5678") ou o
 * número inteiro já internacional ("+55 11 91234-5678" ou "0055..."), caso em que
 * o DDI informado é ignorado. Zeros à esquerda do número nacional são removidos
 * (a documentação do wa.me pede para omiti-los) com aviso.
 * Onde: gerador de link de WhatsApp, a cada digitação. Entradas: DDI e telefone
 * crus. Saída: Result com os dígitos ou código de erro estável. Sem efeitos.
 */
export function parseWhatsappNumber(countryCode: string, phone: string): Result<WhatsappNumber, PhoneError> {
  const rawPhone = stripFormatting(phone);
  if (rawPhone === "") return fail("empty");
  const international = rawPhone.startsWith("+") || rawPhone.startsWith("00");
  const warnings: PhoneWarning[] = [];
  let digits: string;
  if (international) {
    digits = rawPhone.replace(/^(\+|00)/, "");
    if (!/^\d+$/.test(digits)) return fail("invalid-chars");
    if (digits.startsWith("0")) return fail("invalid-country-code");
  } else {
    if (!/^\d+$/.test(rawPhone)) return fail("invalid-chars");
    const ddi = stripFormatting(countryCode).replace(/^\+/, "");
    if (!/^[1-9]\d{0,2}$/.test(ddi)) return fail("invalid-country-code");
    const national = rawPhone.replace(/^0+/, "");
    if (national !== rawPhone) warnings.push("leading-zero-removed");
    if (national === "") return fail("empty");
    digits = ddi + national;
  }
  if (digits.length < MIN_DIGITS) return fail("too-short");
  if (digits.length > MAX_DIGITS) return fail("too-long");
  if (digits.startsWith("55") && ![12, 13].includes(digits.length)) warnings.push("br-length");
  return ok({ digits, e164: `+${digits}`, warnings });
}
