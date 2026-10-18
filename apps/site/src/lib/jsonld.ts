import { HTML_LANG, type Lang } from "../i18n/locales";
import { absolute } from "./urls";
import { type ToolContent } from "./types";

/** Objeto JSON-LD genérico. */
export type JsonLd = Record<string, unknown>;

/**
 * Serializa JSON-LD seguro para dentro de <script>.
 *
 * O quê: JSON.stringify escapando "<" para impedir fechar a tag <script>.
 * Onde: layout base, ao imprimir cada bloco. Entrada: objeto. Saída: texto.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Cria a trilha de navegação (BreadcrumbList).
 *
 * Onde: páginas de ferramenta e de categoria. Entrada: itens nome+caminho em
 * ordem (o último é a página atual). Saída: objeto JSON-LD.
 */
export function breadcrumbLd(items: readonly { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

/**
 * Descreve a ferramenta como aplicativo web gratuito (WebApplication).
 *
 * Onde: página de ferramenta. Entradas: nome, descrição, caminho, idioma.
 * Saída: JSON-LD com categoria de aplicativo, oferta gratuita e criador.
 */
export function webApplicationLd(p: { name: string; description: string; path: string; lang: Lang }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: p.name,
    description: p.description,
    url: absolute(p.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: HTML_LANG[p.lang],
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "owiew", url: "https://owiew.com" },
  };
}

/**
 * Cria o FAQPage com as mesmas perguntas visíveis na página.
 *
 * Onde: página de ferramenta. Entrada: conteúdo da ferramenta no idioma.
 * Saída: JSON-LD (o texto é o mesmo do HTML, nunca marca o que não aparece).
 */
export function faqLd(content: ToolContent): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/**
 * Cria o HowTo com os passos visíveis em "como usar".
 *
 * Onde: página de ferramenta. Entrada: conteúdo da ferramenta no idioma.
 * Saída: JSON-LD com passos numerados.
 */
export function howToLd(content: ToolContent): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content.howTo.name,
    step: content.howTo.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
}

/**
 * Cria Organization + WebSite para a página inicial (sem SearchAction).
 *
 * Onde: home de cada idioma. Entradas: nome do site, descrição, idioma.
 * Saída: lista de blocos JSON-LD.
 */
export function siteLd(p: { name: string; description: string; lang: Lang; path: string }): JsonLd[] {
  return [
    { "@context": "https://schema.org", "@type": "Organization", name: "owiew", url: "https://owiew.com" },
    { "@context": "https://schema.org", "@type": "WebSite", name: p.name, url: absolute(p.path), description: p.description, inLanguage: HTML_LANG[p.lang], publisher: { "@type": "Organization", name: "owiew", url: "https://owiew.com" } },
  ];
}
