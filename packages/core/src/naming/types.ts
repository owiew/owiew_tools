import { type AppLocale } from "../money/locale";

/** Blocos que compõem o nome; `date` vem do parâmetro de data, os demais do texto digitado. */
export const BLOCK_KEYS = ["channel", "objective", "audience", "offer", "date"] as const;
export type BlockKey = (typeof BLOCK_KEYS)[number];

/** Blocos de texto livre (os únicos que aceitam lista no lote). */
export const TEXT_BLOCK_KEYS = ["channel", "objective", "audience", "offer"] as const;
export type TextBlockKey = (typeof TEXT_BLOCK_KEYS)[number];

/** Separadores permitidos entre blocos. */
export const SEPARATORS = ["_", "-", ".", "|"] as const;
export type NamingSeparator = (typeof SEPARATORS)[number];

/** Caixa do texto: minúsculas, MAIÚSCULAS ou como foi digitado. */
export type CaseMode = "lower" | "upper" | "keep";

/** Formatos de data aceitos (YYYY ano, MM mês, DD dia, MMM mês abreviado, YY ano de 2 dígitos). */
export const DATE_FORMATS = ["YYYYMMDD", "YYYY-MM-DD", "YYYYMM", "YYYY-MM", "YYMMDD", "MMMYY"] as const;
export type DateFormat = (typeof DATE_FORMATS)[number];

/** Data de calendário recebida por parâmetro (o core nunca lê o relógio). */
export interface NamingDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Opções de normalização aplicadas a cada bloco. */
export interface NamingOptions {
  readonly separator: NamingSeparator;
  readonly caseMode: CaseMode;
  readonly stripAccents: boolean;
}

/** Padrão recomendado: sublinhado entre blocos, minúsculas, sem acento. */
export const DEFAULT_NAMING_OPTIONS: NamingOptions = { separator: "_", caseMode: "lower", stripAccents: true };

/** Tudo o que define um nome: ordem, textos, data, formato e opções. */
export interface NamingInput {
  /** Ordem dos blocos, sem repetição. */
  readonly order: readonly BlockKey[];
  readonly values: Partial<Record<TextBlockKey, string>>;
  readonly date: NamingDate | null;
  readonly dateFormat: DateFormat;
  readonly locale: AppLocale;
  readonly options: NamingOptions;
}

/** Parte do nome já normalizada, com o bloco de origem. */
export interface NamePart {
  readonly key: BlockKey;
  readonly text: string;
}

/** Aviso que não impede o nome. */
export type NamingWarning = "too-long";

/** Nome pronto. */
export interface NameOutput {
  readonly name: string;
  readonly parts: readonly NamePart[];
  /** Tamanho em caracteres (pontos de código). */
  readonly length: number;
  readonly warnings: readonly NamingWarning[];
}

/** Erros de validação (códigos estáveis, a UI traduz). */
export type NamingError = "empty" | "invalid-order" | "value-too-long";

/** Acima deste tamanho avisamos (limite genérico; cada plataforma tem o seu). */
export const NAME_LENGTH_WARN = 100;

/** Teto de caracteres aceitos por bloco digitado. */
export const MAX_BLOCK_INPUT = 200;

/** Teto de nomes gerados no lote. */
export const MAX_NAMES = 500;
