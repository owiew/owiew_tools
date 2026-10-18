import { buildUtmUrl } from "@owiew/core";
import { useMemo, useState } from "preact/hooks";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { type Lang } from "../../src/i18n/locales";
import { BatchPanel } from "./BatchPanel";
import { type FormState, FieldsPanel, toFields } from "./FieldsPanel";
import { RulesPanel } from "./RulesPanel";
import { warningTexts } from "./messages";
import { strings } from "./strings";
import { useSavedRules } from "./useSavedRules";

const EMPTY: FormState = { url: "", source: "", medium: "", campaign: "", term: "", content: "", id: "" };

/**
 * Ilha do Gerador de UTM: abas "um link" e "em lote", padrão de nomenclatura e resultado.
 *
 * Onde: montada por Page.astro na página da ferramenta (hidratada no navegador,
 * renderizada também no build para o crawler). Entrada: idioma da página.
 * Fluxo: formulário -> core.buildUtmUrl -> link + avisos -> copiar. Nenhuma
 * requisição de rede; o único dado persistido é o padrão, se o usuário salvar.
 */
export default function UtmBuilder({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [tab, setTab] = useState<"single" | "batch">("single");
  const [form, setForm] = useState<FormState>(EMPTY);
  const { rules, setRules, save, reset, storageOff, saved } = useSavedRules();

  const touched = form.url.trim() !== "" || form.source !== "" || form.medium !== "" || form.campaign !== "";
  const result = useMemo(() => buildUtmUrl(form.url, toFields(form), rules), [form, rules]);
  const fields = useMemo(() => toFields(form), [form]);

  return (
    <div class="tool-ui">
      <div class="btn-row" role="group" aria-label={`${s.single} / ${s.batch}`}>
        <button type="button" class={tab === "single" ? "btn btn-primary" : "btn"} aria-pressed={tab === "single"} onClick={() => setTab("single")}>{s.single}</button>
        <button type="button" class={tab === "batch" ? "btn btn-primary" : "btn"} aria-pressed={tab === "batch"} onClick={() => setTab("batch")}>{s.batch}</button>
      </div>

      <FieldsPanel s={s} value={form} onChange={setForm} showUrl={tab === "single"} />
      <RulesPanel s={s} rules={rules} onChange={setRules} onSave={save} onReset={reset} saved={saved} storageOff={storageOff} />

      {tab === "single" ? (
        <section class="output" aria-labelledby="utm-result-title" aria-live="polite">
          <h3 id="utm-result-title">{s.result}</h3>
          {result.ok ? (
            <div class="stack">
              <p class="output-url" data-testid="utm-output">{result.value.url}</p>
              {warningTexts(result.value.warnings, s).map((w) => <Notice kind="info">{w}</Notice>)}
              <div class="btn-row"><CopyButton primary text={result.value.url} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} /></div>
            </div>
          ) : touched ? (
            <Notice kind="warn">{s.errors[result.error] ?? result.error}</Notice>
          ) : (
            <p class="hint">{s.resultEmpty}</p>
          )}
        </section>
      ) : (
        <BatchPanel s={s} defaults={fields} rules={rules} />
      )}
    </div>
  );
}
