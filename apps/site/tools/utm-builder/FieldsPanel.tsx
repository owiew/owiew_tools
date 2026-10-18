import { type UtmFields } from "@owiew/core";
import { type UtmStrings } from "./strings";

/** Campos editáveis do formulário (todos texto cru; o core normaliza). */
export interface FormState {
  readonly url: string;
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly term: string;
  readonly content: string;
  readonly id: string;
}

/**
 * Converte o estado do formulário em UtmFields do core.
 *
 * Onde: Ui.tsx, antes de chamar buildUtmUrl/buildBatch. Entrada: estado.
 * Saída: UtmFields (strings vazias são tratadas como ausentes pelo core).
 */
export function toFields(f: FormState): UtmFields {
  return { source: f.source, medium: f.medium, campaign: f.campaign, term: f.term, content: f.content, id: f.id };
}

interface Props {
  s: UtmStrings;
  value: FormState;
  onChange: (next: FormState) => void;
  showUrl: boolean;
}

/**
 * Campo de texto com rótulo, dica e marca de opcional.
 *
 * Onde: FieldsPanel. Entradas: id, rótulo, dica, valor e callback.
 * Saída: bloco `.field` acessível (label ligado ao input, dica por aria-describedby).
 */
function TextField(p: { id: string; label: string; hint?: string; value: string; onInput: (v: string) => void; optional?: string; required?: boolean }) {
  return (
    <div class="field">
      <label for={p.id}>{p.label}{p.optional ? <span class="hint"> ({p.optional})</span> : null}</label>
      <input id={p.id} type="text" value={p.value} autocomplete="off" spellcheck={false} required={p.required ?? false} aria-describedby={p.hint ? `${p.id}-hint` : undefined} onInput={(e) => p.onInput(e.currentTarget.value)} />
      {p.hint && <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>}
    </div>
  );
}

/**
 * Formulário dos campos de UTM (e da URL, no modo "um link").
 *
 * Onde: Ui.tsx. Entradas: textos, estado e callback. No modo lote a URL some e
 * os campos viram valores padrão para as linhas sem coluna própria.
 */
export function FieldsPanel({ s, value, onChange, showUrl }: Props) {
  const set = (k: keyof FormState) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <div class="stack">
      {showUrl && <TextField id="utm-url" label={s.url} hint={s.urlHint} value={value.url} onInput={set("url")} required />}
      <div class="row">
        <TextField id="utm-source" label={s.source} hint={s.sourceHint} value={value.source} onInput={set("source")} required />
        <TextField id="utm-medium" label={s.medium} hint={s.mediumHint} value={value.medium} onInput={set("medium")} required />
        <TextField id="utm-campaign" label={s.campaign} hint={s.campaignHint} value={value.campaign} onInput={set("campaign")} required />
      </div>
      <div class="row">
        <TextField id="utm-term" label={s.term} value={value.term} onInput={set("term")} optional={s.optional} />
        <TextField id="utm-content" label={s.content} value={value.content} onInput={set("content")} optional={s.optional} />
        <TextField id="utm-id" label={s.id} value={value.id} onInput={set("id")} optional={s.optional} />
      </div>
    </div>
  );
}
