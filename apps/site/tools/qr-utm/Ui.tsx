import { type EccLevel, ECC_LEVELS, type QrError, planQr } from "@owiew/core/qr";
import { useMemo, useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { CopyButton } from "../../src/components/ui/CopyButton";
import { Notice } from "../../src/components/ui/Notice";
import { downloadText } from "../../src/components/ui/download";
import { type Lang } from "../../src/i18n/locales";
import { downloadBlob } from "./downloadBlob";
import { pngBlob } from "./pngBlob";
import "./styles.css";
import { strings } from "./strings";

/** Campo a que cada erro pertence. */
type FieldId = "url" | "source" | "medium" | "campaign" | "ecc" | "size" | "margin" | "colors";

/**
 * Descobre em que campo mostrar um erro do core.
 *
 * Onde: Ui.tsx. Entrada: código de erro. Saída: id lógico do campo.
 */
function fieldOf(error: QrError): FieldId {
  switch (error) {
    case "missing-source": return "source";
    case "missing-medium": return "medium";
    case "missing-campaign": return "campaign";
    case "invalid-ecc": return "ecc";
    case "invalid-size": case "size-too-small": return "size";
    case "invalid-margin": return "margin";
    case "invalid-color": case "low-contrast": return "colors";
    default: return "url";
  }
}

/**
 * Lê um inteiro digitado; qualquer coisa que não seja só dígitos vira NaN
 * (o core recusa com o erro do campo).
 *
 * Onde: campos de tamanho e margem. Entrada: texto. Saída: número.
 */
function toInt(text: string): number {
  return /^\d{1,6}$/.test(text.trim()) ? Number(text.trim()) : NaN;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string | undefined;
  onInput: (v: string) => void;
  inputMode?: "numeric" | "url";
}

/**
 * Campo de texto com rótulo, dica e erro ligados por aria.
 *
 * Onde: Ui.tsx. Entradas: ver FieldProps. Saída: bloco `.field` acessível.
 */
function Field(p: FieldProps) {
  const described = [p.hint ? `${p.id}-hint` : "", p.error ? `${p.id}-err` : ""].filter(Boolean).join(" ");
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <input id={p.id} type="text" value={p.value} autocomplete="off" spellcheck={false} inputMode={p.inputMode ?? "text"} aria-invalid={p.error ? "true" : "false"} aria-describedby={described || undefined} onInput={(e) => p.onInput(e.currentTarget.value)} />
      {p.hint && <span class="hint" id={`${p.id}-hint`}>{p.hint}</span>}
      {p.error && <span class="field-error" id={`${p.id}-err`}>{p.error}</span>}
    </div>
  );
}

/**
 * Ilha do Gerador de QR Code com UTM.
 *
 * Onde: montada por Page.astro. Entrada: idioma. Fluxo: campos -> core
 * (`planQr`: UTM, matriz, contraste, SVG) -> prévia SVG em JSX + downloads (SVG
 * como texto, PNG via canvas local). Sem rede; nada é salvo.
 */
export default function QrUtm({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [url, setUrl] = useState(s.example.url);
  const [utmOn, setUtmOn] = useState(true);
  const [source, setSource] = useState(s.example.source);
  const [medium, setMedium] = useState(s.example.medium);
  const [campaign, setCampaign] = useState(s.example.campaign);
  const [ecc, setEcc] = useState<EccLevel>("M");
  const [size, setSize] = useState("512");
  const [margin, setMargin] = useState("4");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [status, setStatus] = useState("");

  const result = useMemo(
    () => planQr({ url, ecc, sizePx: toInt(size), margin: toInt(margin), fg, bg, ...(utmOn ? { utm: { source, medium, campaign } } : {}) }),
    [url, utmOn, source, medium, campaign, ecc, size, margin, fg, bg],
  );
  const err = (id: FieldId): string | undefined => (!result.ok && fieldOf(result.error) === id ? (s.errors[result.error] ?? result.error) : undefined);

  /** Baixa o SVG gerado (texto local). */
  function onSvg(): void {
    if (!result.ok) return;
    downloadText("qr-code.svg", result.value.svg, "image/svg+xml");
    setStatus(s.downloaded);
  }

  /** Gera o PNG no canvas e baixa; avisa se o navegador não conseguir. */
  async function onPng(): Promise<void> {
    if (!result.ok) return;
    try {
      downloadBlob("qr-code.png", await pngBlob(result.value, fg, bg));
      setStatus(s.downloaded);
    } catch (e) {
      console.error(e);
      setStatus(s.pngFailed);
    }
  }

  return (
    <div class="tool-ui">
      <div class="qr-layout">
        <div class="stack">
          <Field id="qr-url" label={s.url} hint={s.urlHint} value={url} onInput={setUrl} inputMode="url" error={err("url")} />
          <label class="check" for="qr-utm-on">
            <input id="qr-utm-on" type="checkbox" checked={utmOn} onChange={(e) => setUtmOn(e.currentTarget.checked)} />
            {s.addUtm}
          </label>
          {utmOn && (
            <div class="stack">
              <Field id="qr-source" label={s.source} value={source} onInput={setSource} error={err("source")} />
              <Field id="qr-medium" label={s.medium} value={medium} onInput={setMedium} error={err("medium")} />
              <Field id="qr-campaign" label={s.campaign} value={campaign} onInput={setCampaign} error={err("campaign")} />
              <span class="hint">{s.utmHint}</span>
            </div>
          )}
          <div class="field">
            <label for="qr-ecc">{s.ecc}</label>
            <select id="qr-ecc" value={ecc} onChange={(e) => setEcc(e.currentTarget.value as EccLevel)}>
              {ECC_LEVELS.map((l) => <option value={l}>{s.eccOptions[l]}</option>)}
            </select>
          </div>
          <div class="row">
            <Field id="qr-size" label={s.size} hint={s.sizeHint} value={size} onInput={setSize} inputMode="numeric" error={err("size")} />
            <Field id="qr-margin" label={s.margin} hint={s.marginHint} value={margin} onInput={setMargin} inputMode="numeric" error={err("margin")} />
          </div>
          <div class="row">
            <div class="field">
              <label for="qr-fg">{s.fg}</label>
              <input id="qr-fg" class="qr-color" type="color" aria-describedby="qr-colors-hint" value={fg} onInput={(e) => setFg(e.currentTarget.value)} />
            </div>
            <div class="field">
              <label for="qr-bg">{s.bg}</label>
              <input id="qr-bg" class="qr-color" type="color" aria-describedby="qr-colors-hint" value={bg} onInput={(e) => setBg(e.currentTarget.value)} />
            </div>
          </div>
          <span class={err("colors") ? "field-error" : "hint"} id="qr-colors-hint" role={err("colors") ? "alert" : undefined}>{err("colors") ?? s.colorsHint}</span>
        </div>

        <section class="output stack" aria-labelledby="qr-result-title" aria-live="polite">
          <h3 id="qr-result-title">{s.result}</h3>
          {result.ok ? (
            <>
              <svg class="qr-preview" data-testid="qr-preview" role="img" aria-label={s.previewLabel(result.value.payload)} viewBox={`0 0 ${result.value.matrix.length + result.value.margin * 2} ${result.value.matrix.length + result.value.margin * 2}`} shape-rendering="crispEdges">
                <rect width="100%" height="100%" fill={bg} />
                <path d={result.value.path} fill={fg} />
              </svg>
              <p class="hint" data-testid="qr-facts">{s.facts(result.value.version, result.value.imageSizePx, result.value.contrast.toFixed(1))}</p>
              <div>
                <strong>{s.payload}</strong>
                <p class="output-url" data-testid="qr-payload">{result.value.payload}</p>
              </div>
              {result.value.warnings.map((w) => <Notice kind="info">{s.warnings[w] ?? w}</Notice>)}
              <div class="btn-row">
                <button type="button" class="btn btn-primary" onClick={onSvg}><Icon name="download" size={18} />{s.downloadSvg}</button>
                <button type="button" class="btn btn-primary" onClick={() => void onPng()}><Icon name="download" size={18} />{s.downloadPng}</button>
                <CopyButton text={result.value.payload} labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }} />
              </div>
            </>
          ) : (
            <Notice kind="warn">{s.errors[result.error] ?? result.error}</Notice>
          )}
          <span class="sr-only" role="status">{status}</span>
        </section>
      </div>
    </div>
  );
}
