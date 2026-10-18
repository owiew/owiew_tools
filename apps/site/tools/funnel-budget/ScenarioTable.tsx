import { type AppLocale, formatCents, formatNumber } from "@owiew/core";
import { type ScenarioRow } from "@owiew/core/funnel";
import { type FunnelStrings } from "./strings";

/**
 * Rótulo do fator de um cenário ("taxas -20%", "taxas +20%", "taxas 0%").
 *
 * Onde: etapa interna de `ScenarioTable`. Entradas: fator em % (80 = -20%) e
 * textos. Saída: texto curto. Sem efeitos.
 */
function factorLabel(factorPct: number, s: FunnelStrings): string {
  const d = factorPct - 100;
  return `${s.scenarioRates} ${d > 0 ? "+" : d < 0 ? "-" : ""}${Math.abs(d)}%`;
}

/**
 * Tabela de cenários (pessimista, base, otimista) com as quantidades e a verba.
 *
 * Onde: Ui.tsx, depois dos números principais. Entradas: linhas do core,
 * moeda, idioma, textos e se o modo é CTR/CPM e se há ticket (colunas
 * condicionais). Saída: tabela em container com rolagem (360px sem rolar a
 * página). Cenário que estoura o limite mostra aviso em texto na linha.
 */
export function ScenarioTable(p: {
  rows: readonly ScenarioRow[]; currency: string; locale: AppLocale; s: FunnelStrings;
  showImpressions: boolean; showRoas: boolean;
}) {
  const { s, locale, currency } = p;
  const n = (v: number): string => formatNumber(v, 0, locale);
  const money = (c: number): string => formatCents(c, currency, locale);
  const span = 4 + (p.showImpressions ? 1 : 0) + (p.showRoas ? 1 : 0);
  return (
    <section class="stack" aria-labelledby="fb-scenarios-title">
      <h4 id="fb-scenarios-title">{s.scenariosTitle}</h4>
      <p class="hint">{s.scenariosHint}</p>
      <div class="table-wrap" tabIndex={0} role="region" aria-label={s.scenariosTitle}>
        <table class="fb-scenarios">
          <thead>
            <tr>
              <th scope="col">{s.colScenario}</th>
              <th scope="col">{s.leads}</th>
              <th scope="col">{s.clicks}</th>
              {p.showImpressions && <th scope="col">{s.impressions}</th>}
              <th scope="col">{s.budget}</th>
              <th scope="col">{s.cpa}</th>
              {p.showRoas && <th scope="col">{s.roas}</th>}
            </tr>
          </thead>
          <tbody>
            {p.rows.map(({ scenario, result }) => (
              <tr key={scenario.id}>
                <th scope="row">
                  {s.scenarioName[scenario.id]}
                  <span class="hint">{factorLabel(scenario.factorPct, s)}</span>
                </th>
                {result.ok ? (
                  <>
                    <td data-testid={`sc-${scenario.id}-leads`}>{n(result.value.leads)}</td>
                    <td data-testid={`sc-${scenario.id}-clicks`}>{n(result.value.clicks)}</td>
                    {p.showImpressions && <td>{result.value.impressions === null ? s.notAvailable : n(result.value.impressions)}</td>}
                    <td data-testid={`sc-${scenario.id}-budget`}>{money(result.value.budgetCents)}</td>
                    <td>{money(result.value.cpaCents)}</td>
                    {p.showRoas && <td>{result.value.roas === null ? s.notAvailable : `${formatNumber(result.value.roas, 2, locale)}x`}</td>}
                  </>
                ) : (
                  <td colSpan={span - 1}>{s.scenarioError}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
