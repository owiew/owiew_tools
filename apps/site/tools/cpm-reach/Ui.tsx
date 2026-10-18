import { type AppLocale, defaultCurrency, formatCents, formatNumber } from "@owiew/core";
import { type CpmReachMode, type CpmReachResult } from "@owiew/core/cpm-reach";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { type Fields, type FieldKey, REQUIRED, compute } from "./compute";
import { type CpmReachStrings, strings } from "./strings";

const CURRENCIES = ["BRL", "USD", "EUR", "MXN", "GBP", "ARS", "COP", "CLP"] as const;
const MODES: readonly CpmReachMode[] = ["impressions", "reach", "cpm", "budget"];

/**
 * Campo de texto numérico com rótulo, dica e erro ligados por aria.
 *
 * Onde: Ui.tsx (todos os campos). Entradas: id, rótulo, dica, valor, erro e
 * callback. Saída: bloco `.field` com aria-invalid quando há erro.
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
 * Seletor de modo (radiogroup acessível por fieldset + radios nativos).
 *
 * Onde: Ui.tsx, topo do formulário. Entradas: modo atual, callback, textos.
 * Saída: grupo de radios com alvo de toque de 44px (classe `.check`).
 */
function ModePicker({ mode, onChange, s }: { mode: CpmReachMode; onChange: (m: CpmReachMode) => void; s: CpmReachStrings }) {
  return (
    <fieldset>
      <legend>{s.modeLegend}</legend>
      <div class="seg" role="radiogroup" aria-label={s.modeLegend}>
        {MODES.map((m) => (
          <label class="check">
            <input type="radio" name="cr-mode" value={m} checked={mode === m} onChange={() => onChange(m)} />
            {s.modes[m]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Cartão de indicador: rótulo, valor, id de teste e destaque. */
interface Item {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hero?: boolean;
}

/**
 * Lista os indicadores do resultado conforme o modo.
 *
 * Onde: `Results`. Entradas: resultado do core, moeda, idioma e textos.
 * Saída: itens na ordem de exibição (o principal do modo vem primeiro).
 */
function itemsOf(r: CpmReachResult, currency: string, lang: AppLocale, s: CpmReachStrings): Item[] {
  const int = (v: number): string => formatNumber(v, 0, lang);
  const money = (v: number): string => formatCents(v, currency, lang);
  const impressions = { id: "cr-impressions", label: s.out.impressions, value: int(r.impressions) };
  const cpm = { id: "cr-cpm", label: s.out.cpm, value: money(r.cpmCents) };
  const freq = { id: "cr-frequency", label: s.out.frequency, value: formatNumber((r.frequencyCenti ?? 0) / 100, 2, lang) };
  const list: Item[] = [];
  if (r.mode === "impressions") list.push({ ...impressions, hero: true }, { id: "cr-spend", label: s.out.spend, value: money(r.spendCents) }, cpm);
  if (r.mode === "reach") list.push({ id: "cr-reach", label: s.out.reach, value: int(r.reach ?? 0), hero: true }, impressions, freq, cpm);
  if (r.mode === "cpm") list.push({ ...cpm, hero: true }, impressions, { id: "cr-spend", label: s.out.spend, value: money(r.spendCents) });
  if (r.mode === "budget") list.push({ id: "cr-spend", label: s.out.spendNeeded, value: money(r.spendCents), hero: true }, { id: "cr-reach", label: s.out.reachGoal, value: int(r.reach ?? 0) }, impressions, freq, cpm);
  if (r.clicks !== null) {
    list.push({ id: "cr-clicks", label: s.out.clicks, value: int(r.clicks) });
    list.push({ id: "cr-cpc", label: s.out.cpc, value: r.cpcCents === null ? s.notAvailable : money(r.cpcCents) });
  }
  return list;
}

/**
 * Grade de resultados com avisos de estimativa e arredondamento.
 *
 * Onde: Ui.tsx, quando as entradas são válidas. Entradas: resultado, moeda,
 * idioma e textos. Saída: lista de definição mais notas honestas.
 */
function Results({ r, currency, lang, s }: { r: CpmReachResult; currency: string; lang: AppLocale; s: CpmReachStrings }) {
  const hasReach = r.mode === "reach" || r.mode === "budget";
  return (
    <>
      <dl class="stat-grid">
        {itemsOf(r, currency, lang, s).map((it) => (
          <div class={it.hero ? "stat is-hero" : "stat"}><dt>{it.label}</dt><dd data-testid={it.id}>{it.value}</dd></div>
        ))}
      </dl>
      {hasReach && <Notice kind="warn">{s.estimateNote}</Notice>}
      {r.clicks === 0 && <Notice kind="info">{s.noClicksNote}</Notice>}
      <p class="hint">{s.roundingNote}</p>
    </>
  );
}

/**
 * Ilha da Calculadora de CPM, alcance e frequência.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: campos ->
 * `compute` (parsers do core + calcCpmReach) -> formatadores. Valores de
 * exemplo vêm preenchidos para a página já sair com um resultado.
 */
export default function CpmReach({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [currency, setCurrency] = useState<string>(defaultCurrency(lang));
  const [f, setF] = useState<Fields>({ mode: "impressions", ...s.example });
  const set = (key: keyof Fields) => (v: string) => setF((p) => ({ ...p, [key]: v }));
  const calc = useMemo(() => compute(f, lang, s), [f, lang, s]);
  const show = (k: FieldKey): boolean => REQUIRED[f.mode].includes(k);
  const field = (k: FieldKey, label: string, hint: string) => (
    <NumberField id={`cr-${k}`} label={label} hint={hint} value={f[k]} error={calc.errors[k]} onInput={set(k)} />
  );
  return (
    <div class="tool-ui">
      <ModePicker mode={f.mode} onChange={(m) => setF((p) => ({ ...p, mode: m }))} s={s} />
      <div class="field">
        <label for="cr-currency">{s.currency}</label>
        <select id="cr-currency" value={currency} onChange={(e) => setCurrency(e.currentTarget.value)}>
          {CURRENCIES.map((c) => <option value={c}>{c}</option>)}
        </select>
      </div>
      <div class="row">
        {show("spend") && field("spend", s.spend, s.spendHint)}
        {show("cost") && field("cost", s.cost, s.costHint)}
        {show("impressions") && field("impressions", s.impressions, s.impressionsHint)}
        {show("reach") && field("reach", s.reachGoal, s.reachGoalHint)}
        {show("cpm") && field("cpm", s.cpm, s.cpmHint)}
        {show("frequency") && field("frequency", s.frequency, s.frequencyHint)}
        {field("ctr", s.ctr, s.ctrHint)}
      </div>
      <section class="stack" aria-labelledby="cr-results" aria-live="polite">
        <h3 id="cr-results">{s.results}</h3>
        {calc.result ? (
          <Results r={calc.result} currency={currency} lang={lang} s={s} />
        ) : (
          <Notice kind={calc.overflow ? "err" : "warn"}>{calc.overflow ? s.overflow : s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
