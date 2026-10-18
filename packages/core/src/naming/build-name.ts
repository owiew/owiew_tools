import { type Result, fail, ok } from "../result";
import { formatNamingDate } from "./format-date";
import { sanitizeBlock } from "./sanitize-block";
import {
  BLOCK_KEYS, MAX_BLOCK_INPUT, NAME_LENGTH_WARN, type BlockKey, type NamePart, type NameOutput,
  type NamingError, type NamingInput, type NamingWarning,
} from "./types";

/**
 * Confere se a ordem tem só blocos conhecidos e sem repetição.
 *
 * Onde: buildName e o lote. Entrada: ordem. Saída: boolean.
 */
export function isValidOrder(order: readonly BlockKey[]): boolean {
  return order.every((k) => BLOCK_KEYS.includes(k)) && new Set(order).size === order.length;
}

/**
 * Monta um nome de campanha a partir dos blocos.
 *
 * O quê: normaliza cada bloco na ordem pedida, ignora os vazios e junta com o
 * separador. O bloco de data passa pela mesma limpeza (hífens da data viram o
 * joiner do bloco). Onde: UI (nome único) e lote. Entrada: NamingInput.
 * Saída: Result com nome, partes e avisos, ou erro estável: "invalid-order",
 * "value-too-long" (bloco acima de MAX_BLOCK_INPUT), "empty" (nada sobrou).
 * Nunca lança. Sem relógio escondido: a data vem pronta.
 */
export function buildName(input: NamingInput): Result<NameOutput, NamingError> {
  if (!isValidOrder(input.order)) return fail("invalid-order");
  const parts: NamePart[] = [];
  for (const key of input.order) {
    let raw: string;
    if (key === "date") {
      raw = input.date ? formatNamingDate(input.date, input.dateFormat, input.locale) : "";
    } else {
      raw = input.values[key] ?? "";
      if ([...raw].length > MAX_BLOCK_INPUT) return fail("value-too-long");
    }
    const text = sanitizeBlock(raw, input.options);
    if (text !== "") parts.push({ key, text });
  }
  if (parts.length === 0) return fail("empty");
  const name = parts.map((p) => p.text).join(input.options.separator);
  const length = [...name].length;
  const warnings: NamingWarning[] = length > NAME_LENGTH_WARN ? ["too-long"] : [];
  return ok({ name, parts, length, warnings });
}
