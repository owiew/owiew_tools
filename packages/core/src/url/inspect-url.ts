import { type Result, fail, ok } from "../result";
import { type ClickIdInfo, identifyClickId } from "./click-ids";
import { decodeComponent } from "./codec";
import { type ParseUrlError, parseHttpUrl } from "./parse-http-url";

/** Parâmetros UTM padrão conhecidos. */
const KNOWN_UTM = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_source_platform", "utm_creative_format", "utm_marketing_tactic",
]);
const REQUIRED_UTM = ["utm_source", "utm_medium", "utm_campaign"] as const;

/** Códigos dos achados do inspetor (a UI traduz por idioma). */
export type IssueCode =
  | "scheme-assumed"
  | "credentials-in-url"
  | "utm-conflict"
  | "utm-duplicate"
  | "duplicate-param"
  | "utm-uppercase"
  | "utm-key-case"
  | "utm-whitespace"
  | "utm-empty"
  | "utm-unknown-key"
  | "utm-missing-required"
  | "utm-in-fragment"
  | "malformed-encoding"
  | "double-encoded"
  | "multiple-click-ids";

/** Um achado: gravidade, código e o parâmetro envolvido. */
export interface Issue {
  readonly severity: "error" | "warning" | "info";
  readonly code: IssueCode;
  readonly param?: string;
}

/** Parâmetro da query já decodificado. */
export interface ParamInfo {
  readonly index: number;
  readonly rawKey: string;
  readonly key: string;
  readonly rawValue: string;
  readonly value: string;
  readonly kind: "utm" | "click-id" | "other";
  readonly clickId?: ClickIdInfo;
}

/** Relatório do inspetor. */
export interface Inspection {
  readonly protocol: string;
  readonly host: string;
  readonly port: string;
  readonly path: string;
  readonly hash: string;
  readonly params: readonly ParamInfo[];
  readonly issues: readonly Issue[];
}

/**
 * Quebra a query crua em parâmetros decodificados.
 *
 * Onde: etapa interna de `inspectUrl`. Entrada: query sem o "?".
 * Saída: lista de parâmetros e flag de codificação malformada por índice.
 */
function splitQuery(query: string): { params: ParamInfo[]; malformed: Set<number> } {
  const params: ParamInfo[] = [];
  const malformed = new Set<number>();
  query.split("&").forEach((pair) => {
    if (pair === "") return;
    const eq = pair.indexOf("=");
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
    const k = decodeComponent(rawKey, true);
    const v = decodeComponent(rawValue, true);
    const key = k.ok ? k.value : rawKey;
    const value = v.ok ? v.value : rawValue;
    const lower = key.toLowerCase();
    const clickId = identifyClickId(lower);
    const kind = lower.startsWith("utm_") ? "utm" : clickId ? "click-id" : "other";
    if (!k.ok || !v.ok) malformed.add(params.length);
    params.push({ index: params.length, rawKey, key, rawValue, value, kind, ...(clickId ? { clickId } : {}) });
  });
  return { params, malformed };
}

/**
 * Procura chaves repetidas e classifica como duplicada (mesmo valor) ou conflitante.
 *
 * Onde: etapa interna de `inspectUrl`. Entrada: parâmetros.
 * Saída: achados de duplicidade (utm = warning/error; demais = info).
 */
function duplicateIssues(params: readonly ParamInfo[]): Issue[] {
  const byKey = new Map<string, ParamInfo[]>();
  for (const p of params) {
    const k = p.key.toLowerCase();
    byKey.set(k, [...(byKey.get(k) ?? []), p]);
  }
  const issues: Issue[] = [];
  for (const [key, list] of byKey) {
    if (list.length < 2) continue;
    if (!key.startsWith("utm_")) {
      issues.push({ severity: "info", code: "duplicate-param", param: key });
      continue;
    }
    const distinct = new Set(list.map((p) => p.value));
    issues.push(
      distinct.size > 1
        ? { severity: "error", code: "utm-conflict", param: key }
        : { severity: "warning", code: "utm-duplicate", param: key },
    );
  }
  return issues;
}

/**
 * Avalia cada UTM individualmente (caixa, espaço, vazio, chave desconhecida).
 *
 * Onde: etapa interna de `inspectUrl`. Entrada: parâmetros.
 * Saída: achados por parâmetro, sem repetir o mesmo código para a mesma chave.
 */
function utmValueIssues(params: readonly ParamInfo[]): Issue[] {
  const out: Issue[] = [];
  const seen = new Set<string>();
  const push = (issue: Issue): void => {
    const id = `${issue.code}:${issue.param ?? ""}`;
    if (!seen.has(id)) {
      seen.add(id);
      out.push(issue);
    }
  };
  for (const p of params.filter((x) => x.kind === "utm")) {
    const param = p.key.toLowerCase();
    if (p.key !== param) push({ severity: "warning", code: "utm-key-case", param });
    if (!KNOWN_UTM.has(param)) push({ severity: "info", code: "utm-unknown-key", param });
    if (p.value.trim() === "") push({ severity: "warning", code: "utm-empty", param });
    if (p.value !== p.value.toLowerCase()) push({ severity: "warning", code: "utm-uppercase", param });
    if (/\s/.test(p.value)) push({ severity: "warning", code: "utm-whitespace", param });
    if (/%25[0-9a-f]{2}/i.test(p.rawValue)) push({ severity: "warning", code: "double-encoded", param });
  }
  return out;
}

/**
 * Inspeciona uma URL: parâmetros, UTMs problemáticas e identificadores de clique.
 *
 * O quê: análise 100% local; nunca lança exceção e nunca faz requisição.
 * Onde: ilha do Inspetor de URL a cada digitação. Entrada: texto cru.
 * Saída: Result com o relatório, ou código de erro (URL vazia/inválida).
 * Fluxo: textarea -> aqui -> tabela de parâmetros e lista de achados.
 */
export function inspectUrl(input: string): Result<Inspection, ParseUrlError> {
  const parsed = parseHttpUrl(input);
  if (!parsed.ok) return fail(parsed.error);
  const { url, assumedScheme } = parsed.value;
  const { params, malformed } = splitQuery(url.search.replace(/^\?/, ""));
  const issues: Issue[] = [];
  if (assumedScheme) issues.push({ severity: "info", code: "scheme-assumed" });
  if (url.username || url.password) issues.push({ severity: "warning", code: "credentials-in-url" });
  malformed.forEach((i) => {
    issues.push({ severity: "warning", code: "malformed-encoding", param: params[i]?.key ?? "" });
  });
  issues.push(...duplicateIssues(params), ...utmValueIssues(params));
  const utmKeys = new Set(params.filter((p) => p.kind === "utm").map((p) => p.key.toLowerCase()));
  if (utmKeys.size > 0) {
    for (const req of REQUIRED_UTM) {
      if (!utmKeys.has(req)) issues.push({ severity: "warning", code: "utm-missing-required", param: req });
    }
  }
  if (/utm_[a-z]/i.test(url.hash)) issues.push({ severity: "warning", code: "utm-in-fragment" });
  const clickIds = new Set(params.filter((p) => p.kind === "click-id").map((p) => p.key.toLowerCase()));
  if (clickIds.size > 1) issues.push({ severity: "info", code: "multiple-click-ids" });
  return ok({
    protocol: url.protocol.replace(":", ""),
    host: url.hostname,
    port: url.port,
    path: url.pathname,
    hash: url.hash,
    params,
    issues,
  });
}
