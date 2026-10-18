import { type Lang } from "./locales";

/** Textos globais da interface (cabeçalho, rodapé, seções de página, busca). */
export interface UiStrings {
  readonly brand: string;
  readonly skip: string;
  readonly navLabel: string;
  readonly langLabel: string;
  readonly themeToDark: string;
  readonly themeToLight: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchNone: string;
  readonly searchCount: (n: number) => string;
  readonly breadcrumbLabel: string;
  readonly breadcrumbHome: string;
  readonly privacy: string;
  readonly privacyLong: string;
  readonly howTo: string;
  readonly formula: string;
  readonly examples: string;
  readonly faq: string;
  readonly related: string;
  readonly allTools: string;
  readonly toolsCount: (n: number) => string;
  readonly comingSoon: string;
  readonly comingSoonText: string;
  readonly contribute: string;
  readonly home: { readonly title: string; readonly description: string; readonly h1: string; readonly lead: string; readonly points: readonly { readonly title: string; readonly text: string }[] };
  readonly footer: { readonly tagline: string; readonly madeBy: string; readonly cta: string; readonly license: string; readonly github: string; readonly categories: string; readonly project: string; readonly contributing: string };
  readonly notFound: { readonly title: string; readonly text: string; readonly back: string };
  readonly openNewTab: string;
}

const pt: UiStrings = {
  brand: "owiew tools",
  skip: "Ir para o conteúdo",
  navLabel: "Categorias de ferramentas",
  langLabel: "Idioma",
  themeToDark: "Ativar tema escuro",
  themeToLight: "Ativar tema claro",
  searchLabel: "Buscar ferramenta",
  searchPlaceholder: "Buscar ferramenta",
  searchNone: "Nenhuma ferramenta encontrada.",
  searchCount: (n) => (n === 1 ? "1 ferramenta encontrada." : `${n} ferramentas encontradas.`),
  breadcrumbLabel: "Você está em",
  breadcrumbHome: "Início",
  privacy: "Seus dados não saem do seu navegador",
  privacyLong: "Tudo é calculado aqui, no seu navegador. Nenhum dado digitado é enviado a servidor algum e não usamos cookies de terceiros.",
  howTo: "Como usar",
  formula: "Como o cálculo funciona",
  examples: "Exemplos",
  faq: "Perguntas frequentes",
  related: "Ferramentas relacionadas",
  allTools: "Todas as ferramentas",
  toolsCount: (n) => (n === 1 ? "1 ferramenta" : `${n} ferramentas`),
  comingSoon: "Em breve",
  comingSoonText: "Ainda não há ferramentas nesta categoria. O projeto é de código aberto: você pode propor ou criar a primeira.",
  contribute: "Como criar uma ferramenta",
  home: {
    title: "Ferramentas gratuitas para tráfego pago e campanhas",
    description: "Gerador de UTM, inspetor de URL, calculadora de ROAS e mais. Gratuitas, em código aberto e rodando no seu navegador, sem cadastro.",
    h1: "Ferramentas para quem vive de tráfego pago",
    lead: "Gere links com UTM, confira URLs de campanha e faça as contas de ROAS e margem. Sem cadastro, sem enviar dado nenhum, com código aberto.",
    points: [
      { title: "Gratuitas, sem cadastro", text: "Abra, use e feche. Não pedimos e-mail nem criamos conta." },
      { title: "Privadas por construção", text: "O cálculo roda no seu navegador. A página nem tem permissão de conversar com servidores de terceiros." },
      { title: "Código aberto (MIT)", text: "Leia a fórmula, corrija um erro ou crie uma ferramenta nova pelo GitHub." },
    ],
  },
  footer: {
    tagline: "Ferramentas gratuitas e abertas para tráfego pago.",
    madeBy: "Feito por owiew",
    cta: "Conheça o owiew, auditoria de mídia paga",
    license: "Licença MIT",
    github: "Código no GitHub",
    categories: "Categorias",
    project: "Projeto",
    contributing: "Contribuir",
  },
  notFound: { title: "Página não encontrada", text: "O endereço não existe ou mudou de lugar.", back: "Voltar para o início" },
  openNewTab: "abre em nova aba",
};

const en: UiStrings = {
  brand: "owiew tools",
  skip: "Skip to content",
  navLabel: "Tool categories",
  langLabel: "Language",
  themeToDark: "Switch to dark theme",
  themeToLight: "Switch to light theme",
  searchLabel: "Search tools",
  searchPlaceholder: "Search tools",
  searchNone: "No tools found.",
  searchCount: (n) => (n === 1 ? "1 tool found." : `${n} tools found.`),
  breadcrumbLabel: "You are here",
  breadcrumbHome: "Home",
  privacy: "Your data never leaves your browser",
  privacyLong: "Everything is calculated here, in your browser. Nothing you type is sent to any server and we use no third-party cookies.",
  howTo: "How to use",
  formula: "How the calculation works",
  examples: "Examples",
  faq: "Frequently asked questions",
  related: "Related tools",
  allTools: "All tools",
  toolsCount: (n) => (n === 1 ? "1 tool" : `${n} tools`),
  comingSoon: "Coming soon",
  comingSoonText: "There are no tools in this category yet. The project is open source: you can suggest or build the first one.",
  contribute: "How to build a tool",
  home: {
    title: "Free tools for paid media and campaigns",
    description: "UTM builder, URL inspector, ROAS calculator and more. Free, open source and running in your browser, no sign-up.",
    h1: "Tools for people who live on paid media",
    lead: "Build UTM links, check campaign URLs and do the ROAS and margin math. No sign-up, nothing is uploaded, and the code is open.",
    points: [
      { title: "Free, no sign-up", text: "Open it, use it, close it. We do not ask for an email or create an account." },
      { title: "Private by design", text: "The math runs in your browser. The page is not even allowed to talk to third-party servers." },
      { title: "Open source (MIT)", text: "Read the formula, fix a bug or build a new tool on GitHub." },
    ],
  },
  footer: {
    tagline: "Free, open tools for paid media.",
    madeBy: "Made by owiew",
    cta: "Meet owiew, paid media auditing",
    license: "MIT license",
    github: "Code on GitHub",
    categories: "Categories",
    project: "Project",
    contributing: "Contribute",
  },
  notFound: { title: "Page not found", text: "The address does not exist or has moved.", back: "Back to the home page" },
  openNewTab: "opens in a new tab",
};

const es: UiStrings = {
  brand: "owiew tools",
  skip: "Ir al contenido",
  navLabel: "Categorías de herramientas",
  langLabel: "Idioma",
  themeToDark: "Activar tema oscuro",
  themeToLight: "Activar tema claro",
  searchLabel: "Buscar herramienta",
  searchPlaceholder: "Buscar herramienta",
  searchNone: "No se encontró ninguna herramienta.",
  searchCount: (n) => (n === 1 ? "1 herramienta encontrada." : `${n} herramientas encontradas.`),
  breadcrumbLabel: "Estás en",
  breadcrumbHome: "Inicio",
  privacy: "Tus datos no salen de tu navegador",
  privacyLong: "Todo se calcula aquí, en tu navegador. Nada de lo que escribes se envía a ningún servidor y no usamos cookies de terceros.",
  howTo: "Cómo usar",
  formula: "Cómo funciona el cálculo",
  examples: "Ejemplos",
  faq: "Preguntas frecuentes",
  related: "Herramientas relacionadas",
  allTools: "Todas las herramientas",
  toolsCount: (n) => (n === 1 ? "1 herramienta" : `${n} herramientas`),
  comingSoon: "Próximamente",
  comingSoonText: "Todavía no hay herramientas en esta categoría. El proyecto es de código abierto: puedes proponer o crear la primera.",
  contribute: "Cómo crear una herramienta",
  home: {
    title: "Herramientas gratuitas para tráfico pago y campañas",
    description: "Generador de UTM, inspector de URL, calculadora de ROAS y más. Gratuitas, de código abierto y en tu navegador, sin registro.",
    h1: "Herramientas para quien vive del tráfico pago",
    lead: "Genera enlaces con UTM, revisa URLs de campaña y haz las cuentas de ROAS y margen. Sin registro, sin enviar datos y con código abierto.",
    points: [
      { title: "Gratis, sin registro", text: "Ábrela, úsala y ciérrala. No pedimos correo ni creamos cuenta." },
      { title: "Privadas por diseño", text: "El cálculo corre en tu navegador. La página ni siquiera puede hablar con servidores de terceros." },
      { title: "Código abierto (MIT)", text: "Lee la fórmula, corrige un error o crea una herramienta nueva en GitHub." },
    ],
  },
  footer: {
    tagline: "Herramientas gratuitas y abiertas para tráfico pago.",
    madeBy: "Hecho por owiew",
    cta: "Conoce owiew, auditoría de medios pagos",
    license: "Licencia MIT",
    github: "Código en GitHub",
    categories: "Categorías",
    project: "Proyecto",
    contributing: "Contribuir",
  },
  notFound: { title: "Página no encontrada", text: "La dirección no existe o cambió de lugar.", back: "Volver al inicio" },
  openNewTab: "se abre en una pestaña nueva",
};

const ALL: Record<Lang, UiStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos globais de um idioma.
 *
 * Onde: layouts, páginas e componentes do site. Entrada: idioma.
 * Saída: objeto de textos. Sem efeitos.
 */
export function ui(lang: Lang): UiStrings {
  return ALL[lang];
}
