import {
  type AppLocale, type ParseNumberError, type RoasResult, calcRoas, defaultCurrency, formatBp,
  formatCents, formatNumber, parseMoneyToCents, parsePercentToBp,
} from "@owiew/core";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { type RoasStrings, strings } from "./strings";

const CURRENCIES = ["BRL", "USD", "EUR", "MXN", "GBP", "ARS", "COP", "CLP"] as const;

/**
 * Campo numérico com rótulo, dica e mensagem de erro ligada por aria.
 *
 * Onde: Ui.tsx (receita, investimento e margem). Entradas: id, rótulo, dica,
 * valor, erro e callback. Saída: bloco `.field` com aria-invalid quando há erro.
 */
function NumberField(p: { id: string; label: string; hint: string; value: string; error: string | null; onInput: (v: string) => void }) {
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <input id={p.id} type="text" inputMode="decimal" autocomplete="off" value={p.value} aria-invalid={p.error ? "true" : "false"} aria-describedby={`${p.id}-hint${p.error ? ` ${p.id}-err` : ""}`} onInput={(e) => p.onInput(e.currentTarget.value)} />
      <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>
      {p.error && <span class="field-error" id={`${p.id}-err`}>{p.error}</span>}
    </div>
  );
}

/**
 * Grade de resultados da calculadora (ROAS em destaque).
 *
 * Onde: Ui.tsx, quando as entradas são válidas. Entradas: resultado do core,
 * moeda, idioma e textos. Saída: lista de definição com os indicadores.
 */
function Results({ r, currency, locale, s }: { r: RoasResult; currency: string; locale: AppLocale; s: RoasStrings }) {
  const money = (c: number | null): string => (c === null ? s.notAvailable : formatCents(c, currency, locale));
  const ratio = (v: number | null): string => (v === null ? s.notAvailable : `${formatNumber(v, 2, locale)}x`);
  return (
    <dl class="stat-grid">
      <div class="stat is-hero"><dt>{s.roas}</dt><dd data-testid="roas">{ratio(r.roas)}</dd></div>
      <div class="stat"><dt>{s.breakEven}</dt><dd data-testid="breakeven">{ratio(r.breakEvenRoas)}</dd></div>
      <div class="stat"><dt>{s.contribution}</dt><dd data-testid="contribution">{money(r.contributionCents)}</dd></div>
      <div class="stat is-hero"><dt>{s.profit}</dt><dd data-testid="profit">{money(r.profitCents)}</dd></div>
      <div class="stat"><dt>{s.profitMargin}</dt><dd>{r.profitMarginBp === null ? s.notAvailable : formatBp(r.profitMarginBp, locale)}</dd></div>
      <div class="stat"><dt>{s.breakEvenRevenue}</dt><dd>{money(r.breakEvenRevenueCents)}</dd></div>
      <div class="stat"><dt>{s.maxSpend}</dt><dd>{money(r.maxSpendCents)}</dd></div>
    </dl>
  );
}

/**
 * Ilha da Calculadora de ROAS, ROAS de equilíbrio, margem e lucro.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: campos ->
 * parsers do core (centavos inteiros e pontos-base) -> calcRoas -> formatadores.
 * Valores de exemplo vêm preenchidos para a página já mostrar um resultado.
 */
export default function RoasCalculator({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [currency, setCurrency] = useState<string>(defaultCurrency(lang));
  const [revenue, setRevenue] = useState(s.example.revenue);
  const [spend, setSpend] = useState(s.example.spend);
  const [margin, setMargin] = useState(s.example.margin);

  const calc = useMemo(() => {
    const rev = parseMoneyToCents(revenue, lang);
    const sp = parseMoneyToCents(spend, lang);
    const mg = parsePercentToBp(margin, lang);
    const err = (e: ParseNumberError | undefined): string | null => (e ? (s.fieldErrors[e] ?? e) : null);
    const marginOut = mg.ok && mg.value > 10_000;
    const errors = {
      revenue: err(rev.ok ? undefined : rev.error),
      spend: err(sp.ok ? undefined : sp.error),
      margin: marginOut ? s.marginRange : err(mg.ok ? undefined : mg.error),
    };
    if (!rev.ok || !sp.ok || !mg.ok || marginOut) return { errors, result: null };
    const r = calcRoas({ revenueCents: rev.value, spendCents: sp.value, marginBp: mg.value });
    return { errors, result: r.ok ? r.value : null };
  }, [revenue, spend, margin, lang, s]);

  return (
    <div class="tool-ui">
      <div class="field">
        <label for="roas-currency">{s.currency}</label>
        <select id="roas-currency" value={currency} onChange={(e) => setCurrency(e.currentTarget.value)}>
          {CURRENCIES.map((c) => <option value={c}>{c}</option>)}
        </select>
      </div>
      <div class="row">
        <NumberField id="roas-revenue" label={s.revenue} hint={s.revenueHint} value={revenue} error={calc.errors.revenue} onInput={setRevenue} />
        <NumberField id="roas-spend" label={s.spend} hint={s.spendHint} value={spend} error={calc.errors.spend} onInput={setSpend} />
        <NumberField id="roas-margin" label={s.margin} hint={s.marginHint} value={margin} error={calc.errors.margin} onInput={setMargin} />
      </div>
      <section class="stack" aria-labelledby="roas-results" aria-live="polite">
        <h3 id="roas-results">{s.results}</h3>
        {calc.result ? (
          <>
            <Results r={calc.result} currency={currency} locale={lang} s={s} />
            <Notice kind={calc.result.verdict === "profit" ? "ok" : calc.result.verdict === "loss" ? "err" : "info"}>{s.verdict[calc.result.verdict]}</Notice>
          </>
        ) : (
          <Notice kind="warn">{s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
