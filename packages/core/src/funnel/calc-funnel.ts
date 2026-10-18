import { type Result, fail, ok } from "../result";
import { ceilDiv, roundDiv, toSafe } from "./big-math";

/** Modo de custo de mídia: CPC direto, ou CTR + CPM (passa por impressões). */
export type FunnelMedia =
  | { readonly kind: "cpc"; readonly cpcCents: number }
  | { readonly kind: "ctr-cpm"; readonly ctrBp: number; readonly cpmCents: number };

/** Entrada do planejador: vendas inteiras, taxas em pontos-base, dinheiro em centavos. */
export interface FunnelInput {
  /** Meta de vendas (inteiro >= 1). */
  readonly sales: number;
  /** Taxa lead -> venda, em pontos-base (500 = 5%). */
  readonly leadToSaleBp: number;
  /** Taxa clique -> lead (conversão da página), em pontos-base. */
  readonly clickToLeadBp: number;
  readonly media: FunnelMedia;
  /** Ticket médio em centavos; null = sem projeção de receita. */
  readonly ticketCents: number | null;
}

/** Saída do planejador. Quantidades sempre arredondadas para cima. */
export interface FunnelResult {
  readonly sales: number;
  readonly leads: number;
  readonly clicks: number;
  /** Só no modo CTR + CPM. */
  readonly impressions: number | null;
  readonly budgetCents: number;
  /** Custo por lead = verba / leads. */
  readonly cplCents: number;
  /** CPA implícito = verba / vendas. */
  readonly cpaCents: number;
  readonly revenueCents: number | null;
  /** Receita projetada / verba (null sem ticket ou com verba zero). */
  readonly roas: number | null;
}

/** Códigos de erro estáveis (a UI traduz e liga cada um ao seu campo). */
export type FunnelError =
  | "invalid-sales"
  | "zero-lead-rate"
  | "invalid-lead-rate"
  | "zero-click-rate"
  | "invalid-click-rate"
  | "zero-ctr"
  | "invalid-ctr"
  | "invalid-cpc"
  | "invalid-cpm"
  | "invalid-ticket"
  | "overflow";

const isNonNegInt = (v: number): boolean => Number.isSafeInteger(v) && v >= 0;

/**
 * Valida uma taxa em pontos-base: 1..10000 (zero e acima de 100% são erro).
 *
 * Onde: etapa interna de `validate`. Entradas: valor e os dois códigos de erro
 * (zero e fora de faixa). Saída: código de erro ou null se válida.
 */
function rateError(bp: number, zero: FunnelError, bad: FunnelError): FunnelError | null {
  if (!Number.isSafeInteger(bp) || bp < 0 || bp > 10_000) return bad;
  return bp === 0 ? zero : null;
}

/**
 * Valida todos os campos de entrada, na ordem em que aparecem na tela.
 *
 * Onde: início de `calcFunnel`. Entrada: FunnelInput. Saída: primeiro código
 * de erro ou null. Sem efeitos (nunca lança, mesmo com NaN/Infinity).
 */
function validate(i: FunnelInput): FunnelError | null {
  if (!Number.isSafeInteger(i.sales) || i.sales < 1) return "invalid-sales";
  const lead = rateError(i.leadToSaleBp, "zero-lead-rate", "invalid-lead-rate");
  if (lead) return lead;
  const click = rateError(i.clickToLeadBp, "zero-click-rate", "invalid-click-rate");
  if (click) return click;
  if (i.media.kind === "cpc") {
    if (!isNonNegInt(i.media.cpcCents)) return "invalid-cpc";
  } else {
    const ctr = rateError(i.media.ctrBp, "zero-ctr", "invalid-ctr");
    if (ctr) return ctr;
    if (!isNonNegInt(i.media.cpmCents)) return "invalid-cpm";
  }
  if (i.ticketCents !== null && !isNonNegInt(i.ticketCents)) return "invalid-ticket";
  return null;
}

/**
 * Planeja o funil de trás para frente: vendas -> leads -> cliques -> verba.
 *
 * O quê: cada etapa é ceil(etapa seguinte / taxa), em BigInt, então "233,33
 * leads" vira 234. Verba = cliques x CPC, ou impressões x CPM / 1000 no modo
 * CTR + CPM. Resultado fora de inteiro seguro vira erro "overflow".
 * Onde: ilha do Planejador de verba por funil (apps/site) e `calcScenarios`.
 * Entrada: FunnelInput. Saída: Result com FunnelResult ou código de erro. Sem
 * efeitos. Fluxo: campos -> parsers -> aqui -> formatadores.
 */
export function calcFunnel(input: FunnelInput): Result<FunnelResult, FunnelError> {
  const invalid = validate(input);
  if (invalid) return fail(invalid);
  const sales = BigInt(input.sales);
  const leads = ceilDiv(sales * 10_000n, BigInt(input.leadToSaleBp));
  const clicks = ceilDiv(leads * 10_000n, BigInt(input.clickToLeadBp));
  const { media } = input;
  const impressions = media.kind === "ctr-cpm" ? ceilDiv(clicks * 10_000n, BigInt(media.ctrBp)) : null;
  const budget =
    media.kind === "cpc"
      ? clicks * BigInt(media.cpcCents)
      : roundDiv((impressions ?? 0n) * BigInt(media.cpmCents), 1000n);
  const revenue = input.ticketCents === null ? null : sales * BigInt(input.ticketCents);

  const safe = {
    leads: toSafe(leads),
    clicks: toSafe(clicks),
    impressions: impressions === null ? null : toSafe(impressions),
    budget: toSafe(budget),
    cpl: toSafe(roundDiv(budget, leads)),
    cpa: toSafe(roundDiv(budget, sales)),
    revenue: revenue === null ? null : toSafe(revenue),
  };
  const bad =
    safe.leads === null || safe.clicks === null || safe.budget === null || safe.cpl === null ||
    safe.cpa === null || (impressions !== null && safe.impressions === null) ||
    (revenue !== null && safe.revenue === null);
  if (bad || safe.leads === null || safe.clicks === null || safe.budget === null || safe.cpl === null || safe.cpa === null) {
    return fail("overflow");
  }
  return ok({
    sales: input.sales,
    leads: safe.leads,
    clicks: safe.clicks,
    impressions: safe.impressions,
    budgetCents: safe.budget,
    cplCents: safe.cpl,
    cpaCents: safe.cpa,
    revenueCents: safe.revenue,
    roas: safe.revenue !== null && safe.budget > 0 ? safe.revenue / safe.budget : null,
  });
}
