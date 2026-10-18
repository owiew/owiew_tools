import { decodeComponent, encodeComponent } from "@owiew/core";
import { useState } from "preact/hooks";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { type InspectorStrings } from "./strings";

/**
 * Painel de codificar/decodificar texto como componente de URL.
 *
 * Onde: Ui.tsx, abaixo do relatório. Entradas: textos do idioma.
 * Fluxo: textarea -> core.encodeComponent/decodeComponent -> saídas copiáveis.
 * Decodificação inválida (% solto) vira aviso, nunca exceção.
 */
export function CodecPanel({ s }: { s: InspectorStrings }) {
  const [text, setText] = useState("");
  const encoded = encodeComponent(text);
  const decoded = decodeComponent(text, true);
  const labels = { copy: s.copy, copied: s.copied, failed: s.copyFailed };
  return (
    <section class="stack" aria-labelledby="codec-title">
      <h3 id="codec-title">{s.codec}</h3>
      <div class="field">
        <label for="codec-input">{s.codecLabel}</label>
        <textarea id="codec-input" value={text} spellcheck={false} onInput={(e) => setText(e.currentTarget.value)} />
      </div>
      {text !== "" && (
        <div class="row">
          <div class="output stack">
            <span class="label">{s.encoded}</span>
            <p class="output-url" data-testid="codec-encoded">{encoded}</p>
            <div class="btn-row"><CopyButton text={encoded} labels={labels} /></div>
          </div>
          <div class="output stack">
            <span class="label">{s.decoded}</span>
            {decoded.ok ? (
              <>
                <p class="output-url" data-testid="codec-decoded">{decoded.value}</p>
                <div class="btn-row"><CopyButton text={decoded.value} labels={labels} /></div>
              </>
            ) : (
              <Notice kind="warn">{s.decodeFailed}</Notice>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
