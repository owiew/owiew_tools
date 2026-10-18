import { adsToCsv, checkGoogleRsa, checkMeta } from "@owiew/core/ads";
import { useState } from "preact/hooks";
import { Icon } from "../../src/components/Icon";
import { downloadText } from "../../src/components/ui/download";
import { type Lang } from "../../src/i18n/locales";
import { GooglePanel, type GoogleState } from "./GooglePanel";
import { MetaPanel, type MetaState } from "./MetaPanel";
import { strings } from "./strings";
import "./styles.css";

/**
 * Ilha da Prévia e contador de anúncio: abas Google (RSA) e Meta, e exportação CSV.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: o estado dos
 * dois anúncios vive aqui (trocar de aba não perde texto); cada painel chama o
 * core; o botão exporta os dois em CSV, protegido contra injeção de fórmula,
 * por um Blob local. Nenhuma requisição de rede.
 */
export default function AdPreview({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [tab, setTab] = useState<"google" | "meta">("google");
  const [google, setGoogle] = useState<GoogleState>({ domain: s.example.domain, path1: s.example.path1, path2: s.example.path2, headlines: s.example.headlines, descriptions: s.example.descriptions });
  const [meta, setMeta] = useState<MetaState>({ primary: s.example.primary, headline: s.example.headline, description: s.example.description });
  const metaCheck = checkMeta(meta);

  return (
    <div class="tool-ui">
      <div class="btn-row" role="group" aria-label={`${s.tabGoogle} / ${s.tabMeta}`}>
        <button type="button" class={tab === "google" ? "btn btn-primary" : "btn"} aria-pressed={tab === "google"} onClick={() => setTab("google")}>{s.tabGoogle}</button>
        <button type="button" class={tab === "meta" ? "btn btn-primary" : "btn"} aria-pressed={tab === "meta"} onClick={() => setTab("meta")}>{s.tabMeta}</button>
      </div>
      <div hidden={tab !== "google"}><GooglePanel s={s} state={google} onChange={setGoogle} /></div>
      <div hidden={tab !== "meta"}><MetaPanel s={s} state={meta} check={metaCheck} onChange={setMeta} /></div>
      <div class="btn-row">
        <button type="button" class="btn" onClick={() => downloadText("ad-texts.csv", adsToCsv(checkGoogleRsa(google), metaCheck), "text/csv;charset=utf-8")}>
          <Icon name="download" size={18} />{s.exportCsv}
        </button>
      </div>
    </div>
  );
}
