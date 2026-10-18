import { type AppLocale, defaultCurrency, formatCents, formatNumber } from "@owiew/core";
import { type CpaLtvResult } from "@owiew/core/cpa-ltv";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { type Fields, compute } from "./compute";
import { type CpaLtvStrings, strings } from "./strings";

const CURRENCIES = ["BRL", "USD", "EUR", "MXN", "GBP", "ARS", "COP", "CLP"] as const;

/**
 * Campo numérico com rótulo, dica e mensagem de erro ligada por aria.
 *
 * Onde: Ui.tsx (todos os campos de texto). Entradas: id, rótulo, dica, valor,
 * erro e callback. Saída: bloco `.field` com aria-invalid quando há erro.
 */
function NumberField(p: { id: string; label: string; hint: string; value: string; error: string | undefined; onInput: (v: string) => void }) {
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
 * Grade de resultados (LTV de margem e CPA máximo em destaque).
 *
 * Onde: Ui.tsx, quando as entradas são válidas. Entradas: resultado do core,
 * moeda, idioma e textos. Saída: lista de definição com os indicadores.
 */
function Results({ r, currency, locale, s }: { r: CpaLtvResult; currency: string; locale: AppLocale; s: CpaLtvStrings }) {
  const money = (c: number | null): string => (c === null ? s.notAvailable : formatCents(c, currency, locale));
  const scaled = (v: number | null, div: number, unit: string, digits: number): string =>
    v === null ? s.notAvailable : `${formatNumber(v / div, digits, locale)} ${unit}`;
  const ratio = r.ratioCentis === null ? s.notAvailable : `${formatNumber(r.ratioCentis / 100, 2, locale)}x`;
  return (
    <dl class="stat-grid">
      <div class="stat is-hero"><dt>{s.ltvMargin}</dt><dd data-testid="ltv-margin">{money(r.ltvMarginCents)}</dd></div>
      <div class="stat is-hero"><dt>{s.maxCpaTarget}</dt><dd data-testid="max-cpa">{money(r.maxCpaTargetCents)}</dd></div>
      <div class="stat"><dt>{s.ltvRevenue}</dt><dd data-testid="ltv-revenue">{money(r.ltvRevenueCents)}</dd></div>
      <div class="stat"><dt>{s.breakEvenCpa}</dt><dd data-testid="breakeven-cpa">{money(r.breakEvenCpaCents)}</dd></div>
      <div class="stat"><dt>{s.ratioNow}</dt><dd data-testid="ratio">{ratio}</dd></div>
      <div class="stat"><dt>{s.profit}</dt><dd data-testid="profit">{money(r.profitPerCustomerCents)}</dd></div>
      <div class="stat"><dt>{s.paybackPurchases}</dt><dd data-testid="payback-purchases">{scaled(r.paybackPurchasesCentis, 100, s.purchasesUnit, 2)}</dd></div>
      <div class="stat"><dt>{s.paybackMonths}</dt><dd data-testid="payback-months">{scaled(r.paybackMonthsTenths, 10, s.monthsUnit, 1)}</dd></div>
      <div class="stat"><dt>{s.maxCpaPayback}</dt><dd data-testid="max-cpa-payback">{money(r.maxCpaPaybackCents)}</dd></div>
    </dl>
  );
}

/**
 * Escolha entre informar o CAC direto ou calcular por verba e clientes.
 *
 * Onde: Ui.tsx. Entradas: modo atual, textos e callback. Saída: grupo de rádios
 * (fieldset com legenda) com alvos de 44px.
 */
function ModePicker(p: { mode: Fields["mode"]; s: CpaLtvStrings; onChange: (m: Fields["mode"]) => void }) {
  return (
    <fieldset>
      <legend>{p.s.cacMode}</legend>
      <div class="seg">
        <label class="check"><input type="radio" name="cpa-mode" checked={p.mode === "cac"} onChange={() => p.onChange("cac")} />{p.s.modeCac}</label>
        <label class="check"><input type="radio" name="cpa-mode" checked={p.mode === "budget"} onChange={() => p.onChange("budget")} />{p.s.modeBudget}</label>
      </div>
    </fieldset>
  );
}

/**
 * Ilha da Calculadora de CPA máximo, LTV e LTV/CAC.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: campos ->
 * compute (parsers do core, centavos e inteiros) -> calcCpaLtv -> formatadores.
 * Valores de exemplo vêm preenchidos para a página já mostrar um resultado.
 */
export default function CpaLtv({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [currency, setCurrency] = useState<string>(defaultCurrency(lang));
  const [f, setF] = useState<Fields>({ ...s.example, mode: "cac" });
  const set = (k: keyof Fields) => (v: string): void => setF((old) => ({ ...old, [k]: v }));
  const calc = useMemo(() => compute(f, lang, s), [f, lang, s]);
  const e = calc.errors;

  return (
    <div class="tool-ui">
      <div class="field">
        <label for="cpa-currency">{s.currency}</label>
        <select id="cpa-currency" value={currency} onChange={(ev) => setCurrency(ev.currentTarget.value)}>
          {CURRENCIES.map((c) => <option value={c}>{c}</option>)}
        </select>
      </div>
      <div class="row">
        <NumberField id="cpa-ticket" label={s.ticket} hint={s.ticketHint} value={f.ticket} error={e.ticket} onInput={set("ticket")} />
        <NumberField id="cpa-margin" label={s.margin} hint={s.marginHint} value={f.margin} error={e.margin} onInput={set("margin")} />
        <NumberField id="cpa-purchases" label={s.purchases} hint={s.purchasesHint} value={f.purchases} error={e.purchases} onInput={set("purchases")} />
      </div>
      <ModePicker mode={f.mode} s={s} onChange={(m) => setF((old) => ({ ...old, mode: m }))} />
      {f.mode === "cac" ? (
        <div class="row">
          <NumberField id="cpa-cac" label={s.cac} hint={s.cacHint} value={f.cac} error={e.cac} onInput={set("cac")} />
        </div>
      ) : (
        <div class="row">
          <NumberField id="cpa-budget" label={s.budget} hint={s.budgetHint} value={f.budget} error={e.budget} onInput={set("budget")} />
          <NumberField id="cpa-customers" label={s.customers} hint={s.customersHint} value={f.customers} error={e.customers} onInput={set("customers")} />
        </div>
      )}
      <div class="row">
        <NumberField id="cpa-ratio" label={s.ratio} hint={s.ratioHint} value={f.ratio} error={e.ratio} onInput={set("ratio")} />
        <NumberField id="cpa-lifetime" label={s.lifetime} hint={s.lifetimeHint} value={f.lifetime} error={e.lifetime} onInput={set("lifetime")} />
        <NumberField id="cpa-payback" label={s.payback} hint={s.paybackHint} value={f.payback} error={e.payback} onInput={set("payback")} />
      </div>
      <section class="stack" aria-labelledby="cpa-results" aria-live="polite">
        <h3 id="cpa-results">{s.results}</h3>
        {calc.result ? (
          <>
            {calc.noCustomers && <Notice kind="warn">{s.noCustomers}</Notice>}
            <Results r={calc.result} currency={currency} locale={lang} s={s} />
            <Notice kind={calc.result.verdict === "healthy" ? "ok" : calc.result.verdict === "loss" ? "err" : "info"}>{s.verdict[calc.result.verdict]}</Notice>
            {calc.result.paysBackInPeriod === false && <Notice kind="warn">{s.notPaid}</Notice>}
            <p class="hint">{s.convention}</p>
          </>
        ) : (
          <Notice kind="warn">{s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
