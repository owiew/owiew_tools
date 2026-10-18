import { type NamingOptions, type NamingSeparator } from "./types";

/**
 * Caractere que une palavras DENTRO de um bloco.
 *
 * O quê: o primeiro entre "-" e "_" que seja diferente do separador de blocos,
 * para o separador aparecer só entre blocos e o nome poder ser dividido de volta.
 * Onde: sanitizeBlock e a UI (texto explicativo). Entrada: separador.
 * Saída: "-" ou "_". Sem efeitos.
 */
export function wordJoiner(separator: NamingSeparator): "-" | "_" {
  return separator === "-" ? "_" : "-";
}

/**
 * Normaliza o texto de um bloco.
 *
 * O quê: apara, remove acento (opcional), aplica a caixa, troca qualquer
 * sequência de caractere que não seja letra ou número (espaço, símbolo, byte
 * nulo, emoji) por um único `wordJoiner` e tira o joiner das pontas.
 * Idempotente. Onde: buildName, para cada bloco. Entradas: texto cru e opções.
 * Saída: texto limpo (pode ser vazio). Sem efeitos.
 */
export function sanitizeBlock(raw: string, options: NamingOptions): string {
  let v = raw.normalize("NFC").trim();
  if (options.stripAccents) v = v.normalize("NFD").replace(/\p{M}/gu, "");
  if (options.caseMode === "lower") v = v.toLowerCase();
  else if (options.caseMode === "upper") v = v.toUpperCase();
  const joiner = wordJoiner(options.separator);
  v = v.replace(/[^\p{L}\p{N}\p{M}]+/gu, joiner);
  return v.replace(new RegExp(`^${joiner}+|${joiner}+$`, "g"), "");
}
