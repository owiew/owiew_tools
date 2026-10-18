import { type MatchType, combineKeywords, keywordRowsToCsv } from "@owiew/core/keywords";
import { useMemo, useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { type Lang } from "../../src/i18n/locales";
import { strings } from "./strings";
import "./styles.css";

const LIMITS = [1000, 5000, 10_000, 50_000, 100_000] as const;

/**
 * Ilha do Combinador de palavras-chave: listas A, B e C, tipos de correspondência e saída.
 *
 * Onde: montada por Page.astro. Entrada: idioma. Fluxo: textareas -> linhas ->
 * core.combineKeywords (produto cartesiano com limite, normalização e aviso de
 * tamanho do Google) -> texto copiável e CSV (protegido contra injeção de
 * fórmula pelo core). Tudo local; vem com exemplo (24 linhas) preenchido.
 */
export default function KeywordCombiner({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [a, setA] = useState(s.example.a);
  const [b, setB] = useState(s.example.b);
  const [c, setC] = useState(s.example.c);
  const [types, setTypes] = useState<readonly MatchType[]>(["broad", "phrase", "exact"]);
  const [limit, setLimit] = useState(5000);
  const [lowercase, setLowercase] = useState(true);
  const [stripAccents, setStripAccents] = useState(false);

  const result = useMemo(() => combineKeywords({
    lists: [a, b, c].map((t) => t.split(/\r?\n/)), matchTypes: types, limit,
    normalize: { lowercase, stripAccents, stripSymbols: true },
  }), [a, b, c, types, limit, lowercase, stripAccents]);

  const toggle = (t: MatchType): void => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);
  const text = result.ok ? result.value.items.map((i) => i.text).join("\n") : "";
  const lists: readonly (readonly [string, string, string, (v: string) => void])[] = [["kc-a", s.listA, a, setA], ["kc-b", s.listB, b, setB], ["kc-c", s.listC, c, setC]];

  return (
    <div class="tool-ui">
      <div class="row">
        {lists.map(([id, label, value, set]) => (
          <div class="field">
            <label for={id}>{label}</label>
            <textarea id={id} value={value} spellcheck={false} aria-describedby="kc-hint" onInput={(e) => set(e.currentTarget.value)} />
          </div>
        ))}
      </div>
      <span class="hint" id="kc-hint">{s.listHint}</span>
      <div class="row">
        <fieldset class="stack">
          <legend>{s.matchTypes}</legend>
          {(["broad", "phrase", "exact"] as const).map((t) => (
            <label class="check"><input type="checkbox" checked={types.includes(t)} onChange={() => toggle(t)} />{s[t]}</label>
          ))}
        </fieldset>
        <fieldset class="stack">
          <legend>{s.options}</legend>
          <label class="check"><input type="checkbox" checked={lowercase} onChange={() => setLowercase(!lowercase)} />{s.lowercase}</label>
          <label class="check"><input type="checkbox" checked={stripAccents} onChange={() => setStripAccents(!stripAccents)} />{s.stripAccents}</label>
        </fieldset>
        <div class="field">
          <label for="kc-limit">{s.limit}</label>
          <select id="kc-limit" value={String(limit)} onChange={(e) => setLimit(Number(e.currentTarget.value))}>
            {LIMITS.map((n) => <option value={String(n)}>{n.toLocaleString(lang)}</option>)}
          </select>
        </div>
      </div>
      <section class="stack" aria-labelledby="kc-results" aria-live="polite">
        <h3 id="kc-results">{s.results}</h3>
        {result.ok ? (
          <>
            <p role="status" data-testid="kc-summary"><strong>{s.summary(result.value.items.length, result.value.total)}</strong></p>
            {result.value.truncated && <Notice kind="info">{s.truncated(result.value.total)}</Notice>}
            {result.value.overLimit > 0 && <Notice kind="warn">{s.overLimit(result.value.overLimit)}</Notice>}
            <div class="field">
              <label for="kc-output">{s.output}</label>
              <textarea id="kc-output" class="tall" readOnly value={text} spellcheck={false} />
            </div>
            <div class="btn-row">
              <CopyButton primary text={text} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} />
              <button type="button" class="btn" onClick={() => downloadText("keywords.csv", keywordRowsToCsv(result.value.items, "keyword"), "text/csv;charset=utf-8")}>
                <Icon name="download" size={18} />{s.exportCsv}
              </button>
            </div>
          </>
        ) : (
          <Notice kind="warn">{s.errors[result.error] ?? result.error}</Notice>
        )}
      </section>
    </div>
  );
}
