import { type AppLocale, formatBp, formatNumber } from "@owiew/core";
import { type FunnelInput, type FunnelResult } from "@owiew/core/funnel";
import { type FunnelStrings } from "./strings";

interface Stage {
  readonly key: "impressions" | "clicks" | "leads" | "sales";
  readonly label: string;
  readonly value: number;
  readonly rate: string | null;
}

/**
 * Monta as etapas do funil, da maior para a menor, com a taxa de cada passo.
 *
 * Onde: etapa interna de `FunnelBars`. Entradas: resultado, entrada
 * (taxas em pontos-base), idioma e textos. Saída: lista de etapas (impressões só no modo CTR/CPM).
 */
function stagesOf(
  r: FunnelResult, input: FunnelInput, locale: AppLocale, s: FunnelStrings,
): Stage[] {
  const rates = {
    ctrBp: input.media.kind === "ctr-cpm" ? input.media.ctrBp : null,
    clickBp: input.clickToLeadBp,
    leadBp: input.leadToSaleBp,
  };
  const out: Stage[] = [];
  if (r.impressions !== null) out.push({ key: "impressions", label: s.stageImpressions, value: r.impressions, rate: null });
  out.push({ key: "clicks", label: s.stageClicks, value: r.clicks, rate: rates.ctrBp === null ? null : formatBp(rates.ctrBp, locale) });
  out.push({ key: "leads", label: s.stageLeads, value: r.leads, rate: formatBp(rates.clickBp, locale) });
  out.push({ key: "sales", label: s.stageSales, value: r.sales, rate: formatBp(rates.leadBp, locale) });
  return out;
}

/**
 * Funil em barras simples: cada etapa traz nome, quantidade e taxa em TEXTO.
 *
 * Onde: Ui.tsx, acima dos números. A barra é só reforço visual (aria-hidden) e
 * mostra a ordem das etapas, não a proporção real (que seria ilegível).
 * Entradas: resultado, entrada, idioma e textos. Saída: lista ordenada.
 */
export function FunnelBars(p: { r: FunnelResult; input: FunnelInput; locale: AppLocale; s: FunnelStrings }) {
  const stages = stagesOf(p.r, p.input, p.locale, p.s);
  const step = stages.length > 1 ? 60 / (stages.length - 1) : 0;
  return (
    <section class="stack" aria-labelledby="fb-funnel-title">
      <h4 id="fb-funnel-title">{p.s.funnelTitle}</h4>
      <ol class="fb-funnel">
        {stages.map((st, i) => (
          <li key={st.key}>
            <div class="fb-line">
              <span class="fb-label">{st.label}</span>
              <strong class="fb-value" data-testid={`stage-${st.key}`}>{formatNumber(st.value, 0, p.locale)}</strong>
              {st.rate && st.key !== "impressions" && (
                <span class="hint">{p.s.stageRate[st.key]}: {st.rate}</span>
              )}
            </div>
            <div class="fb-bar" aria-hidden="true" style={{ width: `${100 - i * step}%` }} />
          </li>
        ))}
      </ol>
    </section>
  );
}
