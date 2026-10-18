import { useState } from "preact/hooks";
import { type Lang } from "../../src/i18n/locales";
import { SamplePanel } from "./SamplePanel";
import { SignificancePanel } from "./SignificancePanel";
import { strings } from "./strings";
import "./styles.css";

/**
 * Ilha do Teste A/B: abas "significância" e "tamanho de amostra".
 *
 * Onde: montada por Page.astro. Entrada: idioma da página. Fluxo: cada aba
 * lê os campos, chama o core (`@owiew/core/abtest`) e mostra o resultado.
 * Nada vai para a rede; os dois painéis ficam montados (um escondido) para
 * não perder o que o usuário digitou ao trocar de aba.
 */
export default function AbTest({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const [tab, setTab] = useState<"sig" | "sample">("sig");
  return (
    <div class="tool-ui">
      <div class="btn-row" role="group" aria-label={`${s.tabSig} / ${s.tabSample}`}>
        <button type="button" class={tab === "sig" ? "btn btn-primary" : "btn"} aria-pressed={tab === "sig"} onClick={() => setTab("sig")}>{s.tabSig}</button>
        <button type="button" class={tab === "sample" ? "btn btn-primary" : "btn"} aria-pressed={tab === "sample"} onClick={() => setTab("sample")}>{s.tabSample}</button>
      </div>
      <div hidden={tab !== "sig"}><SignificancePanel lang={lang} s={s} /></div>
      <div hidden={tab !== "sample"}><SamplePanel lang={lang} s={s} /></div>
    </div>
  );
}
