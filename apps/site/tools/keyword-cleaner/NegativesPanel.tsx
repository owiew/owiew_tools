import { type MatchType, formatKeyword, keywordRowsToCsv, seedNegatives, suggestNegatives } from "@owiew/core/keywords";
import { useMemo, useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { type Lang } from "../../src/i18n/locales";
import { type CleanerStrings } from "./strings";

/**
 * Painel "Gerar negativas": termos de pesquisa + suas palavras-chave -> palavras a negativar.
 *
 * Onde: Ui.tsx, aba Negativas. Fluxo: textareas -> core.suggestNegatives
 * (palavras dos termos que não estão nas suas palavras-chave, por frequência)
 * + lista-semente opcional do idioma -> sintaxe do tipo de correspondência ->
 * texto copiável e CSV com `kind = negative`. Tudo local; é SUGESTÃO, o
 * usuário revisa antes de aplicar.
 */
export function NegativesPanel({ lang, s, example }: { lang: Lang; s: CleanerStrings; example: { terms: string; keep: string } }) {
  const [terms, setTerms] = useState(example.terms);
  const [keep, setKeep] = useState(example.keep);
  const [minCount, setMinCount] = useState(1);
  const [seeds, setSeeds] = useState(false);
  const [type, setType] = useState<MatchType>("phrase");

  const lines = (t: string): string[] => t.split(/\r?\n/);
  const suggestion = useMemo(() => suggestNegatives({ searchTerms: lines(terms), keepKeywords: lines(keep), minCount }), [terms, keep, minCount]);
  const words = useMemo(() => {
    const base = suggestion.ok ? suggestion.value.map((x) => x.word) : [];
    return seeds ? [...new Set([...base, ...seedNegatives(lang)])] : base;
  }, [suggestion, seeds, lang]);
  const text = words.map((w) => formatKeyword(w, type)).join("\n");

  return (
    <div class="stack">
      <div class="row">
        <div class="field">
          <label for="neg-terms">{s.searchTerms}</label>
          <textarea id="neg-terms" class="tall" value={terms} spellcheck={false} aria-describedby="neg-terms-hint" onInput={(e) => setTerms(e.currentTarget.value)} />
          <span class="hint" id="neg-terms-hint">{s.searchTermsHint}</span>
        </div>
        <div class="field">
          <label for="neg-keep">{s.keepKeywords}</label>
          <textarea id="neg-keep" class="tall" value={keep} spellcheck={false} aria-describedby="neg-keep-hint" onInput={(e) => setKeep(e.currentTarget.value)} />
          <span class="hint" id="neg-keep-hint">{s.keepKeywordsHint}</span>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="neg-min">{s.minCount}</label>
          <select id="neg-min" value={String(minCount)} onChange={(e) => setMinCount(Number(e.currentTarget.value))}>
            {[1, 2, 3, 5, 10].map((n) => <option value={String(n)}>{n}</option>)}
          </select>
        </div>
        <div class="field">
          <label for="neg-type">{s.matchType}</label>
          <select id="neg-type" value={type} onChange={(e) => setType(e.currentTarget.value as MatchType)}>
            <option value="broad">{s.broad}</option>
            <option value="phrase">{s.phrase}</option>
            <option value="exact">{s.exact}</option>
          </select>
        </div>
        <div class="field">
          <label class="check"><input type="checkbox" checked={seeds} aria-describedby="neg-seeds-hint" onChange={() => setSeeds(!seeds)} />{s.seeds}</label>
          <span class="hint" id="neg-seeds-hint">{s.seedsHint}</span>
        </div>
      </div>
      <section class="stack" aria-labelledby="neg-results" aria-live="polite">
        <h3 id="neg-results">{s.suggestions}</h3>
        {!suggestion.ok && <Notice kind="warn">{s.errors[suggestion.error] ?? suggestion.error}</Notice>}
        {suggestion.ok && suggestion.value.length === 0 && <p class="hint">{s.none}</p>}
        {suggestion.ok && suggestion.value.length > 0 && (
          <div class="table-wrap">
            <table>
              <thead><tr><th scope="col">{s.colWord}</th><th scope="col">{s.colCount}</th></tr></thead>
              <tbody>{suggestion.value.slice(0, 100).map((x) => <tr><td>{x.word}</td><td>{x.count}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {words.length > 0 && (
          <>
            <div class="field">
              <label for="neg-output">{s.negativesOut}</label>
              <textarea id="neg-output" class="tall" readOnly value={text} spellcheck={false} />
              <span class="hint">{s.negativesNote}</span>
            </div>
            <div class="btn-row">
              <CopyButton primary text={text} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} />
              <button type="button" class="btn" onClick={() => downloadText("negative-keywords.csv", keywordRowsToCsv(words.map((keyword) => ({ keyword, type })), "negative"), "text/csv;charset=utf-8")}>
                <Icon name="download" size={18} />{s.exportCsv}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
