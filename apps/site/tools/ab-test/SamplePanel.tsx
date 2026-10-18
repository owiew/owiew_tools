import { type ParseNumberError, formatBp, formatNumber, parsePercentToBp, parseScaled } from "@owiew/core";
import { type MdeKind, sampleSize, testDurationDays } from "@owiew/core/abtest";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { Choice, Field } from "./Field";
import { type AbStrings } from "./strings";
import { CONFIDENCES } from "./SignificancePanel";

/** Poderes oferecidos, em pontos-base. */
const POWERS: readonly (readonly [string, string])[] = [["8000", "80%"], ["8500", "85%"], ["9000", "90%"], ["9500", "95%"]];

/**
 * Painel de tamanho de amostra: taxa atual, MDE, confiança e poder.
 *
 * Onde: Ui.tsx, aba "Tamanho de amostra". Fluxo: campos -> parsePercentToBp ->
 * core.sampleSize (Fleiss, igual ao Stata) -> visitantes por versão, total e
 * dias (se o tráfego diário for informado). Vem com exemplo preenchido.
 */
export function SamplePanel({ lang, s }: { lang: Lang; s: AbStrings }) {
  const [baseline, setBaseline] = useState(s.example.baseline);
  const [mde, setMde] = useState(s.example.mde);
  const [kind, setKind] = useState<MdeKind>("relative");
  const [conf, setConf] = useState("9500");
  const [power, setPower] = useState("8000");
  const [tails, setTails] = useState("2");
  const [daily, setDaily] = useState(s.example.daily);

  const tr = (code: string): string => s.errors[code as ParseNumberError] ?? code;
  const calc = useMemo(() => {
    const b = parsePercentToBp(baseline, lang);
    const m = parsePercentToBp(mde, lang);
    const d = daily.trim() === "" ? null : parseScaled(daily, lang, 0);
    const errors = { baseline: b.ok ? null : tr(b.error), mde: m.ok ? null : tr(m.error), daily: d && !d.ok ? tr(d.error) : null };
    if (!b.ok || !m.ok || (d && !d.ok)) return { errors, result: null, coreError: null, days: null };
    const r = sampleSize({ baselineBp: b.value, mdeBp: m.value, mdeKind: kind, confidenceBp: Number(conf), powerBp: Number(power), tails: tails === "1" ? 1 : 2 });
    if (!r.ok) return { errors, result: null, coreError: r.error, days: null };
    return { errors, result: r.value, coreError: null, days: d?.ok ? testDurationDays(r.value.total, d.value) : null };
  }, [baseline, mde, kind, conf, power, tails, daily, lang, s]);

  const r = calc.result;
  const onMde = calc.coreError !== null && ["invalid-mde", "target-out-of-range", "too-large"].includes(calc.coreError);
  const mdeError = calc.errors.mde ?? (onMde && calc.coreError !== null ? tr(calc.coreError) : null);
  const baselineError = calc.errors.baseline ?? (calc.coreError === "invalid-baseline" ? tr(calc.coreError) : null);

  return (
    <div class="stack">
      <div class="row">
        <Field id="ab-baseline" label={s.baseline} hint={s.baselineHint} value={baseline} error={baselineError} onInput={setBaseline} />
        <Field id="ab-mde" label={s.mde} hint={s.mdeHint} value={mde} error={mdeError} onInput={setMde} />
        <Choice id="ab-mde-kind" label={s.mdeKind} value={kind} options={[["relative", s.relative], ["absolute", s.absolute]]} onChange={(v) => setKind(v as MdeKind)} />
      </div>
      <div class="row">
        <Choice id="ab-s-conf" label={s.confidence} value={conf} options={CONFIDENCES} onChange={setConf} />
        <Choice id="ab-s-power" label={s.power} value={power} options={POWERS} onChange={setPower} />
        <Choice id="ab-s-tails" label={s.tails} value={tails} options={[["2", s.tailsTwo], ["1", s.tailsOne]]} onChange={setTails} />
        <Field id="ab-daily" label={s.daily} hint={s.dailyHint} value={daily} error={calc.errors.daily} onInput={setDaily} />
      </div>
      <section class="stack" aria-labelledby="ab-sample-results" aria-live="polite">
        <h3 id="ab-sample-results">{s.results}</h3>
        {r ? (
          <>
            <dl class="stat-grid">
              <div class="stat is-hero"><dt>{s.perGroup}</dt><dd data-testid="ab-per-group">{formatNumber(r.perGroup, 0, lang)}</dd></div>
              <div class="stat"><dt>{s.total}</dt><dd data-testid="ab-total">{formatNumber(r.total, 0, lang)}</dd></div>
              <div class="stat"><dt>{s.target}</dt><dd>{formatBp(Math.round(r.p2 * 10_000), lang)}</dd></div>
              <div class="stat"><dt>{s.days}</dt><dd data-testid="ab-days">{calc.days === null ? s.notAvailable : formatNumber(calc.days, 0, lang)}</dd></div>
            </dl>
            <p class="hint">{s.sampleNote}</p>
          </>
        ) : (
          <Notice kind="warn">{s.fix}</Notice>
        )}
      </section>
    </div>
  );
}
