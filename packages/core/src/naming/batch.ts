import { type Result, fail, ok } from "../result";
import { buildName, isValidOrder } from "./build-name";
import {
  MAX_NAMES, type NameOutput, type NamingError, type NamingInput, type TextBlockKey,
} from "./types";

/** Erros do lote: os do nome mais "too-many" (passou de MAX_NAMES combinações). */
export type NamingBatchError = NamingError | "too-many";

/** Lote pronto: nomes únicos e contagens para avisos. */
export interface NameBatch {
  readonly items: readonly NameOutput[];
  /** Combinações que repetiram um nome já gerado (descartadas). */
  readonly duplicates: number;
  /** Quantos nomes passaram do tamanho de aviso. */
  readonly tooLong: number;
}

/**
 * Lê uma lista de valores colada (um por linha).
 *
 * Onde: caixas de lote da UI. Entrada: texto. Saída: linhas aparadas, sem
 * vazias e sem repetidas (mantém a primeira). Sem efeitos.
 */
export function parseValueList(text: string): string[] {
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const v = line.trim();
    if (v !== "") seen.add(v);
  }
  return [...seen];
}

/**
 * Gera todas as combinações das listas (produto cartesiano), na ordem dos blocos.
 *
 * O quê: para cada bloco de texto usa a lista, ou o valor único do campo
 * quando a lista está vazia. O primeiro bloco da ordem varia mais devagar.
 * Onde: botão "gerar lote". Entradas: NamingInput e listas por bloco.
 * Saída: Result com os nomes únicos, ou "too-many" ANTES de gerar se o produto
 * passar de MAX_NAMES. Nunca lança nem estoura.
 */
export function buildNameBatch(
  input: NamingInput,
  lists: Partial<Record<TextBlockKey, readonly string[]>>,
): Result<NameBatch, NamingBatchError> {
  if (!isValidOrder(input.order)) return fail("invalid-order");
  const slots: { key: TextBlockKey; values: readonly string[] }[] = [];
  let total = 1;
  for (const key of input.order) {
    if (key === "date") continue;
    const list = (lists[key] ?? []).filter((v) => v.trim() !== "");
    const values = list.length > 0 ? list : [input.values[key] ?? ""];
    total *= values.length;
    if (total > MAX_NAMES) return fail("too-many");
    slots.push({ key, values });
  }
  const items: NameOutput[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  let tooLong = 0;
  for (let i = 0; i < total; i += 1) {
    let rest = i;
    const values: Partial<Record<TextBlockKey, string>> = {};
    for (let s = slots.length - 1; s >= 0; s -= 1) {
      const slot = slots[s];
      if (!slot) continue;
      values[slot.key] = slot.values[rest % slot.values.length] ?? "";
      rest = Math.floor(rest / slot.values.length);
    }
    const r = buildName({ ...input, values });
    if (!r.ok) {
      if (r.error === "empty") continue;
      return fail(r.error);
    }
    if (seen.has(r.value.name)) { duplicates += 1; continue; }
    seen.add(r.value.name);
    if (r.value.warnings.length > 0) tooLong += 1;
    items.push(r.value);
  }
  if (items.length === 0) return fail("empty");
  return ok({ items, duplicates, tooLong });
}
