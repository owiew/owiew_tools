/** Entrada do cálculo de CPA máximo, LTV e LTV/CAC (dinheiro em centavos, margem em pontos-base). */
export interface CpaLtvInput {
  /** Ticket médio por compra, em centavos. */
  readonly ticketCents: number;
  /** Margem de contribuição, em pontos-base (4000 = 40%). */
  readonly marginBp: number;
  /** Compras por cliente no período de vida, em centésimos (250 = 2,5 compras). */
  readonly purchasesCentis: number;
  /** CAC atual em centavos; null quando não informado (sem comparação). */
  readonly cacCents: number | null;
  /** Razão alvo LTV/CAC em décimos (30 = 3,0). */
  readonly targetRatioTenths: number;
  /** Duração do período de vida em meses (opcional, base do payback em meses). */
  readonly lifetimeMonths: number | null;
  /** Meses de payback desejados (opcional; exige `lifetimeMonths`). */
  readonly paybackTargetMonths: number | null;
}

/** Faixa do LTV/CAC frente à convenção (1 e a razão alvo); "no-cac" quando o CAC é zero ou ausente. */
export type CpaLtvVerdict = "no-cac" | "loss" | "attention" | "healthy";

/** Saída do cálculo. Campos null quando a conta não existe (sem CAC, margem zero...). */
export interface CpaLtvResult {
  /** LTV por receita = ticket x compras. */
  readonly ltvRevenueCents: number;
  /** LTV de margem = ticket x margem x compras. */
  readonly ltvMarginCents: number;
  /** CPA máximo de equilíbrio na 1ª compra = ticket x margem. */
  readonly breakEvenCpaCents: number;
  /** CPA máximo para atingir a razão alvo = LTV de margem / razão. */
  readonly maxCpaTargetCents: number;
  /** LTV/CAC atual em centésimos (312 = 3,12), null sem CAC ou com CAC zero. */
  readonly ratioCentis: number | null;
  readonly verdict: CpaLtvVerdict;
  /** Lucro por cliente = LTV de margem - CAC (negativo é prejuízo), null sem CAC. */
  readonly profitPerCustomerCents: number | null;
  /** Compras para recuperar o CAC, em centésimos, null sem CAC ou margem por compra zero. */
  readonly paybackPurchasesCentis: number | null;
  /** True se o LTV de margem cobre o CAC dentro do período; null sem CAC. */
  readonly paysBackInPeriod: boolean | null;
  /** Meses para recuperar o CAC (margem distribuída por igual no período), em décimos de mês. */
  readonly paybackMonthsTenths: number | null;
  /** CPA máximo para pagar de volta no prazo desejado, null sem os meses informados. */
  readonly maxCpaPaybackCents: number | null;
}

/** Códigos de erro de validação do cálculo. */
export type CpaLtvError =
  | "invalid-amount"
  | "invalid-margin"
  | "invalid-purchases"
  | "invalid-ratio"
  | "invalid-months"
  | "overflow";
