import { type NamingRules } from "./rules";

/**
 * Normaliza um valor de UTM conforme o padrão de nomenclatura.
 *
 * O quê: apara, tira acento, põe em minúsculas, troca espaços e símbolos pelo
 * separador e colapsa repetições. Idempotente: aplicar duas vezes dá o mesmo.
 * Onde: gerador de UTM (campo a campo e lote). Entradas: texto e regras.
 * Saída: valor limpo (pode ser vazio). Sem efeitos.
 */
export function normalizeValue(raw: string, rules: NamingRules): string {
  let v = raw.normalize("NFC").trim();
  if (rules.stripAccents) v = v.normalize("NFD").replace(/\p{M}/gu, "");
  if (rules.lowercase) v = v.toLowerCase();
  const sep = rules.separator;
  v = v.replace(/[^\p{L}\p{N}_.-]+/gu, sep);
  // "-", "_" e "." digitados pelo usuário são preservados; só o separador do padrão colapsa.
  const escaped = sep.replace(/[.\\-]/g, "\\$&");
  v = v.replace(new RegExp(`${escaped}{2,}`, "g"), sep);
  return v.replace(new RegExp(`^${escaped}+|${escaped}+$`, "g"), "");
}
