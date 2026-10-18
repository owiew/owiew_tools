import { type CleanOptions, cleanKeywords, groupByTerm, groupsToCsv } from "@owiew/core/keywords";
import { useMemo, useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { type CleanerStrings } from "./strings";

/**
 * Painel "Limpar lista": opções, estatísticas, lista limpa (ou agrupada) e removidas.
 *
 * Onde: Ui.tsx, aba Limpar. Entradas: textos e o exemplo do idioma. Fluxo:
 * textarea -> core.cleanKeywords (separa, normaliza, deduplica, filtra por
 * limite do Google, ordena) -> opcionalmente core.groupByTerm -> texto
 * copiável e CSV (protegido contra injeção de fórmula pelo core). Local.
 */
export function CleanPanel({ s, example }: { s: CleanerStrings; example: string }) {
  const [text, setText] = useState(example);
  const [opts, setOpts] = useState<CleanOptions>({ lowercase: true, stripAccents: false, stripSymbols: true, ignoreWordOrder: false, removeOverLimit: true, sort: "none" });
  const [group, setGroup] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);

  const result = useMemo(() => cleanKeywords(text, opts), [text, opts]);
  const groups = useMemo(() => (group && result.ok ? groupByTerm(result.value.kept) : []), [group, result]);
  const flag = (k: "lowercase" | "stripAccents" | "stripSymbols" | "ignoreWordOrder" | "removeOverLimit"): void => setOpts({ ...opts, [k]: !opts[k] });
  const checks: readonly (readonly ["lowercase" | "stripAccents" | "stripSymbols" | "ignoreWordOrder" | "removeOverLimit", string])[] = [
    ["lowercase", s.lowercase], ["stripAccents", s.stripAccents], ["stripSymbols", s.stripSymbols], ["ignoreWordOrder", s.ignoreOrder], ["removeOverLimit", s.removeOverLimit],
  ];
  const kept = result.ok ? result.value.kept : [];
  const out = group ? groups.map((g) => `# ${g.term === "" ? s.groupOther : g.term}\n${g.keywords.join("\n")}`).join("\n\n") : kept.join("\n");

  return (
    <div class="stack">
      <div class="field">
        <label for="kcl-input">{s.input}</label>
        <textarea id="kcl-input" class="tall" value={text} spellcheck={false} aria-describedby="kcl-hint" onInput={(e) => setText(e.currentTarget.value)} />
        <span class="hint" id="kcl-hint">{s.inputHint}</span>
      </div>
      <div class="row">
        <fieldset class="stack">
          <legend>{s.options}</legend>
          {checks.map(([k, label]) => <label class="check"><input type="checkbox" checked={opts[k]} onChange={() => flag(k)} />{label}</label>)}
          <label class="check"><input type="checkbox" checked={group} onChange={() => setGroup(!group)} />{s.group}</label>
        </fieldset>
        <div class="field">
          <label for="kcl-sort">{s.sort}</label>
          <select id="kcl-sort" value={opts.sort} onChange={(e) => setOpts({ ...opts, sort: e.currentTarget.value === "az" ? "az" : "none" })}>
            <option value="none">{s.sortNone}</option>
            <option value="az">{s.sortAz}</option>
          </select>
        </div>
      </div>
      <section class="stack" aria-labelledby="kcl-results" aria-live="polite">
        <h3 id="kcl-results">{s.results}</h3>
        {result.ok ? (
          <>
            <p role="status" data-testid="kcl-stats"><strong>{s.stats(result.value.stats.input, result.value.stats.kept, result.value.stats.duplicates, result.value.stats.overLimit)}</strong></p>
            <div class="field">
              <label for="kcl-output">{s.output}</label>
              <textarea id="kcl-output" class="tall" readOnly value={out} spellcheck={false} />
            </div>
            <div class="btn-row">
              <CopyButton primary text={out} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} />
              <button type="button" class="btn" onClick={() => downloadText("keywords-clean.csv", groupsToCsv(group ? groups : [{ term: "", keywords: kept }]), "text/csv;charset=utf-8")}>
                <Icon name="download" size={18} />{s.exportCsv}
              </button>
            </div>
            {result.value.removed.length > 0 && (
              <div class="stack">
                <button type="button" class="btn btn-quiet" aria-expanded={showRemoved} aria-controls="kcl-removed" onClick={() => setShowRemoved(!showRemoved)}>
                  <Icon name="chevron-right" size={18} />{s.removed} ({result.value.removed.length})
                </button>
                <div class="table-wrap" id="kcl-removed" hidden={!showRemoved}>
                  <table>
                    <thead><tr><th scope="col">{s.colText}</th><th scope="col">{s.colReason}</th></tr></thead>
                    <tbody>
                      {result.value.removed.slice(0, 200).map((r) => <tr><td>{r.text}</td><td>{s.reasons[r.reason] ?? r.reason}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <Notice kind="warn">{s.errors[result.error] ?? result.error}</Notice>
        )}
      </section>
    </div>
  );
}
