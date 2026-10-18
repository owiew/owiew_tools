import { type ParseNumberError, formatBp, formatNumber, parseScaled } from "@owiew/core";
import { testSignificance } from "@owiew/core/abtest";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { Choice, Field } from "./Field";
import { type AbStrings } from "./strings";

/** Níveis de confiança oferecidos, em pontos-base. */
export const CONFIDENCES: readonly (readonly [string, string])[] = [["9000", "90%"], ["9500", "95%"], ["9900", "99%"]];

/**
 * Lê um inteiro digitado e traduz o erro de leitura.
 *
 * Onde: campos de visitantes e conversões. Entradas: texto, idioma e textos.
 * Saída: o inteiro ou o erro traduzido. Efeito: nenhum.
 */
function readCount(text: string, lang: Lang, s: AbStrings): { value: number; error: null } | { value: null; error: string } {
  const r = parseScaled(text, lang, 0);
  return r.ok ? { value: r.value, error: null } : { value: null, error: s.errors[r.error as ParseNumberError] ?? r.error };
}

/**
 * Painel de significância: dois grupos, teste z de duas proporções e leitura do resultado.
 *
 * Onde: Ui.tsx, aba "Significância". Fluxo: campos -> parseScaled (inteiros) ->
 * core.testSignificance -> taxas, z, p, IC e veredito. Vem preenchido com um
 * exemplo para a página já mostrar um resultado ao crawler.
 */
export function SignificancePanel({ lang, s }: { lang: Lang; s: AbStrings }) {
  const [aV, setAV] = useState(s.example.visitors);
  const [aC, setAC] = useState(s.example.convA);
  const [bV, setBV] = useState(s.example.visitors);
  const [bC, setBC] = useState(s.example.convB);
  const [conf, setConf] = useState("9500");
  const [tails, setTails] = useState("2");

  const calc = useMemo(() => {
    const f = { aV: readCount(aV, lang, s), aC: readCount(aC, lang, s), bV: readCount(bV, lang, s), bC: readCount(bC, lang, s) };
    if (f.aV.value === null || f.aC.value === null || f.bV.value === null || f.bC.value === null) return { f, result: null };
    const r = testSignificance({
      a: { visitors: f.aV.value, conversions: f.aC.value }, b: { visitors: f.bV.value, conversions: f.bC.value },
      confidenceBp: Number(conf), tails: tails === "1" ? 1 : 2,
    });
    return { f, result: r.ok ? r.value : null };
  }, [aV, aC, bV, bC, conf, tails, lang, s]);

  const pct = (v: number): string => formatBp(Math.round(v * 10_000), lang);
  const signed = (v: number): string => `${v > 0 ? "+" : ""}${pct(v)}`;
  const r = calc.result;
  const kind = r === null ? "warn" : r.winner === "b" ? "ok" : r.winner === "a" ? "err" : "info";
  const verdict = r === null ? "" : r.warnings.includes("no-variation") ? s.verdict["no-variation"] : s.verdict[r.winner];
  const p = r ? (r.pValue < 0.0001 ? (lang === "en" ? "< 0.0001" : "< 0,0001") : formatNumber(r.pValue, 4, lang)) : "";
  const exceeds = (c: number | null, v: number | null): boolean => c !== null && v !== null && c > v;
  const exceedA = exceeds(calc.f.aC.value, calc.f.aV.value);
  const exceedB = exceeds(calc.f.bC.value, calc.f.bV.value);

  return (
    <div class="stack">
      <div class="row">
        <fieldset class="stack">
          <legend>{s.groupA}</legend>
          <Field id="ab-av" label={`${s.visitors} (A)`} hint={s.visitorsHint} value={aV} error={calc.f.aV.error} onInput={setAV} />
          <Field id="ab-ac" label={`${s.conversions} (A)`} value={aC} error={calc.f.aC.error ?? (exceedA ? s.errors["conversions-exceed-visitors"] ?? null : null)} onInput={setAC} />
        </fieldset>
        <fieldset class="stack">
          <legend>{s.groupB}</legend>
          <Field id="ab-bv" label={`${s.visitors} (B)`} hint={s.visitorsHint} value={bV} error={calc.f.bV.error} onInput={setBV} />
          <Field id="ab-bc" label={`${s.conversions} (B)`} value={bC} error={calc.f.bC.error ?? (exceedB ? s.errors["conversions-exceed-visitors"] ?? null : null)} onInput={setBC} />
        </fieldset>
      </div>
      <div class="row">
        <Choice id="ab-conf" label={s.confidence} value={conf} options={CONFIDENCES} onChange={setConf} />
        <Choice id="ab-tails" label={s.tails} value={tails} options={[["2", s.tailsTwo], ["1", s.tailsOne]]} onChange={setTails} />
      </div>
      <section class="stack" aria-labelledby="ab-results" aria-live="polite">
        <h3 id="ab-results">{s.results}</h3>
        {r ? (
          <>
            <dl class="stat-grid">
              <div class="stat"><dt>{s.rate} A</dt><dd data-testid="ab-rate-a">{pct(r.rateA)}</dd></div>
              <div class="stat"><dt>{s.rate} B</dt><dd data-testid="ab-rate-b">{pct(r.rateB)}</dd></div>
              <div class="stat"><dt>{s.diff}</dt><dd data-testid="ab-diff">{signed(r.diff)}</dd></div>
              <div class="stat"><dt>{s.uplift}</dt><dd>{r.relativeUplift === null ? s.notAvailable : signed(r.relativeUplift)}</dd></div>
              <div class="stat"><dt>{s.z}</dt><dd data-testid="ab-z">{r.z === null ? s.notAvailable : formatNumber(r.z, 3, lang)}</dd></div>
              <div class="stat is-hero"><dt>{s.pValue}</dt><dd data-testid="ab-p">{p}</dd></div>
              <div class="stat"><dt>{s.ci} ({CONFIDENCES.find(([v]) => v === conf)?.[1]})</dt><dd data-testid="ab-ci">{signed(r.ci.low)} … {signed(r.ci.high)}</dd></div>
            </dl>
            <Notice kind={kind}>{verdict}</Notice>
            {r.warnings.filter((w) => w !== "no-variation").map((w) => <Notice kind="warn">{s.warnings[w]}</Notice>)}
          </>
        ) : (
          <Notice kind="warn">{s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
