import { useState } from "preact/hooks";
import { type Lang } from "../../src/i18n/locales";
import { CleanPanel } from "./CleanPanel";
import { NegativesPanel } from "./NegativesPanel";
import { strings } from "./strings";
import "./styles.css";

/**
 * Ilha do Limpador de palavras-chave e gerador de negativas: duas abas.
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Os dois painéis
 * ficam montados (um escondido) para não perder o texto colado ao trocar de aba.
 * Lógica em `@owiew/core/keywords`; nada vai à rede.
 */
export default function KeywordCleaner({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [tab, setTab] = useState<"clean" | "neg">("clean");
  return (
    <div class="tool-ui">
      <div class="btn-row" role="group" aria-label={`${s.tabClean} / ${s.tabNegatives}`}>
        <button type="button" class={tab === "clean" ? "btn btn-primary" : "btn"} aria-pressed={tab === "clean"} onClick={() => setTab("clean")}>{s.tabClean}</button>
        <button type="button" class={tab === "neg" ? "btn btn-primary" : "btn"} aria-pressed={tab === "neg"} onClick={() => setTab("neg")}>{s.tabNegatives}</button>
      </div>
      <div hidden={tab !== "clean"}><CleanPanel s={s} example={s.example.list} /></div>
      <div hidden={tab !== "neg"}><NegativesPanel lang={lang} s={s} example={s.example} /></div>
    </div>
  );
}
