import { DATE_FORMATS, type BlockKey, type DateFormat, type TextBlockKey } from "@owiew/core/naming";
import { ArrowDown, ArrowUp } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { type NamingStrings } from "./strings";

export interface BlocksProps {
  s: NamingStrings;
  order: readonly BlockKey[];
  onOrder: (next: BlockKey[]) => void;
  values: Record<TextBlockKey, string>;
  onValue: (key: TextBlockKey, value: string) => void;
  dateIso: string;
  onDate: (iso: string) => void;
  dateFormat: DateFormat;
  onDateFormat: (f: DateFormat) => void;
  dateError: string | null;
  valueErrors: Partial<Record<TextBlockKey, string>>;
}

/**
 * Troca um bloco de lugar com o vizinho.
 *
 * Onde: botões subir/descer do BlocksPanel. Entradas: ordem, índice e sentido
 * (-1 sobe, +1 desce). Saída: nova lista (a mesma se o movimento sair dos limites).
 */
export function moveBlock(order: readonly BlockKey[], index: number, delta: -1 | 1): BlockKey[] {
  const next = [...order];
  const to = index + delta;
  const a = next[index];
  const b = next[to];
  if (a === undefined || b === undefined) return next;
  next[index] = b;
  next[to] = a;
  return next;
}

/**
 * Lista ordenada de blocos: campo de cada bloco, botões de ordem e opções de data.
 *
 * Onde: Ui.tsx, nas abas "um nome" e "em lote". Fluxo: o usuário digita ou move
 * blocos -> o estado sobe para Ui.tsx -> core.buildName. Cada mudança de ordem é
 * anunciada em região aria-live e o foco volta ao botão que foi usado.
 */
export function BlocksPanel(p: BlocksProps) {
  const { s } = p;
  const [announce, setAnnounce] = useState("");
  const focusId = useRef<string | null>(null);

  useEffect(() => {
    if (focusId.current) document.getElementById(focusId.current)?.focus();
    focusId.current = null;
  }, [p.order]);

  /** Move o bloco, anuncia a nova posição e pede foco de volta. */
  function move(index: number, delta: -1 | 1): void {
    const key = p.order[index];
    if (!key) return;
    const target = index + delta;
    const atEdge = delta === -1 ? target === 0 : target === p.order.length - 1;
    focusId.current = `nm-${atEdge ? (delta === -1 ? "down" : "up") : delta === -1 ? "up" : "down"}-${key}`;
    setAnnounce(s.moved(s.blockNames[key], target + 1, p.order.length));
    p.onOrder(moveBlock(p.order, index, delta));
  }

  /** Desenha o campo de um bloco: texto livre ou data. */
  function renderField(key: BlockKey) {
    const id = `nm-field-${key}`;
    if (key === "date") {
      return (
        <div class="field">
          <label for={id}>{s.blockLabels.date}</label>
          <input id={id} type="date" value={p.dateIso} aria-invalid={p.dateError ? "true" : "false"} aria-describedby={`${id}-hint${p.dateError ? ` ${id}-err` : ""}`} onInput={(e) => p.onDate(e.currentTarget.value)} />
          <span class="hint" id={`${id}-hint`}>{p.dateIso === "" ? s.dateEmpty : s.blockHints.date}</span>
          {p.dateError && <span class="field-error" id={`${id}-err`}>{p.dateError}</span>}
        </div>
      );
    }
    const err = p.valueErrors[key];
    return (
      <div class="field">
        <label for={id}>{s.blockLabels[key]}</label>
        <input id={id} type="text" autocomplete="off" spellcheck={false} value={p.values[key]} aria-invalid={err ? "true" : "false"} aria-describedby={`${id}-hint${err ? ` ${id}-err` : ""}`} onInput={(e) => p.onValue(key, e.currentTarget.value)} />
        <span class="hint" id={`${id}-hint`}>{s.blockHints[key]}</span>
        {err && <span class="field-error" id={`${id}-err`}>{err}</span>}
      </div>
    );
  }

  return (
    <fieldset class="stack">
      <legend>{s.blocksTitle}</legend>
      <p class="hint">{s.blocksHint}</p>
      <ol class="nm-blocks">
        {p.order.map((key, i) => (
          <li class="nm-block" key={key}>
            <span class="nm-pos" aria-hidden="true">{i + 1}</span>
            {renderField(key)}
            <div class="nm-move">
              <button type="button" id={`nm-up-${key}`} class="btn" disabled={i === 0} aria-label={s.moveUp(s.blockNames[key])} onClick={() => move(i, -1)}><ArrowUp size={18} aria-hidden="true" /></button>
              <button type="button" id={`nm-down-${key}`} class="btn" disabled={i === p.order.length - 1} aria-label={s.moveDown(s.blockNames[key])} onClick={() => move(i, 1)}><ArrowDown size={18} aria-hidden="true" /></button>
            </div>
            {key === "date" && (
              <div class="nm-date-extra">
                <div class="field">
                  <label for="nm-date-format">{s.dateFormat}</label>
                  <select id="nm-date-format" value={p.dateFormat} onChange={(e) => p.onDateFormat(e.currentTarget.value as DateFormat)}>
                    {DATE_FORMATS.map((f) => <option value={f}>{s.dateFormats[f]}</option>)}
                  </select>
                </div>
                <button type="button" class="btn" onClick={() => p.onDate(todayIso())}>{s.useToday}</button>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p class="sr-only" role="status">{announce}</p>
    </fieldset>
  );
}

/**
 * Data de hoje no formato AAAA-MM-DD (fuso do navegador).
 *
 * Onde: só no clique de "usar a data de hoje", nunca na renderização, para o
 * build ser determinístico. Saída: texto ISO. Efeito: lê o relógio.
 */
function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
