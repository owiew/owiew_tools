import { type Result, fail, ok } from "../result";
import { type NormalizeOptions, limitViolation, normalizeTerm } from "./normalize";

/** Opções do limpador. */
export interface CleanOptions extends NormalizeOptions {
  /** "Tênis azul" e "azul tênis" contam como o mesmo termo (útil para correspondência exata). */
  readonly ignoreWordOrder: boolean;
  /** Remove o que o Google rejeita por tamanho (mais de 80 caracteres ou 10 palavras). */
  readonly removeOverLimit: boolean;
  readonly sort: "none" | "az";
}

/** Motivo pelo qual uma linha saiu da lista final. */
export type RemovedReason = "empty" | "duplicate" | "too-long" | "too-many-words";

/** Linha removida, com o texto original e o motivo. */
export interface RemovedLine {
  readonly text: string;
  readonly reason: RemovedReason;
}

/** Resultado da limpeza. */
export interface CleanResult {
  readonly kept: readonly string[];
  readonly removed: readonly RemovedLine[];
  readonly stats: { readonly input: number; readonly kept: number; readonly duplicates: number; readonly empty: number; readonly overLimit: number };
}

/** Código de erro: entrada grande demais para o navegador processar com folga. */
export type CleanError = "too-many-lines";

/** Teto de linhas aceitas. */
export const MAX_CLEAN_LINES = 100_000;

/** Separadores de item: quebra de linha, vírgula, ponto e vírgula e tabulação. */
const SPLIT = /\r\n|\r|\n|,|;|\t/u;

/**
 * Chave de comparação para duplicados (minúscula e, opcionalmente, palavras ordenadas).
 *
 * Onde: etapa interna de `cleanKeywords`. Entradas: termo já normalizado e flag
 * de ordem. Saída: chave. Acento só unifica se o usuário pediu para removê-lo
 * (aí o termo já chega sem acento); caso contrário "tênis" e "tenis" são itens distintos.
 */
function dedupeKey(term: string, ignoreOrder: boolean): string {
  const base = term.toLowerCase();
  return ignoreOrder ? base.split(" ").sort().join(" ") : base;
}

/**
 * Limpa uma lista de palavras-chave colada pelo usuário.
 *
 * O quê: separa itens (linha, vírgula, ponto e vírgula, tab), normaliza,
 * descarta vazios, remove duplicados (primeira ocorrência vence) e, se pedido,
 * itens fora do limite de tamanho do Google, e ordena.
 * Onde: ilha da ferramenta "Limpador de palavras-chave" (aba limpar).
 * Entrada: texto cru e opções. Saída: Result com mantidas, removidas (com
 * motivo) e estatísticas, ou erro se passar de 100000 itens. Sem efeitos.
 */
export function cleanKeywords(raw: string, opts: CleanOptions): Result<CleanResult, CleanError> {
  const lines = raw.split(SPLIT);
  if (lines.length > MAX_CLEAN_LINES) return fail("too-many-lines");
  const seen = new Set<string>();
  const kept: string[] = [];
  const removed: RemovedLine[] = [];
  for (const line of lines) {
    const term = normalizeTerm(line, opts);
    if (term === "") {
      if (line.trim() !== "") removed.push({ text: line.trim(), reason: "empty" });
      continue;
    }
    const violation = opts.removeOverLimit ? limitViolation(term) : null;
    if (violation) {
      removed.push({ text: term, reason: violation === "chars" ? "too-long" : "too-many-words" });
      continue;
    }
    const key = dedupeKey(term, opts.ignoreWordOrder);
    if (seen.has(key)) {
      removed.push({ text: term, reason: "duplicate" });
      continue;
    }
    seen.add(key);
    kept.push(term);
  }
  if (opts.sort === "az") kept.sort((a, b) => a.localeCompare(b, "en"));
  const count = (r: RemovedReason): number => removed.filter((x) => x.reason === r).length;
  return ok({
    kept, removed,
    stats: { input: lines.filter((l) => l.trim() !== "").length, kept: kept.length, duplicates: count("duplicate"), empty: count("empty"), overLimit: count("too-long") + count("too-many-words") },
  });
}
