import { type NamingRules } from "@owiew/core";
import { Icon } from "../../src/components/Icon";
import { Notice } from "../../src/components/ui/Notice";
import { type UtmStrings } from "./strings";

interface Props {
  s: UtmStrings;
  rules: NamingRules;
  onChange: (r: NamingRules) => void;
  onSave: () => void;
  onReset: () => void;
  saved: boolean;
  storageOff: boolean;
}

/**
 * Painel do padrão de nomenclatura (minúsculas, acentos, separador) com salvar/restaurar.
 *
 * Onde: Ui.tsx do Gerador de UTM, acima do resultado. Entradas: textos,
 * regras atuais e callbacks. Saída: formulário controlado; o salvamento em
 * localStorage fica no hook `useSavedRules`.
 */
export function RulesPanel({ s, rules, onChange, onSave, onReset, saved, storageOff }: Props) {
  return (
    <fieldset class="stack">
      <legend>{s.rulesTitle}</legend>
      <label class="check">
        <input type="checkbox" checked={rules.lowercase} onChange={(e) => onChange({ ...rules, lowercase: e.currentTarget.checked })} />
        {s.lowercase}
      </label>
      <label class="check">
        <input type="checkbox" checked={rules.stripAccents} onChange={(e) => onChange({ ...rules, stripAccents: e.currentTarget.checked })} />
        {s.stripAccents}
      </label>
      <div class="field">
        <label for="utm-sep">{s.separator}</label>
        <select id="utm-sep" value={rules.separator} onChange={(e) => onChange({ ...rules, separator: e.currentTarget.value as NamingRules["separator"] })}>
          <option value="-">{s.sepDash}</option>
          <option value="_">{s.sepUnderscore}</option>
          <option value=".">{s.sepDot}</option>
        </select>
      </div>
      <div class="btn-row">
        <button type="button" class="btn" onClick={onSave}><Icon name="save" size={18} />{s.savePattern}</button>
        <button type="button" class="btn btn-quiet" onClick={onReset}><Icon name="trash-2" size={18} />{s.resetPattern}</button>
      </div>
      <p role="status" class="hint">{saved ? s.saved : ""}</p>
      {storageOff && <Notice kind="warn">{s.storageOff}</Notice>}
    </fieldset>
  );
}
