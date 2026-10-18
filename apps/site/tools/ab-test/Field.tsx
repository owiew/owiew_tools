/**
 * Campo de texto com rótulo, dica e erro ligados por aria.
 *
 * Onde: painéis de significância e de amostra do Teste A/B. Entradas: id,
 * rótulo, dica, valor, erro e callback. Saída: bloco `.field` com aria-invalid
 * quando há erro (o erro é texto, não só cor).
 */
export function Field(p: { id: string; label: string; hint?: string; value: string; error: string | null; onInput: (v: string) => void }) {
  const describedBy = `${p.hint ? `${p.id}-hint ` : ""}${p.error ? `${p.id}-err` : ""}`.trim();
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <input id={p.id} type="text" inputMode="decimal" autocomplete="off" value={p.value} aria-invalid={p.error ? "true" : "false"} {...(describedBy ? { "aria-describedby": describedBy } : {})} onInput={(e) => p.onInput(e.currentTarget.value)} />
      {p.hint && <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>}
      {p.error && <span class="field-error" id={`${p.id}-err`}>{p.error}</span>}
    </div>
  );
}

/**
 * Lista suspensa com rótulo (confiança, poder, caudas).
 *
 * Onde: painéis do Teste A/B. Entradas: id, rótulo, valor, opções [valor, texto]
 * e callback. Saída: bloco `.field` com `<select>` nativo (teclado de graça).
 */
export function Choice(p: { id: string; label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (v: string) => void }) {
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <select id={p.id} value={p.value} onChange={(e) => p.onChange(e.currentTarget.value)}>
        {p.options.map(([v, t]) => <option value={v}>{t}</option>)}
      </select>
    </div>
  );
}
