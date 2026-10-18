import { META_LIMITS, type MetaCheck } from "@owiew/core/ads";
import { Icon } from "../../src/components/Icon";
import { Notice } from "../../src/components/ui/Notice";
import { CountedInput } from "./CountedInput";
import { type AdStrings } from "./strings";

/** Estado editável do anúncio Meta. */
export interface MetaState {
  readonly primary: string;
  readonly headline: string;
  readonly description: string;
}

/**
 * Painel do anúncio Meta: três campos com contador e prévia de Feed com truncamento simulado.
 *
 * Onde: Ui.tsx, aba Meta. Entradas: estado, resultado do core.checkMeta (já
 * calculado pelo pai, que também o usa no CSV), callback e textos.
 * A prévia é genérica: avatar neutro, imagem cinza, sem logotipo de terceiros.
 */
export function MetaPanel({ s, state, check, onChange }: { s: AdStrings; state: MetaState; check: MetaCheck; onChange: (v: MetaState) => void }) {
  const set = (patch: Partial<MetaState>): void => onChange({ ...state, ...patch });
  return (
    <div class="stack">
      <h3>{s.metaTitle}</h3>
      <CountedInput id="meta-primary" label={s.primary} value={state.primary} length={check.primary.length} limit={META_LIMITS.primary} s={s} hint={s.primaryHint} multiline onInput={(v) => set({ primary: v })} />
      <div class="row">
        <CountedInput id="meta-headline" label={s.metaHeadline} value={state.headline} length={check.headline.length} limit={META_LIMITS.headline} s={s} hint={s.metaHeadlineHint} onInput={(v) => set({ headline: v })} />
        <CountedInput id="meta-description" label={s.metaDescription} value={state.description} length={check.description.length} limit={META_LIMITS.description} s={s} hint={s.metaDescriptionHint} onInput={(v) => set({ description: v })} />
      </div>
      <section class="stack" aria-labelledby="ad-m-status" aria-live="polite">
        <h3 id="ad-m-status">{s.previewTitle}</h3>
        <Notice kind={check.withinLimits ? "ok" : "info"}>{check.withinLimits ? s.metaWithin : s.metaTruncated}</Notice>
        <div class="ad-card meta-card" data-testid="meta-preview">
          <p class="ad-meta"><span class="meta-avatar" aria-hidden="true"><Icon name="info" size={16} /></span> <strong>{s.pageName}</strong> · <span class="ad-badge">{s.sponsored}</span></p>
          <p class="ad-text" data-testid="meta-primary-shown">
            {check.primary.shown}
            {check.primary.truncated && <> <span class="see-more">{s.seeMore}</span></>}
          </p>
          <div class="meta-image" aria-hidden="true" />
          <div class="meta-bar">
            <div>
              <p class="ad-title" data-testid="meta-headline-shown">{check.headline.shown}</p>
              <p class="ad-text" data-testid="meta-description-shown">{check.description.shown}</p>
            </div>
            <span class="meta-cta">{s.learnMore}</span>
          </div>
        </div>
        <p class="hint">{s.previewNote}</p>
      </section>
    </div>
  );
}
