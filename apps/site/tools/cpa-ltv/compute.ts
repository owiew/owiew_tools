import { type AppLocale, type ParseNumberError, type Result, parseMoneyToCents, parsePercentToBp, parseScaled } from "@owiew/core";
import {
  type CpaLtvResult, MAX_MONTHS, MAX_PURCHASES_CENTIS, MAX_RATIO_TENTHS, cacFromBudget, calcCpaLtv,
} from "@owiew/core/cpa-ltv";
import { type CpaLtvStrings } from "./strings";

/** Texto cru de cada campo da ferramenta. */
export interface Fields {
  readonly ticket: string;
  readonly margin: string;
  readonly purchases: string;
  readonly mode: "cac" | "budget";
  readonly cac: string;
  readonly budget: string;
  readonly customers: string;
  readonly ratio: string;
  readonly lifetime: string;
  readonly payback: string;
}

/** Nomes dos campos que podem mostrar erro. */
export type FieldKey = "ticket" | "margin" | "purchases" | "cac" | "budget" | "customers" | "ratio" | "lifetime" | "payback";

/** Saída do pipeline: erros por campo, avisos e o resultado (null enquanto houver erro). */
export interface Computed {
  readonly errors: Readonly<Partial<Record<FieldKey, string>>>;
  readonly result: CpaLtvResult | null;
  readonly noCustomers: boolean;
}

/**
 * Traduz um parse numérico em valor ou mensagem de erro do campo.
 *
 * Onde: etapa interna de `compute`. Entradas: Result do parser, textos e um
 * limite opcional [min, max] com a mensagem de faixa. Saída: tupla [valor, erro].
 */
function pick(r: Result<number, ParseNumberError>, s: CpaLtvStrings, range?: [number, number, string]): [number | null, string | null] {
  if (!r.ok) return [null, s.fieldErrors[r.error] ?? r.error];
  if (range && (r.value < range[0] || r.value > range[1])) return [null, range[2]];
  return [r.value, null];
}

/**
 * Lê um campo opcional: vazio vira null sem erro.
 *
 * Onde: CAC, período de vida e payback. Entradas: texto, leitor e textos.
 * Saída: [valor ou null, erro ou null].
 */
function optional(text: string, read: (t: string) => [number | null, string | null]): [number | null, string | null] {
  return text.trim() === "" ? [null, null] : read(text);
}

/**
 * Converte os campos digitados em centavos, pontos-base e inteiros e calcula.
 *
 * O quê: parsers do core -> calcCpaLtv, juntando os erros por campo.
 * Onde: Ui.tsx, dentro de useMemo, a cada digitação. Entradas: campos, idioma,
 * textos. Saída: erros, resultado e aviso de zero clientes. Sem efeitos.
 */
export function compute(f: Fields, lang: AppLocale, s: CpaLtvStrings): Computed {
  const errors: Partial<Record<FieldKey, string>> = {};
  const set = (k: FieldKey, v: [number | null, string | null]): number | null => {
    if (v[1]) errors[k] = v[1];
    return v[0];
  };
  const ticket = set("ticket", pick(parseMoneyToCents(f.ticket, lang), s));
  const margin = set("margin", pick(parsePercentToBp(f.margin, lang), s, [0, 10_000, s.marginRange]));
  const purchases = set("purchases", pick(parseScaled(f.purchases, lang, 2), s, [0, MAX_PURCHASES_CENTIS, s.purchasesRange]));
  const ratio = set("ratio", pick(parseScaled(f.ratio, lang, 1), s, [1, MAX_RATIO_TENTHS, s.ratioRange]));
  const months = (t: string) => pick(parseScaled(t, lang, 0), s, [1, MAX_MONTHS, s.monthsRange]);
  const lifetime = set("lifetime", optional(f.lifetime, months));
  let payback = set("payback", optional(f.payback, months));
  if (payback !== null && lifetime === null && !errors.lifetime) {
    errors.payback = s.needLifetime;
    payback = null;
  }
  let cac: number | null = null;
  let noCustomers = false;
  if (f.mode === "cac") {
    cac = set("cac", optional(f.cac, (t) => pick(parseMoneyToCents(t, lang), s)));
  } else if (f.budget.trim() !== "" || f.customers.trim() !== "") {
    const budget = set("budget", pick(parseMoneyToCents(f.budget, lang), s));
    const customers = set("customers", pick(parseScaled(f.customers, lang, 0), s));
    if (budget !== null && customers !== null) {
      const r = cacFromBudget(budget, customers);
      if (r.ok) cac = r.value;
      else if (r.error === "no-customers") noCustomers = true;
      else errors.customers = s.fieldErrors["too-large"] ?? r.error;
    }
  }
  if (Object.keys(errors).length > 0 || ticket === null || margin === null || purchases === null || ratio === null) {
    return { errors, result: null, noCustomers };
  }
  const r = calcCpaLtv({
    ticketCents: ticket, marginBp: margin, purchasesCentis: purchases, cacCents: cac,
    targetRatioTenths: ratio, lifetimeMonths: lifetime, paybackTargetMonths: payback,
  });
  if (!r.ok) {
    return { errors: { ticket: s.fieldErrors["too-large"] ?? r.error }, result: null, noCustomers };
  }
  return { errors, result: r.value, noCustomers };
}
