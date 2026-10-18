import { type WhatsappError, buildWhatsappLink } from "@owiew/core/whatsapp";
import { useMemo, useState } from "preact/hooks";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { Icon } from "../../src/components/Icon";
import { type Lang } from "../../src/i18n/locales";
import "./styles.css";
import { DEFAULT_CODE, strings } from "./strings";

/** Campo a que cada erro pertence (para mostrar a mensagem junto dele). */
type FieldId = "code" | "phone" | "message" | "url" | "source" | "medium" | "campaign";

/**
 * Descobre em que campo mostrar um erro do core.
 *
 * Onde: Ui.tsx. Entrada: código de erro. Saída: id lógico do campo.
 */
function fieldOf(error: WhatsappError): FieldId {
  switch (error) {
    case "message-too-long": case "invalid-message": return "message";
    case "utm-without-url": case "empty-url": case "invalid-url": case "unsupported-scheme": case "url-too-long": return "url";
    case "invalid-country-code": return "code";
    case "missing-source": return "source";
    case "missing-medium": return "medium";
    case "missing-campaign": return "campaign";
    default: return "phone";
  }
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string | undefined;
  onInput: (v: string) => void;
  multiline?: boolean;
  inputMode?: "tel" | "numeric" | "url";
  extra?: string;
}

/**
 * Campo de texto (ou área de texto) com rótulo, dica e erro ligados por aria.
 *
 * Onde: Ui.tsx. Entradas: ver FieldProps. Saída: bloco `.field` acessível.
 */
function Field(p: FieldProps) {
  const described = [p.hint ? `${p.id}-hint` : "", p.extra ? `${p.id}-extra` : "", p.error ? `${p.id}-err` : ""].filter(Boolean).join(" ");
  const common = { id: p.id, value: p.value, autocomplete: "off", "aria-invalid": p.error ? ("true" as const) : ("false" as const), "aria-describedby": described || undefined };
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      {p.multiline ? (
        <textarea {...common} rows={4} onInput={(e) => p.onInput(e.currentTarget.value)} />
      ) : (
        <input {...common} type="text" spellcheck={false} inputMode={p.inputMode ?? "text"} onInput={(e) => p.onInput(e.currentTarget.value)} />
      )}
      {p.hint && <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>}
      {p.extra && <span class="hint" id={`${p.id}-extra`}>{p.extra}</span>}
      {p.error && <span class="field-error" id={`${p.id}-err`}>{p.error}</span>}
    </div>
  );
}

/**
 * Ilha do Gerador de link de WhatsApp.
 *
 * Onde: montada por Page.astro. Entrada: idioma. Fluxo: campos -> core
 * (`buildWhatsappLink`: número, encoding, UTM) -> link + prévia + copiar/testar.
 * Nada é enviado: o botão de teste é um link que só navega quando clicado.
 */
export default function WhatsappLink({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [code, setCode] = useState(DEFAULT_CODE[lang]);
  const [phone, setPhone] = useState(s.example.phone);
  const [message, setMessage] = useState(s.example.message);
  const [url, setUrl] = useState(s.example.url);
  const [utmOn, setUtmOn] = useState(true);
  const [source, setSource] = useState(s.example.source);
  const [medium, setMedium] = useState(s.example.medium);
  const [campaign, setCampaign] = useState(s.example.campaign);

  const result = useMemo(
    () => buildWhatsappLink({ countryCode: code, phone, message, destinationUrl: url, ...(utmOn ? { utm: { source, medium, campaign } } : {}) }),
    [code, phone, message, url, utmOn, source, medium, campaign],
  );
  const international = /^\s*(\+|00)/.test(phone);
  const err = (id: FieldId): string | undefined => {
    if (result.ok) return undefined;
    const where = fieldOf(result.error);
    return (where === "code" && international ? "phone" : where) === id ? (s.errors[result.error] ?? result.error) : undefined;
  };
  const count = [...message].length;

  return (
    <div class="tool-ui">
      <div class="row">
        <Field id="wa-code" label={s.countryCode} hint={s.countryCodeHint} value={code} onInput={setCode} inputMode="numeric" error={err("code")} />
        <Field id="wa-phone" label={s.phone} hint={s.phoneHint} value={phone} onInput={setPhone} inputMode="tel" error={err("phone")} />
      </div>
      <Field id="wa-message" label={s.message} hint={s.messageHint} extra={s.charCount(count, 1000)} value={message} onInput={setMessage} multiline error={err("message")} />
      <Field id="wa-url" label={s.url} hint={s.urlHint} value={url} onInput={setUrl} inputMode="url" error={err("url")} />
      <label class="check" for="wa-utm-on">
        <input id="wa-utm-on" type="checkbox" checked={utmOn} onChange={(e) => setUtmOn(e.currentTarget.checked)} />
        {s.addUtm}
      </label>
      {utmOn && (
        <div class="stack">
          <div class="row">
            <Field id="wa-source" label={s.source} value={source} onInput={setSource} error={err("source")} />
            <Field id="wa-medium" label={s.medium} value={medium} onInput={setMedium} error={err("medium")} />
            <Field id="wa-campaign" label={s.campaign} value={campaign} onInput={setCampaign} error={err("campaign")} />
          </div>
          <span class="hint">{s.utmHint}</span>
        </div>
      )}

      <section class="output" aria-labelledby="wa-result-title" aria-live="polite">
        <h3 id="wa-result-title">{s.result}</h3>
        {result.ok ? (
          <div class="stack">
            <p class="output-url" data-testid="wa-output" aria-label={s.linkLabel}>{result.value.link}</p>
            {result.value.warnings.map((w) => <Notice kind="info">{s.warnings[w] ?? w}</Notice>)}
            <div>
              <strong>{s.preview}</strong>
              {result.value.text === "" ? <p class="hint">{s.previewEmpty}</p> : <p class="wa-preview" data-testid="wa-preview">{result.value.text}</p>}
            </div>
            <div class="btn-row">
              <CopyButton primary text={result.value.link} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} />
              <a class="btn" href={result.value.link} target="_blank" rel="noopener noreferrer">
                <Icon name="external-link" size={18} />
                {s.test} <span class="hint">({s.testHint})</span>
              </a>
            </div>
          </div>
        ) : (
          <Notice kind="warn">{s.errors[result.error] ?? result.error}</Notice>
        )}
      </section>
    </div>
  );
}
