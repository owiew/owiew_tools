/**
 * Divide um nome de campanha de volta nos blocos.
 *
 * O quê: faz o caminho inverso do gerador. Como o separador só aparece entre
 * blocos, `split` devolve cada bloco inteiro. Onde: painel "como decodificar"
 * da UI. Entradas: nome e separador. Saída: lista de blocos (vazia se o nome
 * for vazio). Sem efeitos.
 */
export function splitName(name: string, separator: string): string[] {
  if (name === "" || separator === "") return name === "" ? [] : [name];
  return name.split(separator);
}
