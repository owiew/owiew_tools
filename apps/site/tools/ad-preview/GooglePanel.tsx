import { type RsaCheck, RSA_LIMITS, checkGoogleRsa, previewGoogleRsa } from "@owiew/core/ads";
import { Icon } from "../../src/components/Icon";
import { Notice } from "../../src/components/ui/Notice";
import { CountedInput } from "./CountedInput";
import { type AdStrings } from "./strings";

/** Estado editável do anúncio Google. */
export interface GoogleState {
  readonly domain: string;
  readonly path1: string;
  readonly path2: string;
  readonly headlines: readonly string[];
  readonly descriptions: readonly string[];
}

/**
 * Painel do anúncio responsivo de pesquisa do Google: campos, contadores, avisos e prévia.
 *
 * Onde: Ui.tsx, aba Google. Entradas: estado, callback de mudança e textos.
 * Fluxo: campos -> core.checkGoogleRsa (contagem à maneira do Google) ->
 * contadores por campo, lista de avisos e prévia genérica (core.previewGoogleRsa).
 */
export function GooglePanel({ s, state, onChange }: { s: AdStrings; state: GoogleState; onChange: (v: GoogleState) => void }) {
  const check: RsaCheck = checkGoogleRsa(state);
  const preview = previewGoogleRsa(state);
  const set = (patch: Partial<GoogleState>): void => onChange({ ...state, ...patch });
  const edit = (list: readonly string[], i: number, v: string): string[] => list.map((t, k) => (k === i ? v : t));
  const drop = (list: readonly string[], i: number): string[] => list.filter((_, k) => k !== i);

  return (
    <div class="stack">
      <h3>{s.googleTitle}</h3>
      <div class="row">
        <div class="field">
          <label for="ad-domain">{s.domain}</label>
          <input id="ad-domain" type="text" autocomplete="off" value={state.domain} aria-describedby="ad-domain-hint" onInput={(e) => set({ domain: e.currentTarget.value })} />
          <span class="hint" id="ad-domain-hint">{s.domainHint}</span>
        </div>
        <CountedInput id="ad-path1" label={s.path1} value={state.path1} length={check.path1.length} limit={RSA_LIMITS.pathChars} s={s} hint={s.pathHint} onInput={(v) => set({ path1: v })} />
        <CountedInput id="ad-path2" label={s.path2} value={state.path2} length={check.path2.length} limit={RSA_LIMITS.pathChars} s={s} onInput={(v) => set({ path2: v })} />
      </div>
      <div class="stack">
        {state.headlines.map((h, i) => {
          const f = check.headlines[i];
          return <CountedInput id={`ad-h${i}`} label={s.headline(i + 1)} value={h} length={f?.length ?? 0} limit={RSA_LIMITS.headlineChars} s={s} onInput={(v) => set({ headlines: edit(state.headlines, i, v) })} onRemove={() => set({ headlines: drop(state.headlines, i) })} />;
        })}
        <div class="btn-row">
          <button type="button" class="btn" disabled={state.headlines.length >= RSA_LIMITS.headlines} onClick={() => set({ headlines: [...state.headlines, ""] })}><Icon name="plus" size={18} />{s.addHeadline}</button>
        </div>
      </div>
      <div class="stack">
        {state.descriptions.map((d, i) => {
          const f = check.descriptions[i];
          return <CountedInput id={`ad-d${i}`} label={s.description(i + 1)} value={d} length={f?.length ?? 0} limit={RSA_LIMITS.descriptionChars} s={s} multiline onInput={(v) => set({ descriptions: edit(state.descriptions, i, v) })} onRemove={() => set({ descriptions: drop(state.descriptions, i) })} />;
        })}
        <div class="btn-row">
          <button type="button" class="btn" disabled={state.descriptions.length >= RSA_LIMITS.descriptions} onClick={() => set({ descriptions: [...state.descriptions, ""] })}><Icon name="plus" size={18} />{s.addDescription}</button>
        </div>
      </div>
      <section class="stack" aria-labelledby="ad-g-status" aria-live="polite">
        <h3 id="ad-g-status">{s.previewTitle}</h3>
        <Notice kind={check.ready ? "ok" : "warn"}>{check.ready ? s.ready : s.notReady}</Notice>
        {check.issues.map((i) => <Notice kind={i.severity === "error" ? "err" : "info"}>{s.issues[i.code] ?? i.code}</Notice>)}
        <div class="ad-card" data-testid="google-preview">
          <p class="ad-meta"><span class="ad-badge">{s.sponsored}</span> <span data-testid="google-display-url">{preview.displayUrl}</span></p>
          <p class="ad-title">{preview.headlines.join(" | ")}</p>
          <p class="ad-text">{preview.descriptions.join(" ")}</p>
        </div>
        <p class="hint">{s.previewNote}</p>
      </section>
    </div>
  );
}
