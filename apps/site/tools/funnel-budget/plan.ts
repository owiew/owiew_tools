import { type AppLocale, type ParseNumberError, parseMoneyToCents, parsePercentToBp, parseScaled } from "@owiew/core";
import {
  type FunnelError, type FunnelInput, type FunnelMedia, type FunnelResult, type ScenarioRow, calcScenarios,
} from "@owiew/core/funnel";
import { type FunnelStrings } from "./strings";

/** Campos digitáveis do planejador. */
export type FieldId = "sales" | "leadRate" | "clickRate" | "cpc" | "ctr" | "cpm" | "ticket";

/** Texto cru de cada campo e o modo de custo escolhido. */
export interface RawFields {
  readonly mode: "cpc" | "ctr-cpm";
  readonly sales: string;
  readonly leadRate: string;
  readonly clickRate: string;
  readonly cpc: string;
  readonly ctr: string;
  readonly cpm: string;
  readonly ticket: string;
}

/** Saída do planejamento para a UI: erro por campo, resultado, cenários ou estouro. */
export interface Plan {
  readonly errors: Partial<Record<FieldId, string>>;
  /** Entrada já validada pelo parse (null se algum campo falhou). */
  readonly input: FunnelInput | null;
  readonly base: FunnelResult | null;
  readonly scenarios: readonly ScenarioRow[];
  readonly overflow: boolean;
}

/** Campo da tela que cada erro do core aponta. */
const FIELD_OF: Record<Exclude<FunnelError, "overflow">, FieldId> = {
  "invalid-sales": "sales",
  "zero-lead-rate": "leadRate",
  "invalid-lead-rate": "leadRate",
  "zero-click-rate": "clickRate",
  "invalid-click-rate": "clickRate",
  "zero-ctr": "ctr",
  "invalid-ctr": "ctr",
  "invalid-cpc": "cpc",
  "invalid-cpm": "cpm",
  "invalid-ticket": "ticket",
};

/**
 * Traduz o erro de parse de um campo no texto do idioma.
 *
 * Onde: etapa interna de `planFunnel`. Entradas: código do parser, campo e
 * textos. Saída: mensagem (vendas com decimais ganham texto próprio).
 */
function parseMessage(code: ParseNumberError, field: FieldId, s: FunnelStrings): string {
  if (field === "sales" && code === "too-many-decimals") return s.fieldErrors["sales-decimals"] ?? code;
  return s.fieldErrors[code] ?? code;
}

/**
 * Lê só os campos de custo do modo ativo (CPC, ou CTR + CPM).
 *
 * Onde: etapa interna de `readFields`. Entradas: campos, idioma e `take`
 * (parser que registra o erro do campo). Saída: mídia pronta ou null.
 */
function readMedia(
  raw: RawFields, locale: AppLocale,
  take: <T>(field: FieldId, r: { ok: true; value: T } | { ok: false; error: ParseNumberError }) => T | null,
): FunnelMedia | null {
  if (raw.mode === "cpc") {
    const cpc = take("cpc", parseMoneyToCents(raw.cpc, locale));
    return cpc === null ? null : { kind: "cpc", cpcCents: cpc };
  }
  const ctr = take("ctr", parsePercentToBp(raw.ctr, locale));
  const cpm = take("cpm", parseMoneyToCents(raw.cpm, locale));
  return ctr === null || cpm === null ? null : { kind: "ctr-cpm", ctrBp: ctr, cpmCents: cpm };
}

/**
 * Lê o texto cru dos campos, aplicando parsers do core e juntando os erros.
 *
 * Onde: etapa interna de `planFunnel`. Entradas: campos, idioma e textos.
 * Saída: entrada pronta para o core (ou null) e erros de parse por campo.
 * Só valida os campos do modo ativo; ticket vazio vale "sem receita".
 */
function readFields(
  raw: RawFields, locale: AppLocale, s: FunnelStrings,
): { input: FunnelInput | null; errors: Partial<Record<FieldId, string>> } {
  const errors: Partial<Record<FieldId, string>> = {};
  const take = <T,>(field: FieldId, r: { ok: true; value: T } | { ok: false; error: ParseNumberError }): T | null => {
    if (r.ok) return r.value;
    errors[field] = parseMessage(r.error, field, s);
    return null;
  };
  const sales = take("sales", parseScaled(raw.sales, locale, 0));
  const leadBp = take("leadRate", parsePercentToBp(raw.leadRate, locale));
  const clickBp = take("clickRate", parsePercentToBp(raw.clickRate, locale));
  const media = readMedia(raw, locale, take);
  const ticketEmpty = raw.ticket.trim() === "";
  const ticket = ticketEmpty ? null : take("ticket", parseMoneyToCents(raw.ticket, locale));
  const ticketBad = !ticketEmpty && ticket === null;
  if (sales === null || leadBp === null || clickBp === null || media === null || ticketBad) {
    return { input: null, errors };
  }
  return { input: { sales, leadToSaleBp: leadBp, clickToLeadBp: clickBp, media, ticketCents: ticket }, errors };
}

/**
 * Planeja o funil a partir do texto digitado.
 *
 * Onde: useMemo da ilha (Ui.tsx), a cada digitação. Fluxo: texto -> parsers ->
 * calcScenarios (core) -> erro mapeado ao campo, estouro ou cenários.
 * Entradas: campos crus, idioma e textos. Saída: Plan. Sem efeitos.
 */
export function planFunnel(raw: RawFields, locale: AppLocale, s: FunnelStrings): Plan {
  const { input, errors } = readFields(raw, locale, s);
  if (!input) return { errors, input: null, base: null, scenarios: [], overflow: false };
  const r = calcScenarios(input);
  if (!r.ok) {
    if (r.error === "overflow") return { errors, input, base: null, scenarios: [], overflow: true };
    return { errors: { [FIELD_OF[r.error]]: s.coreErrors[r.error] ?? r.error }, input, base: null, scenarios: [], overflow: false };
  }
  const baseRow = r.value.find((row) => row.scenario.id === "base");
  const base = baseRow && baseRow.result.ok ? baseRow.result.value : null;
  return { errors, input, base, scenarios: r.value, overflow: false };
}
