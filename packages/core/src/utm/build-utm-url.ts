import { type Result, fail, ok } from "../result";
import { type ParseUrlError, parseHttpUrl } from "../url/parse-http-url";
import { normalizeValue } from "./normalize-value";
import { type NamingRules } from "./rules";

/** Campos de UTM; source, medium e campaign são obrigatórios. */
export interface UtmFields {
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly term?: string;
  readonly content?: string;
  readonly id?: string;
}

/** Ordem canônica dos parâmetros na URL final. */
export const UTM_KEYS = [
  ["source", "utm_source"],
  ["medium", "utm_medium"],
  ["campaign", "utm_campaign"],
  ["id", "utm_id"],
  ["term", "utm_term"],
  ["content", "utm_content"],
] as const;

/** Avisos que não impedem a geração da URL. */
export type UtmWarning =
  | { readonly code: "scheme-assumed" }
  | { readonly code: "utm-replaced"; readonly keys: readonly string[] }
  | { readonly code: "value-normalized"; readonly key: string; readonly from: string; readonly to: string };

/** Erros que impedem a geração. */
export type UtmError =
  | "empty-url"
  | "invalid-url"
  | "unsupported-scheme"
  | "url-too-long"
  | "missing-source"
  | "missing-medium"
  | "missing-campaign";

/** URL gerada com seus avisos. */
export interface UtmOutput {
  readonly url: string;
  readonly warnings: readonly UtmWarning[];
}

/** Tradução dos erros de leitura de URL para os erros do builder. */
const URL_ERRORS: Record<ParseUrlError, UtmError> = {
  empty: "empty-url",
  "too-long": "url-too-long",
  invalid: "invalid-url",
  "unsupported-scheme": "unsupported-scheme",
};

/**
 * Decodifica o nome de um parâmetro sem lançar exceção.
 *
 * Onde: etapa interna do builder, para achar utm_* já existentes na URL.
 * Entrada: nome cru. Saída: nome decodificado em minúsculas (cru se malformado).
 */
function paramName(rawPair: string): string {
  const raw = rawPair.split("=", 1)[0] ?? "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, " ")).toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

/**
 * Gera a URL com UTMs aplicando o padrão de nomenclatura.
 *
 * O quê: normaliza cada valor, valida os obrigatórios, preserva parâmetros e
 * fragmento existentes e substitui só as utm_* que está definindo.
 * Onde: gerador de UTM (linha única e lote). Entradas: URL base crua, campos e
 * regras. Saída: Result com URL e avisos, ou código de erro. Sem efeitos; nada
 * sai do navegador. Fluxo: formulário -> aqui -> copiar/exportar.
 */
export function buildUtmUrl(
  baseUrl: string,
  fields: UtmFields,
  rules: NamingRules,
): Result<UtmOutput, UtmError> {
  const parsed = parseHttpUrl(baseUrl);
  if (!parsed.ok) {
    return fail(URL_ERRORS[parsed.error]);
  }
  const warnings: UtmWarning[] = parsed.value.assumedScheme ? [{ code: "scheme-assumed" }] : [];
  const pairs: [string, string][] = [];
  for (const [field, key] of UTM_KEYS) {
    const raw = fields[field] ?? "";
    const value = normalizeValue(raw, rules);
    if (value === "" && (field === "source" || field === "medium" || field === "campaign")) {
      return fail(`missing-${field}`);
    }
    if (value === "") continue;
    if (value !== raw.trim()) warnings.push({ code: "value-normalized", key, from: raw.trim(), to: value });
    pairs.push([key, value]);
  }
  const url = parsed.value.url;
  const setKeys = new Set(pairs.map(([k]) => k));
  const kept: string[] = [];
  const replaced: string[] = [];
  for (const pair of url.search.replace(/^\?/, "").split("&")) {
    if (pair === "") continue;
    const name = paramName(pair);
    if (setKeys.has(name)) replaced.push(name);
    else kept.push(pair);
  }
  if (replaced.length > 0) warnings.push({ code: "utm-replaced", keys: [...new Set(replaced)] });
  const query = [...kept, ...pairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)].join("&");
  return ok({ url: `${url.origin}${url.pathname}?${query}${url.hash}`, warnings });
}
