import { type Result, fail, ok } from "../result";
import { type MatchType, formatKeyword, MATCH_TYPES } from "./match-type";
import { type NormalizeOptions, limitViolation, normalizeTerm } from "./normalize";

/** Um resultado do combinador: termo puro, tipo e texto formatado. */
export interface CombinedKeyword {
  readonly keyword: string;
  readonly type: MatchType;
  readonly text: string;
}

/** Entrada do combinador. */
export interface CombineInput {
  /** De 1 a 3 listas (A, B, C); listas vazias são ignoradas. */
  readonly lists: readonly (readonly string[])[];
  readonly matchTypes: readonly MatchType[];
  /** Máximo de linhas na saída (1 a 100000). */
  readonly limit: number;
  /** Texto entre os blocos da combinação (padrão: um espaço). */
  readonly separator?: string;
  readonly normalize?: NormalizeOptions;
}

/** Saída: itens (até o limite), total real e avisos. */
export interface CombineResult {
  readonly items: readonly CombinedKeyword[];
  /** Total que existiria sem o limite (combinações x tipos). */
  readonly total: number;
  readonly truncated: boolean;
  /** Quantas COMBINAÇÕES (não linhas) passam de 80 caracteres ou 10 palavras (o Google as rejeita). */
  readonly overLimit: number;
}

/** Códigos de erro estáveis. */
export type CombineError = "no-terms" | "no-match-type" | "invalid-limit" | "list-too-long" | "too-many-lists";

/** Teto de linhas por lista e de saída. */
export const MAX_LIST_LINES = 10_000;
export const MAX_OUTPUT = 100_000;

const DEFAULT_NORMALIZE: NormalizeOptions = { lowercase: true, stripAccents: false, stripSymbols: true };

/**
 * Normaliza e deduplica uma lista (ordem de entrada preservada).
 *
 * Onde: etapa interna de `combineKeywords`. Entradas: linhas e opções.
 * Saída: termos únicos e não vazios. Sem efeitos.
 */
function prepareList(lines: readonly string[], opts: NormalizeOptions): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const t = normalizeTerm(line, opts);
    if (t === "" || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Combina listas A x B x C em palavras-chave, nos tipos ampla, frase e exata.
 *
 * O quê: produto cartesiano na ordem A, B, C (A é o laço mais externo), com
 * cada combinação emitida em cada tipo escolhido. O total é calculado ANTES de
 * gerar; só se geram até `limit` linhas, para uma lista grande não travar o navegador.
 * Onde: ilha da ferramenta "Combinador de palavras-chave". Entrada: CombineInput.
 * Saída: Result com itens, total real, flag de corte e contagem fora do limite
 * do Google, ou código de erro. Sem efeitos.
 */
export function combineKeywords(input: CombineInput): Result<CombineResult, CombineError> {
  if (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > MAX_OUTPUT) return fail("invalid-limit");
  if (input.lists.length > 3) return fail("too-many-lists");
  const types = MATCH_TYPES.filter((t) => input.matchTypes.includes(t));
  if (types.length === 0) return fail("no-match-type");
  if (input.lists.some((l) => l.length > MAX_LIST_LINES)) return fail("list-too-long");
  const opts = input.normalize ?? DEFAULT_NORMALIZE;
  const sep = input.separator ?? " ";
  const lists = input.lists.map((l) => prepareList(l, opts)).filter((l) => l.length > 0);
  if (lists.length === 0) return fail("no-terms");

  const combos = lists.reduce((n, l) => n * l.length, 1);
  const total = combos * types.length;
  const items: CombinedKeyword[] = [];
  let overLimit = 0;
  const counters = lists.map(() => 0);
  for (let c = 0; c < combos && items.length < input.limit; c++) {
    const keyword = lists.map((l, i) => l[counters[i] ?? 0] ?? "").join(sep).replace(/\s+/gu, " ").trim();
    if (limitViolation(keyword) !== null) overLimit++;
    for (const type of types) {
      if (items.length >= input.limit) break;
      items.push({ keyword, type, text: formatKeyword(keyword, type) });
    }
    // Avança o "odômetro": o último bloco gira mais rápido.
    for (let i = lists.length - 1; i >= 0; i--) {
      counters[i] = (counters[i] ?? 0) + 1;
      if ((counters[i] ?? 0) < (lists[i]?.length ?? 1)) break;
      counters[i] = 0;
    }
  }
  return ok({ items, total, truncated: items.length < total, overLimit });
}
