import { SEPARATORS, type CaseMode, type NamingOptions, type NamingSeparator, wordJoiner } from "@owiew/core/naming";
import { type NamingStrings } from "./strings";

const CASES: readonly CaseMode[] = ["lower", "upper", "keep"];

/**
 * Painel do padrão de escrita: separador, caixa e remoção de acentos.
 *
 * Onde: Ui.tsx, entre os blocos e o resultado. Entradas: textos, opções e
 * callback. Saída: formulário controlado; explica o caractere que une palavras
 * dentro de um bloco (depende do separador escolhido).
 */
export function OptionsPanel({ s, options, onChange }: { s: NamingStrings; options: NamingOptions; onChange: (o: NamingOptions) => void }) {
  return (
    <fieldset class="stack">
      <legend>{s.optionsTitle}</legend>
      <div class="row">
        <div class="field">
          <label for="nm-sep">{s.separator}</label>
          <select id="nm-sep" value={options.separator} onChange={(e) => onChange({ ...options, separator: e.currentTarget.value as NamingSeparator })}>
            {SEPARATORS.map((sep) => <option value={sep}>{s.separators[sep]}</option>)}
          </select>
        </div>
        <div class="field">
          <label for="nm-case">{s.caseLabel}</label>
          <select id="nm-case" value={options.caseMode} onChange={(e) => onChange({ ...options, caseMode: e.currentTarget.value as CaseMode })}>
            {CASES.map((c) => <option value={c}>{s.cases[c]}</option>)}
          </select>
        </div>
      </div>
      <label class="check">
        <input type="checkbox" checked={options.stripAccents} onChange={(e) => onChange({ ...options, stripAccents: e.currentTarget.checked })} />
        {s.stripAccents}
      </label>
      <p class="hint">{s.joinerNote(options.separator, wordJoiner(options.separator))}</p>
    </fieldset>
  );
}
