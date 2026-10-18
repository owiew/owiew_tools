/** Matriz de módulos: `true` = módulo escuro. */
export type QrMatrix = readonly (readonly boolean[])[];

/**
 * Gera o `d` de um `<path>` SVG com um retângulo por sequência horizontal de
 * módulos escuros, já deslocado pela margem (zona de silêncio).
 *
 * Onde: pré-visualização (JSX), PNG (Path2D) e SVG baixado usam o MESMO caminho,
 * então o que se vê é o que se baixa. Entradas: matriz e margem em módulos
 * (inteiro >= 0). Saída: string só com números e comandos M/h/v/H/z. Sem efeitos.
 */
export function qrPathData(matrix: QrMatrix, margin: number): string {
  const parts: string[] = [];
  matrix.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x += 1; continue; }
      const start = x;
      while (x < row.length && row[x]) x += 1;
      parts.push(`M${start + margin} ${y + margin}h${x - start}v1h-${x - start}z`);
    }
  });
  return parts.join("");
}

/** Opções do SVG final (cores já validadas como hexadecimais). */
export interface SvgOptions {
  readonly margin: number;
  /** Lado em px do SVG final. */
  readonly sizePx: number;
  readonly fg: string;
  readonly bg: string;
}

/**
 * Monta o documento SVG completo do QR Code, sem script nem recurso externo.
 *
 * Onde: botão "baixar SVG" e teste de ida e volta. Entradas: matriz e opções
 * (cores `#hex`, números inteiros). Saída: texto SVG com fundo e módulos,
 * `shape-rendering="crispEdges"` e `viewBox` em unidades de módulo. Sem efeitos.
 */
export function renderQrSvg(matrix: QrMatrix, o: SvgOptions): string {
  const total = matrix.length + o.margin * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${o.sizePx}" height="${o.sizePx}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img">` +
    `<rect width="${total}" height="${total}" fill="${o.bg}"/>` +
    `<path fill="${o.fg}" d="${qrPathData(matrix, o.margin)}"/></svg>`
  );
}
