import { countAdChars } from "./count-chars";

/** Limites oficiais do anúncio responsivo de pesquisa (Ajuda do Google Ads). */
export const RSA_LIMITS = {
  headlines: 15, headlineChars: 30, minHeadlines: 3,
  descriptions: 4, descriptionChars: 90, minDescriptions: 2,
  pathChars: 15,
} as const;

/** Um campo de texto avaliado. */
export interface FieldCheck {
  readonly text: string;
  readonly length: number;
  readonly limit: number;
  /** Quantos caracteres passam do limite (0 se cabe). */
  readonly over: number;
  readonly empty: boolean;
}

/** Entrada do verificador: o que o usuário digitou, campo a campo. */
export interface RsaInput {
  readonly headlines: readonly string[];
  readonly descriptions: readonly string[];
  readonly path1: string;
  readonly path2: string;
  /** Domínio do site, só para montar a URL exibida na prévia (ex.: "exemplo.com.br"). */
  readonly domain: string;
}

/** Códigos de aviso estáveis (a UI traduz). `error` impede o anúncio; `warn` é cuidado. */
export type RsaIssueCode =
  | "headlines-over-15" | "descriptions-over-4" | "min-headlines" | "min-descriptions"
  | "duplicate-headline" | "duplicate-description" | "path2-without-path1"
  | "path-invalid-chars" | "exclamation-headline";

/** Problema achado, com gravidade e, quando útil, o campo (índice base 0). */
export interface RsaIssue {
  readonly code: RsaIssueCode;
  readonly severity: "error" | "warn";
}

/** Resultado completo da verificação. */
export interface RsaCheck {
  readonly headlines: readonly FieldCheck[];
  readonly descriptions: readonly FieldCheck[];
  readonly path1: FieldCheck;
  readonly path2: FieldCheck;
  readonly issues: readonly RsaIssue[];
  /** Cabe em todos os limites e cumpre os mínimos (pode ser enviado ao Google). */
  readonly ready: boolean;
}

/** Prévia genérica (sem marca): como os textos se combinam no resultado. */
export interface RsaPreview {
  readonly displayUrl: string;
  readonly headlines: readonly string[];
  readonly descriptions: readonly string[];
}

/**
 * Avalia um campo: contagem à maneira do Google contra o limite.
 *
 * Onde: etapa interna de `checkGoogleRsa`. Entradas: texto e limite. Saída: FieldCheck.
 */
export function checkField(text: string, limit: number): FieldCheck {
  const length = countAdChars(text);
  return { text, length, limit, over: Math.max(0, length - limit), empty: text.trim() === "" };
}

/** Chave de comparação de duplicados: sem caixa e com espaços normalizados. */
const dupKey = (t: string): string => t.trim().replace(/\s+/g, " ").toLocaleLowerCase();

/**
 * Indica se há dois textos iguais (ignorando caixa e espaços) entre os preenchidos.
 *
 * Onde: etapa interna de `checkGoogleRsa`. Entrada: textos. Saída: true se repete.
 */
function hasDuplicate(texts: readonly string[]): boolean {
  const seen = new Set<string>();
  for (const t of texts) {
    if (t.trim() === "") continue;
    const k = dupKey(t);
    if (seen.has(k)) return true;
    seen.add(k);
  }
  return false;
}

/**
 * Verifica um anúncio responsivo de pesquisa do Google (RSA).
 *
 * O quê: até 15 títulos de 30, até 4 descrições de 90, 2 caminhos de 15, mínimo
 * de 3 títulos e 2 descrições (limites da Ajuda do Google Ads). Avisos de
 * cuidado: duplicados, caminho com caractere estranho ou espaço, caminho 2 sem
 * caminho 1 e "!" em título (a política editorial costuma reprovar).
 * Onde: ilha da ferramenta "Prévia de anúncio". Entrada: RsaInput. Saída:
 * RsaCheck. Sem efeitos; campos além do 15º título / 4ª descrição viram erro.
 */
export function checkGoogleRsa(input: RsaInput): RsaCheck {
  const headlines = input.headlines.map((t) => checkField(t, RSA_LIMITS.headlineChars));
  const descriptions = input.descriptions.map((t) => checkField(t, RSA_LIMITS.descriptionChars));
  const path1 = checkField(input.path1, RSA_LIMITS.pathChars);
  const path2 = checkField(input.path2, RSA_LIMITS.pathChars);
  const filledH = headlines.filter((h) => !h.empty);
  const filledD = descriptions.filter((d) => !d.empty);
  const issues: RsaIssue[] = [];
  if (filledH.length > RSA_LIMITS.headlines) issues.push({ code: "headlines-over-15", severity: "error" });
  if (filledD.length > RSA_LIMITS.descriptions) issues.push({ code: "descriptions-over-4", severity: "error" });
  if (filledH.length < RSA_LIMITS.minHeadlines) issues.push({ code: "min-headlines", severity: "error" });
  if (filledD.length < RSA_LIMITS.minDescriptions) issues.push({ code: "min-descriptions", severity: "error" });
  if (hasDuplicate(input.headlines)) issues.push({ code: "duplicate-headline", severity: "warn" });
  if (hasDuplicate(input.descriptions)) issues.push({ code: "duplicate-description", severity: "warn" });
  if (!path2.empty && path1.empty) issues.push({ code: "path2-without-path1", severity: "error" });
  if ([input.path1, input.path2].some((p) => /[\s/\\?#%&=]/u.test(p.trim()))) issues.push({ code: "path-invalid-chars", severity: "warn" });
  if (input.headlines.some((h) => h.includes("!"))) issues.push({ code: "exclamation-headline", severity: "warn" });
  const overflow = [...headlines, ...descriptions, path1, path2].some((f) => f.over > 0);
  const ready = !overflow && !issues.some((i) => i.severity === "error");
  return { headlines, descriptions, path1, path2, issues, ready };
}

/**
 * Monta a prévia genérica: URL exibida, 3 primeiros títulos e 2 primeiras descrições.
 *
 * O quê: o Google combina títulos e descrições automaticamente; a prévia mostra
 * uma combinação possível (títulos separados por " | "). Sem logotipo nem marca.
 * Onde: bloco de prévia da ilha. Entrada: RsaInput. Saída: RsaPreview. Sem efeitos.
 */
export function previewGoogleRsa(input: RsaInput): RsaPreview {
  const pick = (list: readonly string[], n: number): string[] => list.map((t) => t.trim()).filter((t) => t !== "").slice(0, n);
  const host = input.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/\0/g, "");
  const paths = [input.path1, input.path2].map((p) => p.trim()).filter((p) => p !== "");
  return {
    displayUrl: [host === "" ? "exemplo.com" : host, ...paths].join("/"),
    headlines: pick(input.headlines, 3),
    descriptions: pick(input.descriptions, 2),
  };
}
