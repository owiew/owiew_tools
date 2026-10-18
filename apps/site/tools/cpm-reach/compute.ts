import { type ParseNumberError, parseMoneyToCents, parsePercentToBp, parseScaled } from "@owiew/core";
import { type CpmReachError, type CpmReachInput, type CpmReachMode, type CpmReachResult, calcCpmReach } from "@owiew/core/cpm-reach";
import { type Lang } from "../../src/i18n/locales";
import { type CpmReachStrings } from "./strings";

/** Campos de texto da ferramenta, como o usuário digitou. */
export interface Fields {
  readonly mode: CpmReachMode;
  readonly spend: string;
  readonly cost: string;
  readonly cpm: string;
  readonly frequency: string;
  readonly impressions: string;
  readonly reach: string;
  readonly ctr: string;
}

/** Nome de cada campo que pode receber erro. */
export type FieldKey = Exclude<keyof Fields, "mode">;

/** Saída: erros por campo, resultado (ou null) e se o erro foi de estouro numérico. */
export interface Computed {
  readonly errors: Partial<Record<FieldKey, string>>;
  readonly result: CpmReachResult | null;
  readonly overflow: boolean;
}

/** Campos obrigatórios de cada modo. */
export const REQUIRED: Record<CpmReachMode, readonly FieldKey[]> = {
  impressions: ["spend", "cpm"],
  reach: ["spend", "cpm", "frequency"],
  cpm: ["cost", "impressions"],
  budget: ["reach", "frequency", "cpm"],
};

/**
 * Lê um campo obrigatório no formato certo (dinheiro, inteiro ou frequência).
 *
 * Onde: `compute`. Entradas: chave, texto e idioma. Saída: Result do parser
 * do core (centavos, inteiro ou centésimos).
 */
function parseField(key: FieldKey, text: string, lang: Lang): ReturnType<typeof parseScaled> {
  if (key === "impressions" || key === "reach") return parseScaled(text, lang, 0);
  if (key === "frequency") return parseScaled(text, lang, 2);
  return parseMoneyToCents(text, lang);
}

/**
 * Traduz um código de erro do core para o campo e a mensagem corretos.
 *
 * Onde: `compute`, quando `calcCpmReach` recusa uma entrada já lida.
 * Entrada: código e textos. Saída: campo + mensagem, ou null para estouro.
 */
function mapCoreError(code: CpmReachError, s: CpmReachStrings): [FieldKey, string] | null {
  if (code === "zero-cpm") return ["cpm", s.zeroCpm];
  if (code === "zero-impressions") return ["impressions", s.zeroImpressions];
  if (code === "zero-reach") return ["reach", s.zeroReach];
  if (code === "invalid-frequency") return ["frequency", s.lowFrequency];
  if (code === "invalid-ctr") return ["ctr", s.ctrRange];
  return null;
}

/**
 * Monta a entrada do core a partir dos números já lidos.
 *
 * Onde: `compute`. Entradas: modo, mapa campo->número e CTR opcional.
 * Saída: CpmReachInput da variante do modo.
 */
function buildInput(mode: CpmReachMode, n: Record<FieldKey, number>, ctrBp: number | undefined): CpmReachInput {
  const ctr = ctrBp === undefined ? {} : { ctrBp };
  if (mode === "impressions") return { mode, spendCents: n.spend, cpmCents: n.cpm, ...ctr };
  if (mode === "reach") return { mode, spendCents: n.spend, cpmCents: n.cpm, frequencyCenti: n.frequency, ...ctr };
  if (mode === "cpm") return { mode, spendCents: n.cost, impressions: n.impressions, ...ctr };
  return { mode, reach: n.reach, frequencyCenti: n.frequency, cpmCents: n.cpm, ...ctr };
}

/**
 * Lê os campos do modo ativo e calcula o resultado.
 *
 * O quê: parseia só os campos que o modo usa, junta os erros por campo e, se
 * tudo está legível, chama o core. Onde: Ui.tsx (useMemo). Entradas: campos,
 * idioma e textos. Saída: Computed. Fluxo: texto -> parsers -> calcCpmReach.
 */
export function compute(f: Fields, lang: Lang, s: CpmReachStrings): Computed {
  const errors: Partial<Record<FieldKey, string>> = {};
  const nums: Partial<Record<FieldKey, number>> = {};
  const msg = (e: ParseNumberError): string => s.fieldErrors[e] ?? e;
  for (const key of REQUIRED[f.mode]) {
    const r = parseField(key, f[key], lang);
    if (r.ok) nums[key] = r.value;
    else errors[key] = msg(r.error);
  }
  let ctrBp: number | undefined;
  if (f.ctr.trim() !== "") {
    const c = parsePercentToBp(f.ctr, lang);
    if (!c.ok) errors.ctr = msg(c.error);
    else if (c.value > 10_000) errors.ctr = s.ctrRange;
    else ctrBp = c.value;
  }
  if (Object.keys(errors).length > 0) return { errors, result: null, overflow: false };
  const out = calcCpmReach(buildInput(f.mode, nums as Record<FieldKey, number>, ctrBp));
  if (out.ok) return { errors, result: out.value, overflow: false };
  const mapped = mapCoreError(out.error, s);
  if (mapped) return { errors: { [mapped[0]]: mapped[1] }, result: null, overflow: false };
  return { errors, result: null, overflow: true };
}
