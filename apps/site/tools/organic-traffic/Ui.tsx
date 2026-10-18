import { formatBp, formatNumber } from "@owiew/core";
import { CTR_BP, type Scenario, estimateOrganic, parseKeywordRows } from "@owiew/core/organic";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import "./styles.css";
import { strings } from "./strings";

/** Posições com valor lido do estudo (as demais da curva são interpoladas). */
const MEASURED = new Set([1, 2, 3, 10]);

/**
 * Lê um inteiro digitado; o que não for só dígitos vira NaN (o core recusa).
 *
 * Onde: campo do cenário. Entrada: texto. Saída: número.
 */
function toInt(text: string): number {
  return /^\d{1,4}$/.test(text.trim()) ? Number(text.trim()) : NaN;
}

/**
 * Ilha do Estimador de tráfego orgânico por posição.
 *
 * Onde: montada por Page.astro. Entrada: idioma. Fluxo: texto das palavras-chave
 * -> `parseKeywordRows` (erro por linha) -> `estimateOrganic` (volume x CTR) ->
 * tabela, total e curva de CTR com a fonte. Sem rede; nada é salvo.
 */
export default function OrganicTraffic({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [text, setText] = useState(s.exampleRows);
  const [kind, setKind] = useState<"target" | "rise">("target");
  const [value, setValue] = useState("1");

  const parsed = useMemo(() => parseKeywordRows(text, lang), [text, lang]);
  const estimate = useMemo(() => {
    const scenario: Scenario = kind === "target" ? { kind, position: toInt(value) } : { kind, steps: toInt(value) };
    return estimateOrganic(parsed.rows, scenario);
  }, [parsed, kind, value]);
  const n = (v: number): string => formatNumber(v, 0, lang);
  const scenarioError = !estimate.ok && estimate.error === "invalid-scenario" ? s.errors["invalid-scenario"] : undefined;

  /** Troca o tipo de cenário e recoloca um valor padrão coerente. */
  function pick(next: "target" | "rise"): void {
    setKind(next);
    setValue(next === "target" ? "1" : "3");
  }

  return (
    <div class="tool-ui">
      <div class="field">
        <label for="org-rows">{s.rows}</label>
        <textarea id="org-rows" rows={6} spellcheck={false} value={text} aria-describedby="org-rows-hint org-rows-err" aria-invalid={parsed.errors.length ? "true" : "false"} onInput={(e) => setText(e.currentTarget.value)} />
        <span class="hint" id="org-rows-hint">{s.rowsHint}</span>
        <div id="org-rows-err">
          {parsed.errors.slice(0, 5).map((e) => <span class="field-error org-line">{s.lineError(e.line, s.lineReasons[e.error] ?? e.error)}</span>)}
          {parsed.truncated && <span class="field-error org-line">{s.truncated}</span>}
        </div>
      </div>

      <fieldset class="stack">
        <legend>{s.scenario}</legend>
        <div class="seg">
          <label class="check"><input type="radio" name="org-kind" checked={kind === "target"} onChange={() => pick("target")} />{s.target}</label>
          <label class="check"><input type="radio" name="org-kind" checked={kind === "rise"} onChange={() => pick("rise")} />{s.rise}</label>
        </div>
        <div class="field org-value">
          <label for="org-value">{kind === "target" ? s.targetValue : s.riseValue}</label>
          <input id="org-value" type="text" inputMode="numeric" autocomplete="off" value={value} aria-invalid={scenarioError ? "true" : "false"} aria-describedby={`org-value-hint${scenarioError ? " org-value-err" : ""}`} onInput={(e) => setValue(e.currentTarget.value)} />
          <span class="hint" id="org-value-hint">{s.valueHint}</span>
          {scenarioError && <span class="field-error" id="org-value-err">{scenarioError}</span>}
        </div>
      </fieldset>

      <section class="output stack" aria-labelledby="org-result-title" aria-live="polite">
        <h3 id="org-result-title">{s.result}</h3>
        {estimate.ok ? (
          <>
            <p data-testid="org-summary">{s.summary(n(estimate.value.totalCurrent), n(estimate.value.totalNew), n(estimate.value.totalGain))}</p>
            <div class="table-wrap" role="region" aria-label={s.tableLabel} tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{s.cols.keyword}</th><th scope="col" class="num">{s.cols.volume}</th><th scope="col" class="num">{s.cols.position}</th>
                    <th scope="col" class="num">{s.cols.newPosition}</th><th scope="col" class="num">{s.cols.now}</th>
                    <th scope="col" class="num">{s.cols.scenario}</th><th scope="col" class="num">{s.cols.gain}</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.value.rows.map((r) => (
                    <tr>
                      <th scope="row">{r.keyword}</th><td class="num">{n(r.volume)}</td><td class="num">{r.position}</td><td class="num">{r.newPosition}</td>
                      <td class="num">{n(r.currentClicks)}</td><td class="num">{n(r.newClicks)}</td><td class="num">+{n(r.gainClicks)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={4}>{s.total}</th>
                    <td class="num" data-testid="org-total-now">{n(estimate.value.totalCurrent)}</td>
                    <td class="num" data-testid="org-total-new">{n(estimate.value.totalNew)}</td>
                    <td class="num" data-testid="org-total-gain">+{n(estimate.value.totalGain)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <Notice kind="warn">{s.errors[estimate.error] ?? estimate.error}</Notice>
        )}
      </section>

      <section class="stack" aria-labelledby="org-ctr-title">
        <h3 id="org-ctr-title">{s.ctrTitle}</h3>
        <div class="table-wrap" role="region" aria-label={s.ctrTitle} tabIndex={0}>
          <table>
            <thead><tr><th scope="col">{s.ctrCols.position}</th><th scope="col" class="num">{s.ctrCols.ctr}</th><th scope="col">{s.ctrCols.origin}</th></tr></thead>
            <tbody>
              {CTR_BP.map((bp, i) => (
                <tr><th scope="row">{i + 1}</th><td class="num">{formatBp(bp, lang)}</td><td>{MEASURED.has(i + 1) ? s.measured : s.interpolated}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="hint">{s.ctrSource}</p>
      </section>
    </div>
  );
}
