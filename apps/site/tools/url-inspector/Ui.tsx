import { type Inspection, type Issue, inspectUrl } from "@owiew/core";
import { useMemo, useState } from "preact/hooks";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { CodecPanel } from "./CodecPanel";
import { type InspectorStrings, strings } from "./strings";

const SEVERITY_KIND = { error: "err", warning: "warn", info: "info" } as const;

/**
 * Resumo da estrutura do link (protocolo, domínio, porta, caminho, fragmento).
 *
 * Onde: Ui.tsx, quando a URL é válida. Entradas: relatório e textos.
 * Saída: lista de definição somente leitura.
 */
function Summary({ r, s }: { r: Inspection; s: InspectorStrings }) {
  const rows: [string, string][] = [
    [s.protocol, r.protocol],
    [s.host, r.host],
    [s.port, r.port || s.none],
    [s.path, r.path],
    [s.fragment, r.hash || s.none],
  ];
  return (
    <dl class="stat-grid compact" aria-label={s.summary}>
      {rows.map(([k, v]) => (
        <div class="stat"><dt>{k}</dt><dd><code>{v}</code></dd></div>
      ))}
    </dl>
  );
}

/**
 * Lista de alertas ordenada por gravidade (erro, atenção, informação).
 *
 * Onde: Ui.tsx. Entradas: achados do core e textos. Saída: um aviso com ícone
 * e rótulo textual por achado (gravidade nunca depende só de cor).
 */
function IssueList({ issues, s }: { issues: readonly Issue[]; s: InspectorStrings }) {
  const order = { error: 0, warning: 1, info: 2 } as const;
  const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
  if (sorted.length === 0) return <Notice kind="ok">{s.noIssues}</Notice>;
  return (
    <div class="stack">
      {sorted.map((i) => (
        <Notice kind={SEVERITY_KIND[i.severity]}>
          <strong>{s.severity[i.severity]}: </strong>
          {s.issueText[i.code](i.param ?? "")}
        </Notice>
      ))}
    </div>
  );
}

/**
 * Tabela de parâmetros com valor decodificado, tipo e plataforma do clique.
 *
 * Onde: Ui.tsx. Entradas: relatório e textos. Saída: tabela com rolagem
 * horizontal interna (nunca no body) em telas estreitas.
 */
function ParamTable({ r, s }: { r: Inspection; s: InspectorStrings }) {
  if (r.params.length === 0) return <p class="hint">{s.noParams}</p>;
  return (
    <div class="table-wrap" tabIndex={0} role="region" aria-label={`${s.colName} / ${s.colValue}`}>
      <table>
        <thead>
          <tr><th scope="col">{s.colName}</th><th scope="col">{s.colValue}</th><th scope="col">{s.colType}</th></tr>
        </thead>
        <tbody>
          {r.params.map((p) => (
            <tr key={p.index}>
              <td><code>{p.key}</code></td>
              <td><code>{p.value === "" ? "—" : p.value}</code></td>
              <td>
                <span class="tag">{p.kind === "utm" ? s.types.utm : p.kind === "click-id" ? s.types.click : s.types.other}</span>
                {p.clickId && <div class="hint"><strong>{p.clickId.platform}.</strong> {s.clickNote[p.clickId.note]}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Ilha do Inspetor de URL: cola o link, vê parâmetros, alertas e o codec.
 *
 * Onde: montada por Page.astro. Entrada: idioma. Fluxo: textarea ->
 * core.inspectUrl (nunca lança) -> estrutura + alertas + tabela. 100% local.
 */
export default function UrlInspector({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [text, setText] = useState("");
  const result = useMemo(() => (text.trim() === "" ? null : inspectUrl(text)), [text]);
  return (
    <div class="tool-ui">
      <div class="field">
        <label for="inspect-url">{s.label}</label>
        <textarea id="inspect-url" value={text} spellcheck={false} aria-describedby="inspect-hint" onInput={(e) => setText(e.currentTarget.value)} />
        <span class="hint" id="inspect-hint">{s.hint}</span>
      </div>
      <div aria-live="polite" class="stack">
        {result === null && <p class="hint">{s.empty}</p>}
        {result && !result.ok && <Notice kind="err">{s.errors[result.error] ?? result.error}</Notice>}
        {result?.ok && (
          <>
            <section class="stack" aria-labelledby="ins-summary"><h3 id="ins-summary">{s.summary}</h3><Summary r={result.value} s={s} /></section>
            <section class="stack" aria-labelledby="ins-issues"><h3 id="ins-issues">{s.issues}</h3><IssueList issues={result.value.issues} s={s} /></section>
            <section class="stack" aria-labelledby="ins-params"><h3 id="ins-params">{s.params}</h3><ParamTable r={result.value} s={s} /></section>
          </>
        )}
      </div>
      <CodecPanel s={s} />
    </div>
  );
}
