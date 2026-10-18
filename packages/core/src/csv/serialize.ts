/** Caracteres que fazem planilhas interpretarem a célula como fórmula. */
const FORMULA_START = /^[\s]*[=+\-@]|^[\t\r]/;

/**
 * Neutraliza CSV injection numa célula.
 *
 * O quê: prefixa apóstrofo quando a célula começa com =, +, -, @, tab ou CR
 * (também após espaços), para Excel/Sheets tratarem como texto.
 * Onde: usada por `escapeCsvCell`, portanto por toda exportação CSV do site.
 * Entrada: texto cru. Saída: texto seguro. Sem efeitos.
 */
export function neutralizeFormula(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

/**
 * Escapa uma célula para CSV (RFC 4180) já protegida contra CSV injection.
 *
 * Onde: `serializeCsv`. Entradas: valor e delimitador. Saída: célula pronta,
 * entre aspas quando contém delimitador, aspas ou quebra de linha.
 */
export function escapeCsvCell(value: string, delimiter = ","): string {
  const safe = neutralizeFormula(value.replace(/\0/g, ""));
  const needsQuotes = safe.includes(delimiter) || /["\r\n]/.test(safe);
  return needsQuotes ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Serializa linhas em texto CSV com CRLF e BOM opcional (Excel abre em UTF-8).
 *
 * Onde: botão "exportar CSV" do gerador de UTM em lote.
 * Entradas: matriz de strings, delimitador (padrão vírgula), flag de BOM.
 * Saída: texto CSV. Todas as células passam por `escapeCsvCell`.
 */
export function serializeCsv(
  rows: readonly (readonly string[])[],
  options: { delimiter?: string; bom?: boolean } = {},
): string {
  const delimiter = options.delimiter ?? ",";
  const body = rows.map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter)).join("\r\n");
  return (options.bom ? "\uFEFF" : "") + body;
}
