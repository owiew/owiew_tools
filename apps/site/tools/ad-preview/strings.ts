import { type Lang } from "../../src/i18n/locales";

/** Textos da interface da Prévia e contador de anúncio. */
export interface AdStrings {
  readonly tabGoogle: string;
  readonly tabMeta: string;
  readonly domain: string;
  readonly domainHint: string;
  readonly path1: string;
  readonly path2: string;
  readonly pathHint: string;
  readonly headline: (n: number) => string;
  readonly description: (n: number) => string;
  readonly addHeadline: string;
  readonly addDescription: string;
  readonly remove: (label: string) => string;
  readonly over: string;
  readonly counter: (len: number, limit: number) => string;
  readonly googleTitle: string;
  readonly metaTitle: string;
  readonly previewTitle: string;
  readonly previewNote: string;
  readonly sponsored: string;
  readonly issues: Record<string, string>;
  readonly ready: string;
  readonly notReady: string;
  readonly primary: string;
  readonly primaryHint: string;
  readonly metaHeadline: string;
  readonly metaHeadlineHint: string;
  readonly metaDescription: string;
  readonly metaDescriptionHint: string;
  readonly metaWithin: string;
  readonly metaTruncated: string;
  readonly seeMore: string;
  readonly pageName: string;
  readonly learnMore: string;
  readonly exportCsv: string;
  readonly example: { readonly domain: string; readonly path1: string; readonly path2: string; readonly headlines: readonly string[]; readonly descriptions: readonly string[]; readonly primary: string; readonly headline: string; readonly description: string };
}

const pt: AdStrings = {
  tabGoogle: "Google (anúncio responsivo de pesquisa)", tabMeta: "Meta (Facebook e Instagram)",
  domain: "Domínio do site", domainHint: "Só para montar a URL exibida na prévia.", path1: "Caminho 1", path2: "Caminho 2", pathHint: "Até 15 caracteres cada, sem espaços.",
  headline: (n) => `Título ${n}`, description: (n) => `Descrição ${n}`,
  addHeadline: "Adicionar título", addDescription: "Adicionar descrição", remove: (l) => `Remover ${l}`,
  over: "acima do limite", counter: (len, limit) => `${len} / ${limit}`,
  googleTitle: "Textos do anúncio", metaTitle: "Textos do anúncio", previewTitle: "Prévia", previewNote: "Prévia genérica, sem marca. O Google combina títulos e descrições automaticamente: esta é uma das combinações possíveis.", sponsored: "Anúncio",
  issues: {
    "headlines-over-15": "O Google aceita no máximo 15 títulos.", "descriptions-over-4": "O Google aceita no máximo 4 descrições.",
    "min-headlines": "Preencha pelo menos 3 títulos.", "min-descriptions": "Preencha pelo menos 2 descrições.",
    "duplicate-headline": "Há títulos repetidos. O Google pede textos diferentes entre si.", "duplicate-description": "Há descrições repetidas.",
    "path2-without-path1": "O caminho 2 só funciona se o caminho 1 estiver preenchido.", "path-invalid-chars": "Os caminhos não devem ter espaço nem símbolos como / ? # % & =.",
    "exclamation-headline": "Ponto de exclamação em título costuma ser reprovado pela política editorial do Google.",
  },
  ready: "Pronto: tudo cabe nos limites e os mínimos foram cumpridos.", notReady: "Ainda não está pronto: ajuste os pontos abaixo.",
  primary: "Texto principal", primaryHint: "O Feed mostra cerca de 125 caracteres antes do “ver mais”.",
  metaHeadline: "Título", metaHeadlineHint: "Recomendado: até 27 caracteres no Feed.", metaDescription: "Descrição", metaDescriptionHint: "Recomendado: até 27 caracteres; nem todo posicionamento mostra.",
  metaWithin: "Tudo dentro dos limites recomendados.", metaTruncated: "Algum texto passa do recomendado e seria cortado no Feed.",
  seeMore: "ver mais", pageName: "Nome da sua página", learnMore: "Saiba mais",
  exportCsv: "Exportar CSV",
  example: {
    domain: "exemplo.com.br", path1: "tenis", path2: "corrida",
    headlines: ["Tênis de corrida com desconto", "Frete grátis acima de R$ 199", "Troca grátis em 30 dias", "Parcele em até 10x sem juros"],
    descriptions: ["Modelos leves e confortáveis para treinar todos os dias. Compre online com entrega rápida.", "Aproveite as ofertas da semana e receba em casa. Troca fácil se não servir."],
    primary: "Seu treino rende mais com o tênis certo. Veja os modelos mais leves da temporada, com entrega rápida e troca grátis em 30 dias para você testar sem risco.",
    headline: "Tênis de corrida leve", description: "Frete grátis desde R$ 199",
  },
};

const en: AdStrings = {
  tabGoogle: "Google (responsive search ad)", tabMeta: "Meta (Facebook and Instagram)",
  domain: "Site domain", domainHint: "Only used to build the display URL in the preview.", path1: "Path 1", path2: "Path 2", pathHint: "Up to 15 characters each, no spaces.",
  headline: (n) => `Headline ${n}`, description: (n) => `Description ${n}`,
  addHeadline: "Add headline", addDescription: "Add description", remove: (l) => `Remove ${l}`,
  over: "over the limit", counter: (len, limit) => `${len} / ${limit}`,
  googleTitle: "Ad text", metaTitle: "Ad text", previewTitle: "Preview", previewNote: "Generic preview, no branding. Google mixes headlines and descriptions automatically: this is one possible combination.", sponsored: "Ad",
  issues: {
    "headlines-over-15": "Google accepts at most 15 headlines.", "descriptions-over-4": "Google accepts at most 4 descriptions.",
    "min-headlines": "Fill in at least 3 headlines.", "min-descriptions": "Fill in at least 2 descriptions.",
    "duplicate-headline": "Some headlines repeat. Google asks for texts that differ from each other.", "duplicate-description": "Some descriptions repeat.",
    "path2-without-path1": "Path 2 only works when path 1 is filled in.", "path-invalid-chars": "Paths should not contain spaces or symbols such as / ? # % & =.",
    "exclamation-headline": "An exclamation mark in a headline is often rejected by Google's editorial policy.",
  },
  ready: "Ready: everything fits the limits and the minimums are met.", notReady: "Not ready yet: fix the points below.",
  primary: "Primary text", primaryHint: "The Feed shows about 125 characters before “See more”.",
  metaHeadline: "Headline", metaHeadlineHint: "Recommended: up to 27 characters in the Feed.", metaDescription: "Description", metaDescriptionHint: "Recommended: up to 27 characters; not every placement shows it.",
  metaWithin: "Everything is within the recommended limits.", metaTruncated: "Some text goes past the recommendation and would be cut in the Feed.",
  seeMore: "See more", pageName: "Your page name", learnMore: "Learn more",
  exportCsv: "Export CSV",
  example: {
    domain: "example.com", path1: "running", path2: "shoes",
    headlines: ["Running shoes on sale", "Free shipping over $50", "Free returns within 30 days", "4 interest-free installments"],
    descriptions: ["Light, comfortable models for everyday training. Shop online with fast delivery.", "Enjoy this week's deals and get them at home. Easy returns if they don't fit."],
    primary: "Your training pays off with the right shoes. See the lightest models of the season, with fast delivery and free returns within 30 days so you can try them risk-free.",
    headline: "Lightweight running shoes", description: "Free shipping over $50",
  },
};

const es: AdStrings = {
  tabGoogle: "Google (anuncio responsivo de búsqueda)", tabMeta: "Meta (Facebook e Instagram)",
  domain: "Dominio del sitio", domainHint: "Solo para armar la URL visible en la vista previa.", path1: "Ruta 1", path2: "Ruta 2", pathHint: "Hasta 15 caracteres cada una, sin espacios.",
  headline: (n) => `Título ${n}`, description: (n) => `Descripción ${n}`,
  addHeadline: "Agregar título", addDescription: "Agregar descripción", remove: (l) => `Quitar ${l}`,
  over: "sobre el límite", counter: (len, limit) => `${len} / ${limit}`,
  googleTitle: "Textos del anuncio", metaTitle: "Textos del anuncio", previewTitle: "Vista previa", previewNote: "Vista previa genérica, sin marca. Google combina títulos y descripciones automáticamente: esta es una de las combinaciones posibles.", sponsored: "Anuncio",
  issues: {
    "headlines-over-15": "Google acepta como máximo 15 títulos.", "descriptions-over-4": "Google acepta como máximo 4 descripciones.",
    "min-headlines": "Completa al menos 3 títulos.", "min-descriptions": "Completa al menos 2 descripciones.",
    "duplicate-headline": "Hay títulos repetidos. Google pide textos distintos entre sí.", "duplicate-description": "Hay descripciones repetidas.",
    "path2-without-path1": "La ruta 2 solo funciona si la ruta 1 está completa.", "path-invalid-chars": "Las rutas no deben tener espacios ni símbolos como / ? # % & =.",
    "exclamation-headline": "Un signo de exclamación en un título suele ser rechazado por la política editorial de Google.",
  },
  ready: "Listo: todo cabe en los límites y se cumplen los mínimos.", notReady: "Aún no está listo: ajusta los puntos de abajo.",
  primary: "Texto principal", primaryHint: "El Feed muestra unos 125 caracteres antes de “ver más”.",
  metaHeadline: "Título", metaHeadlineHint: "Recomendado: hasta 27 caracteres en el Feed.", metaDescription: "Descripción", metaDescriptionHint: "Recomendado: hasta 27 caracteres; no todas las ubicaciones la muestran.",
  metaWithin: "Todo dentro de los límites recomendados.", metaTruncated: "Algún texto pasa de lo recomendado y se cortaría en el Feed.",
  seeMore: "ver más", pageName: "Nombre de tu página", learnMore: "Más información",
  exportCsv: "Exportar CSV",
  example: {
    domain: "ejemplo.com", path1: "zapatillas", path2: "running",
    headlines: ["Zapatillas running en oferta", "Envío gratis desde $50", "Devolución gratis en 30 días", "Paga en 6 cuotas sin interés"],
    descriptions: ["Modelos ligeros y cómodos para entrenar todos los días. Compra online con entrega rápida.", "Aprovecha las ofertas de la semana y recíbelas en casa. Cambio fácil si no te quedan."],
    primary: "Tu entrenamiento rinde más con las zapatillas correctas. Mira los modelos más ligeros de la temporada, con entrega rápida y devolución gratis en 30 días para probarlas sin riesgo.",
    headline: "Zapatillas running ligeras", description: "Envío gratis desde $50",
  },
};

const ALL: Record<Lang, AdStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos da ferramenta no idioma pedido.
 *
 * Onde: Ui.tsx e painéis. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): AdStrings {
  return ALL[lang];
}
