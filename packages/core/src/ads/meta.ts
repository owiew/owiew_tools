import { cutToLimit } from "./count-chars";
import { type FieldCheck, checkField } from "./google-rsa";

/**
 * Limites RECOMENDADOS do Meta para anúncio de imagem no Feed (Guia de anúncios
 * do Meta). São orientação, não bloqueio: o texto passa do limite e o Feed o
 * corta (texto principal atrás de "ver mais"; título e descrição com reticências).
 */
export const META_LIMITS = { primary: 125, headline: 27, description: 27 } as const;

/** Entrada: os três textos do anúncio Meta. */
export interface MetaInput {
  readonly primary: string;
  readonly headline: string;
  readonly description: string;
}

/** Um campo Meta avaliado, com o texto como o Feed o exibiria. */
export interface MetaField extends FieldCheck {
  /** Texto visível na simulação (cortado no limite, com reticências, se passou). */
  readonly shown: string;
  readonly truncated: boolean;
}

/** Resultado da verificação do Meta. */
export interface MetaCheck {
  readonly primary: MetaField;
  readonly headline: MetaField;
  readonly description: MetaField;
  /** True se nenhum campo passa do limite recomendado. */
  readonly withinLimits: boolean;
}

/**
 * Simula o truncamento de um campo do Meta.
 *
 * O quê: se passa do limite, corta no limite e acrescenta reticências. O ponto
 * exato de corte do Meta varia por posicionamento e largura; esta é uma
 * aproximação por contagem de caracteres.
 * Onde: etapa interna de `checkMeta`. Entradas: texto e limite. Saída: MetaField.
 */
function simulate(text: string, limit: number): MetaField {
  const base = checkField(text, limit);
  const truncated = base.over > 0;
  return { ...base, truncated, shown: truncated ? `${cutToLimit(text.trim(), limit)}…` : text.trim() };
}

/**
 * Verifica texto principal, título e descrição de um anúncio do Meta.
 *
 * Onde: ilha da ferramenta "Prévia de anúncio", aba Meta. Entrada: MetaInput.
 * Saída: MetaCheck com contagem, excesso e texto simulado. Sem efeitos.
 */
export function checkMeta(input: MetaInput): MetaCheck {
  const primary = simulate(input.primary, META_LIMITS.primary);
  const headline = simulate(input.headline, META_LIMITS.headline);
  const description = simulate(input.description, META_LIMITS.description);
  return { primary, headline, description, withinLimits: ![primary, headline, description].some((f) => f.truncated) };
}

