import { useState } from "preact/hooks";
import { Icon } from "../Icon";

/** Textos do botão de copiar (por idioma, vêm da ferramenta). */
export interface CopyLabels {
  readonly copy: string;
  readonly copied: string;
  readonly failed: string;
}

/**
 * Botão que copia um texto para a área de transferência.
 *
 * O quê: usa a Clipboard API local; se o navegador negar, avisa em vez de falhar calado.
 * Onde: resultados do gerador de UTM e de qualquer ferramenta que gere texto.
 * Entradas: texto a copiar, rótulos e flag primário. Efeito: escreve na área de
 * transferência (nada sai do navegador). Anuncia o resultado em região aria-live.
 */
export function CopyButton({ text, labels, primary = false, disabled = false }: { text: string; labels: CopyLabels; primary?: boolean; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  /** Copia e volta ao estado neutro depois de 2 s. */
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch (err) {
      console.error(err);
      setState("fail");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <>
      <button type="button" class={primary ? "btn btn-primary" : "btn"} disabled={disabled} onClick={() => void copy()}>
        <Icon name={state === "ok" ? "check" : "copy"} size={18} />
        {state === "ok" ? labels.copied : labels.copy}
      </button>
      <span class="sr-only" role="status">{state === "ok" ? labels.copied : state === "fail" ? labels.failed : ""}</span>
      {state === "fail" && <span class="hint" aria-hidden="true">{labels.failed}</span>}
    </>
  );
}
