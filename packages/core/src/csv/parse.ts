/**
 * Detecta o delimitador pela primeira linha (vírgula, ponto e vírgula ou tab).
 *
 * Onde: lote CSV colado pelo usuário (planilhas em pt-BR exportam com ';').
 * Entrada: texto. Saída: o delimitador mais frequente (vírgula se empate).
 */
export function detectDelimiter(text: string): string {
  const first = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, first.split(d).length - 1] as const);
  const best = counts.reduce((a, b) => (b[1] > a[1] ? b : a));
  return best[1] > 0 ? best[0] : ",";
}

/**
 * Faz o parse de CSV (RFC 4180): aspas, aspas duplicadas, quebras dentro de célula.
 *
 * Onde: lote colado no gerador de UTM. Entradas: texto e delimitador (detectado
 * se omitido). Saída: matriz de células; linhas totalmente vazias são
 * descartadas. Nunca lança: aspa aberta no fim fecha a célula.
 */
export function parseCsv(text: string, delimiter?: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const d = delimiter ?? detectDelimiter(src);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const endCell = (): void => {
    row.push(cell);
    cell = "";
  };
  const endRow = (): void => {
    endCell();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src.charAt(i);
    if (quoted) {
      if (ch === '"' && src.charAt(i + 1) === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === d) endCell();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src.charAt(i + 1) === "\n") i++;
      endRow();
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) endRow();
  return rows;
}
