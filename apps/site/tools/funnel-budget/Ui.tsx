import { type AppLocale, defaultCurrency, formatCents, formatNumber } from "@owiew/core";
import { type FunnelResult } from "@owiew/core/funnel";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { FunnelBars } from "./FunnelBars";
import { type FieldId, type RawFields, planFunnel } from "./plan";
import { ScenarioTable } from "./ScenarioTable";
import { type FunnelStrings, strings } from "./strings";
import "./styles.css";

const CURRENCIES = ["BRL", "USD", "EUR", "MXN", "GBP", "ARS", "COP", "CLP"] as const;

/**
 * Campo de texto com rótulo, dica e erro ligados por aria.
 *
 * Onde: Ui.tsx (todos os campos numéricos). Entradas: id, rótulo, dica, valor,
 * erro e callback. Saída: bloco `.field` com aria-invalid quando há erro.
 */
function NumberField(p: { id: string; label: string; hint: string; value: string; error?: string; onInput: (v: string) => void }) {
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
 * Grade de números principais (verba em destaque).
 *
 * Onde: Ui.tsx, quando as entradas são válidas. Entradas: resultado do core,
 * moeda, idioma e textos. Saída: lista de definição com os indicadores.
 */
function Stats({ r, currency, locale, s }: { r: FunnelResult; currency: string; locale: AppLocale; s: FunnelStrings }) {
  const money = (c: number): string => formatCents(c, currency, locale);
  const n = (v: number): string => formatNumber(v, 0, locale);
  return (
    <dl class="stat-grid">
      <div class="stat is-hero"><dt>{s.budget}</dt><dd data-testid="budget">{money(r.budgetCents)}</dd></div>
      <div class="stat"><dt>{s.leads}</dt><dd data-testid="leads">{n(r.leads)}</dd></div>
      <div class="stat"><dt>{s.clicks}</dt><dd data-testid="clicks">{n(r.clicks)}</dd></div>
      {r.impressions !== null && <div class="stat"><dt>{s.impressions}</dt><dd data-testid="impressions">{n(r.impressions)}</dd></div>}
      <div class="stat"><dt>{s.cpl}</dt><dd data-testid="cpl">{money(r.cplCents)}</dd></div>
      <div class="stat"><dt>{s.cpa}</dt><dd data-testid="cpa">{money(r.cpaCents)}</dd></div>
      {r.revenueCents !== null && <div class="stat"><dt>{s.revenue}</dt><dd data-testid="revenue">{money(r.revenueCents)}</dd></div>}
      {r.revenueCents !== null && <div class="stat"><dt>{s.roas}</dt><dd data-testid="roas">{r.roas === null ? s.notAvailable : `${formatNumber(r.roas, 2, locale)}x`}</dd></div>}
    </dl>
  );
}

/**
 * Ilha do Planejador de verba por funil.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: campos ->
 * planFunnel (parsers do core + calcScenarios) -> números, barras e tabela.
 * Valores de exemplo vêm preenchidos para a página já sair com um resultado.
 */
export default function FunnelBudget({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [currency, setCurrency] = useState<string>(defaultCurrency(lang));
  const [raw, setRaw] = useState<RawFields>({
    mode: "cpc", sales: s.example.sales, leadRate: s.example.leadRate, clickRate: s.example.clickRate,
    cpc: s.example.cpc, ctr: s.example.ctr, cpm: s.example.cpm, ticket: s.example.ticket,
  });
  const set = (field: FieldId) => (v: string): void => setRaw((prev) => ({ ...prev, [field]: v }));
  const plan = useMemo(() => planFunnel(raw, lang, s), [raw, lang, s]);
  const f = (id: FieldId, label: string, hint: string) => (
    <NumberField id={`fb-${id}`} label={label} hint={hint} value={raw[id]} error={plan.errors[id]} onInput={set(id)} />
  );

  return (
    <div class="tool-ui">
      <div class="row">
        <div class="field">
          <label for="fb-currency">{s.currency}</label>
          <select id="fb-currency" value={currency} onChange={(e) => setCurrency(e.currentTarget.value)}>
            {CURRENCIES.map((c) => <option value={c}>{c}</option>)}
          </select>
        </div>
        <div class="field">
          <label for="fb-mode">{s.mode}</label>
          <select id="fb-mode" value={raw.mode} onChange={(e) => setRaw((prev) => ({ ...prev, mode: e.currentTarget.value === "ctr-cpm" ? "ctr-cpm" : "cpc" }))}>
            <option value="cpc">{s.modeCpc}</option>
            <option value="ctr-cpm">{s.modeCtrCpm}</option>
          </select>
        </div>
      </div>
      <div class="row">
        {f("sales", s.sales, s.salesHint)}
        {f("leadRate", s.leadRate, s.leadRateHint)}
        {f("clickRate", s.clickRate, s.clickRateHint)}
      </div>
      <div class="row">
        {raw.mode === "cpc" ? f("cpc", s.cpc, s.cpcHint) : (
          <>
            {f("ctr", s.ctr, s.ctrHint)}
            {f("cpm", s.cpm, s.cpmHint)}
          </>
        )}
        {f("ticket", s.ticket, s.ticketHint)}
      </div>
      <section class="stack" aria-labelledby="fb-results" aria-live="polite">
        <h3 id="fb-results">{s.results}</h3>
        {plan.base && plan.input ? (
          <>
            <Stats r={plan.base} currency={currency} locale={lang} s={s} />
            <p class="hint">{s.roundNote}</p>
            <FunnelBars r={plan.base} input={plan.input} locale={lang} s={s} />
            <ScenarioTable rows={plan.scenarios} currency={currency} locale={lang} s={s} showImpressions={raw.mode === "ctr-cpm"} showRoas={plan.base.revenueCents !== null} />
          </>
        ) : plan.overflow ? (
          <Notice kind="err">{s.overflow}</Notice>
        ) : (
          <Notice kind="warn">{s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
