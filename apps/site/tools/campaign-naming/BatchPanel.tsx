import {
  MAX_NAMES, NAME_LENGTH_WARN, TEXT_BLOCK_KEYS, buildNameBatch, namingBatchToCsv, parseValueList,
  type BlockKey, type NamingInput, type TextBlockKey,
} from "@owiew/core/naming";
import { useMemo } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { type NamingStrings } from "./strings";

/** Máximo de linhas desenhadas na tabela (o CSV e o copiar levam todas). */
const MAX_ROWS_SHOWN = 200;

interface Props {
  s: NamingStrings;
  input: NamingInput;
  order: readonly BlockKey[];
  lists: Record<TextBlockKey, string>;
  onList: (key: TextBlockKey, text: string) => void;
}

/**
 * Painel do lote: listas por bloco, combinações, tabela, CSV e copiar.
 *
 * Onde: Ui.tsx, aba "em lote". Fluxo: textareas -> parseValueList -> core.buildNameBatch
 * (teto de 500) -> tabela + CSV (serializeCsv do core, com proteção a CSV injection)
 * gerado localmente. Nada é enviado a servidor.
 */
export function BatchPanel({ s, input, order, lists, onList }: Props) {
  const parsed = useMemo(() => {
    const out: Partial<Record<TextBlockKey, string[]>> = {};
    for (const k of TEXT_BLOCK_KEYS) out[k] = parseValueList(lists[k]);
    return out;
  }, [lists]);
  const anyList = TEXT_BLOCK_KEYS.some((k) => (parsed[k] ?? []).length > 0);
  const batch = useMemo(() => (anyList ? buildNameBatch(input, parsed) : null), [anyList, input, parsed]);
  const names = batch?.ok ? batch.value.items.map((i) => i.name) : [];

  return (
    <div class="stack">
      <p>{s.batchIntro}</p>
      {order.filter((k): k is TextBlockKey => k !== "date").map((k) => (
        <div class="field" key={k}>
          <label for={`nm-list-${k}`}>{s.batchLists[k]}</label>
          <textarea id={`nm-list-${k}`} value={lists[k]} spellcheck={false} aria-describedby={`nm-list-${k}-hint`} onInput={(e) => onList(k, e.currentTarget.value)} />
          <span class="hint" id={`nm-list-${k}-hint`}>{s.batchListHint}</span>
        </div>
      ))}
      <section class="stack" aria-live="polite" aria-labelledby="nm-batch-title">
        <h3 id="nm-batch-title">{s.result}</h3>
        {batch === null && <p class="hint">{s.batchEmpty}</p>}
        {batch && !batch.ok && <Notice kind="err">{s.batchErrors[batch.error] ?? batch.error}</Notice>}
        {batch?.ok && (
          <>
            <p role="status" data-testid="naming-batch-summary"><strong>{s.batchSummary(names.length, MAX_NAMES)}</strong></p>
            {batch.value.duplicates > 0 && <Notice kind="info">{s.dupNote(batch.value.duplicates)}</Notice>}
            {batch.value.tooLong > 0 && <Notice kind="warn">{s.longNote(batch.value.tooLong, NAME_LENGTH_WARN)}</Notice>}
            <div class="btn-row">
              <button type="button" class="btn btn-primary" onClick={() => downloadText(s.csvFile, namingBatchToCsv(batch.value.items, order, s.csvLabels), "text/csv;charset=utf-8")}>
                <Icon name="download" size={18} />{s.exportCsv}
              </button>
              <CopyButton text={names.join("\n")} labels={{ copy: s.copyAll, copied: s.copied, failed: s.copyFailed }} />
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th scope="col">{s.colNum}</th><th scope="col">{s.colName}</th><th scope="col">{s.colLength}</th></tr></thead>
                <tbody>
                  {batch.value.items.slice(0, MAX_ROWS_SHOWN).map((item, i) => (
                    <tr key={item.name}><td>{i + 1}</td><td><code>{item.name}</code></td><td>{item.length}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {names.length > MAX_ROWS_SHOWN && <p class="hint">{s.truncated(MAX_ROWS_SHOWN, names.length)}</p>}
          </>
        )}
      </section>
    </div>
  );
}
