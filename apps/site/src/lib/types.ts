import { type Lang } from "../i18n/locales";

/** Identificadores das categorias (inventário fixo em i18n/categories.json). */
export type CategoryId = "links" | "calculators" | "ads" | "keywords" | "utilities";

/** Metadados de uma categoria por idioma. */
export interface CategoryI18n {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
}

/** Categoria do inventário. */
export interface Category {
  readonly id: CategoryId;
  readonly icon: string;
  readonly i18n: Record<Lang, CategoryI18n>;
}

/** Metadados de uma ferramenta num idioma (título e descrição próprios por idioma). */
export interface ToolI18n {
  /** Segmento de URL (único dentro da categoria e do idioma). */
  readonly slug: string;
  /** Nome curto (cards, busca, breadcrumb). */
  readonly name: string;
  /** Título da página (<title> e H1 de busca). */
  readonly title: string;
  /** Meta description (até ~160 caracteres). */
  readonly description: string;
  /** Frase de apoio no topo da página e nos cards. */
  readonly summary: string;
  /** Termos extras para a busca interna. */
  readonly keywords: readonly string[];
}

/** Conteúdo `tool.json` de uma ferramenta (lido pelo site e pelos scripts de build). */
export interface ToolMeta {
  readonly id: string;
  readonly category: CategoryId;
  /** Nome de ícone Lucide aceito por `components/Icon.tsx`. */
  readonly icon: string;
  /** Posição na listagem (id da ferramenta no contrato x 10). */
  readonly order: number;
  /** Ids de ferramentas relacionadas; ids que ainda não existem são ignorados. */
  readonly related: readonly string[];
  readonly i18n: Record<Lang, ToolI18n>;
}

/** Passo do "como usar". */
export interface Step {
  readonly name: string;
  readonly text: string;
}

/** Conteúdo de apoio de uma ferramenta num idioma. */
export interface ToolContent {
  /** Parágrafos introdutórios opcionais (texto útil para quem chega pela busca). */
  readonly intro?: readonly string[];
  readonly howTo: { readonly name: string; readonly steps: readonly Step[] };
  readonly formula: { readonly title: string; readonly paragraphs: readonly string[]; readonly items?: readonly { readonly label: string; readonly expr: string }[] };
  readonly examples: readonly { readonly title: string; readonly text: string }[];
  readonly faq: readonly { readonly q: string; readonly a: string }[];
}

/** Ferramenta pronta para renderizar (metadados + conteúdo + componente de página). */
export interface Tool {
  readonly meta: ToolMeta;
  readonly content: Record<Lang, ToolContent>;
  // Componente Astro que monta a ilha de UI (importado por `import.meta.glob`).
  readonly Page: unknown;
}
