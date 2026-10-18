import { Icon } from "../../src/components/Icon";
import { type AdStrings } from "./strings";

/**
 * Campo de texto com contador de caracteres (como o Google conta) e aviso de excesso.
 *
 * Onde: painéis Google e Meta. Entradas: id, rótulo, valor, comprimento e limite
 * já calculados pelo core, textos, dica, `multiline` e remoção opcional.
 * Saída: rótulo + campo + contador. O excesso aparece em TEXTO ("3 acima do
 * limite") além da cor, e o campo recebe aria-invalid.
 */
export function CountedInput(p: {
  id: string; label: string; value: string; length: number; limit: number; s: AdStrings;
  hint?: string; multiline?: boolean; onInput: (v: string) => void; onRemove?: () => void;
}) {
  const over = Math.max(0, p.length - p.limit);
  const described = `${p.id}-count${p.hint ? ` ${p.id}-hint` : ""}`;
  const common = { id: p.id, value: p.value, autocomplete: "off", "aria-invalid": over > 0 ? ("true" as const) : ("false" as const), "aria-describedby": described };
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <div class="counted">
        {p.multiline ? (
          <textarea {...common} rows={4} spellcheck={false} onInput={(e) => p.onInput(e.currentTarget.value)} />
        ) : (
          <input {...common} type="text" spellcheck={false} onInput={(e) => p.onInput(e.currentTarget.value)} />
        )}
        {p.onRemove && (
          <button type="button" class="btn btn-quiet icon-btn" aria-label={p.s.remove(p.label)} onClick={p.onRemove}>
            <Icon name="trash-2" size={18} />
          </button>
        )}
      </div>
      <span class={over > 0 ? "counter is-over" : "counter"} id={`${p.id}-count`}>
        {p.s.counter(p.length, p.limit)}{over > 0 ? ` (${over} ${p.s.over})` : ""}
      </span>
      {p.hint && <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>}
    </div>
  );
}
