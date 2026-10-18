import { type BatchMode, type NamingRules, type UtmFields, batchToCsv, buildBatch, parseBatch } from "@owiew/core";
import { useMemo, useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { warningTexts } from "./messages";
import { type UtmStrings } from "./strings";

/** Máximo de linhas desenhadas na tabela (o CSV exportado leva todas). */
const MAX_ROWS_SHOWN = 200;

/**
 * Painel do modo lote: colar URLs ou CSV, gerar, ver erros por linha e exportar.
 *
 * Onde: Ui.tsx, aba "Em lote". Entradas: textos, campos padrão do formulário e
 * regras de nomenclatura. Fluxo: textarea -> parseBatch -> buildBatch -> tabela
 * -> CSV (com proteção contra CSV injection no core) baixado localmente.
 * Nada é enviado a servidor; o arquivo nasce de um Blob no navegador.
 */
export function BatchPanel({ s, defaults, rules }: { s: UtmStrings; defaults: UtmFields; rules: NamingRules }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<BatchMode>("urls");

  const parsed = useMemo(() => (text.trim() === "" ? null : parseBatch(text, mode)), [text, mode]);
  const results = useMemo(() => (parsed?.ok ? buildBatch(parsed.value, defaults, rules) : []), [parsed, defaults, rules]);
  const okUrls = results.flatMap((r) => (r.result.ok ? [r.result.value.url] : []));

  return (
    <div class="stack">
      <div class="field">
        <label for="batch-mode">{s.batchMode}</label>
        <select id="batch-mode" value={mode} onChange={(e) => setMode(e.currentTarget.value as BatchMode)}>
          <option value="urls">{s.modeUrls}</option>
          <option value="csv">{s.modeCsv}</option>
        </select>
      </div>
      <div class="field">
        <label for="batch-text">{s.batchInput}</label>
        <textarea id="batch-text" value={text} spellcheck={false} aria-describedby="batch-hint" onInput={(e) => setText(e.currentTarget.value)} />
        <span class="hint" id="batch-hint">{s.batchHint}</span>
      </div>
      {parsed && !parsed.ok && <Notice kind="err">{s.batchErrors[parsed.error] ?? parsed.error}</Notice>}
      {results.length > 0 && (
        <>
          <p role="status"><strong>{s.summary(okUrls.length, results.length - okUrls.length)}</strong></p>
          <div class="btn-row">
            <button type="button" class="btn btn-primary" onClick={() => downloadText("utm-links.csv", batchToCsv(results), "text/csv;charset=utf-8")}>
              <Icon name="download" size={18} />{s.exportCsv}
            </button>
            <CopyButton text={okUrls.join("\n")} disabled={okUrls.length === 0} labels={{ copy: s.copyAll, copied: s.copied, failed: s.copyFailed }} />
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">{s.colLine}</th><th scope="col">{s.colUrl}</th><th scope="col">{s.colStatus}</th></tr>
              </thead>
              <tbody>
                {results.slice(0, MAX_ROWS_SHOWN).map((r) => (
                  <tr key={r.row.line}>
                    <td>{r.row.line}</td>
                    <td>{r.result.ok ? <code>{r.result.value.url}</code> : <code>{r.row.url}</code>}</td>
                    <td>
                      {r.result.ok ? (
                        <>
                          <span class="tag">{s.statusOk}</span>
                          {warningTexts(r.result.value.warnings, s).map((w) => <div class="hint">{w}</div>)}
                        </>
                      ) : (
                        <span class="hint">{s.errors[r.result.error] ?? r.result.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > MAX_ROWS_SHOWN && <p class="hint">{s.truncated(MAX_ROWS_SHOWN, results.length)}</p>}
        </>
      )}
    </div>
  );
}
