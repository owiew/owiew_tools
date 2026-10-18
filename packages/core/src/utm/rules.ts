/** Padrão de nomenclatura aplicado aos valores de UTM. */
export interface NamingRules {
  /** Converte tudo para minúsculas. */
  readonly lowercase: boolean;
  /** Remove acentos ("verão" vira "verao"). */
  readonly stripAccents: boolean;
  /** Separador no lugar de espaços e símbolos; "" junta tudo. */
  readonly separator: "-" | "_" | ".";
}

/** Padrão recomendado: minúsculas, sem acento, hífen. */
export const DEFAULT_RULES: NamingRules = { lowercase: true, stripAccents: true, separator: "-" };

/**
 * Valida um objeto vindo de fora (localStorage) como NamingRules.
 *
 * Onde: carregar o padrão salvo pelo usuário sem confiar no que está no
 * navegador (pode estar corrompido ou ter sido editado).
 * Entrada: unknown. Saída: NamingRules válidas; campos inválidos caem no padrão.
 */
export function coerceRules(raw: unknown): NamingRules {
  if (typeof raw !== "object" || raw === null) return DEFAULT_RULES;
  const r = raw as Record<string, unknown>;
  const separator = r["separator"];
  return {
    lowercase: typeof r["lowercase"] === "boolean" ? r["lowercase"] : DEFAULT_RULES.lowercase,
    stripAccents: typeof r["stripAccents"] === "boolean" ? r["stripAccents"] : DEFAULT_RULES.stripAccents,
    separator: separator === "-" || separator === "_" || separator === "." ? separator : DEFAULT_RULES.separator,
  };
}
