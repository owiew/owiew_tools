import { type NameOutput, type NamingError, NAME_LENGTH_WARN } from "@owiew/core/naming";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { type Result } from "@owiew/core";
import { type NamingStrings } from "./strings";

/**
 * Resultado do modo "um nome": nome, tamanho, aviso e painel de decodificação.
 *
 * Onde: Ui.tsx, aba "um nome". Entradas: resultado do core, separador e textos.
 * Fluxo: buildName -> nome + partes -> copiar, e tabela bloco/trecho que mostra
 * como dividir o nome de volta no relatório. Região aria-live=polite.
 */
export function ResultPanel({ s, result, separator }: { s: NamingStrings; result: Result<NameOutput, NamingError>; separator: string }) {
  return (
    <section class="output stack" aria-labelledby="nm-result-title" aria-live="polite">
      <h3 id="nm-result-title">{s.result}</h3>
      {result.ok ? (
        <>
          <p class="nm-name" data-testid="naming-output">{result.value.name}</p>
          <p class="hint" data-testid="naming-length">{s.length(result.value.length)}</p>
          {result.value.warnings.includes("too-long") && <Notice kind="warn">{s.tooLong(NAME_LENGTH_WARN)}</Notice>}
          <div class="btn-row"><CopyButton primary text={result.value.name} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} /></div>
          <h4>{s.decodeTitle}</h4>
          <p>{s.decodeIntro(separator)}</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th scope="col">{s.colBlock}</th><th scope="col">{s.colPiece}</th></tr></thead>
              <tbody>
                {result.value.parts.map((p) => (
                  <tr key={p.key}><th scope="row">{s.blockNames[p.key]}</th><td><code>{p.text}</code></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p class="hint">{s.decodeSteps}</p>
        </>
      ) : (
        <Notice kind="info">{s.errors[result.error] ?? result.error}</Notice>
      )}
    </section>
  );
}
