import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Estimador de tráfego orgânico. */
export interface OrganicStrings {
  readonly rows: string;
  readonly rowsHint: string;
  readonly exampleRows: string;
  readonly scenario: string;
  readonly target: string;
  readonly rise: string;
  readonly targetValue: string;
  readonly riseValue: string;
  readonly valueHint: string;
  readonly result: string;
  readonly cols: {
    readonly keyword: string; readonly volume: string; readonly position: string; readonly newPosition: string;
    readonly now: string; readonly scenario: string; readonly gain: string;
  };
  readonly tableLabel: string;
  readonly total: string;
  readonly summary: (now: string, next: string, gain: string) => string;
  readonly curve: string;
  readonly curveCombined: string;
  readonly curveNoAi: string;
  readonly curveHint: string;
  readonly ctrTitle: string;
  readonly ctrCols: { readonly position: string; readonly ctr: string; readonly origin: string };
  readonly measured: string;
  readonly ctrSource: string;
  readonly lineError: (line: number, reason: string) => string;
  readonly lineReasons: Record<string, string>;
  readonly truncated: string;
  readonly errors: Record<string, string>;
}

const pt: OrganicStrings = {
  rows: "Palavras-chave, volume mensal e posição atual",
  rowsHint: "Uma por linha: palavra-chave; volume; posição. Pode colar de uma planilha. Até 200 linhas.",
  exampleRows: "tênis de corrida;12.100;5\nmeia esportiva;3.600;8\nmochila de trilha;1.300;14",
  scenario: "Cenário de subida",
  target: "Chegar a uma posição",
  rise: "Subir posições",
  targetValue: "Posição desejada",
  riseValue: "Posições a subir",
  valueHint: "Número inteiro. A posição desejada vai de 1 a 100.",
  result: "Tráfego orgânico estimado por mês",
  cols: { keyword: "Palavra-chave", volume: "Volume", position: "Posição", newPosition: "Posição no cenário", now: "Cliques hoje", scenario: "Cliques no cenário", gain: "Ganho" },
  tableLabel: "Cliques estimados por palavra-chave",
  total: "Total",
  summary: (now, next, gain) => `Hoje: ${now} cliques por mês. No cenário: ${next}. Ganho estimado: ${gain} cliques por mês.`,
  curve: "Curva de CTR",
  curveCombined: "Com resumos de IA (combinado)",
  curveNoAi: "Sem resposta de IA",
  curveHint: "Combinado: média das buscas com e sem resumo de IA no topo da página, a curva padrão para prever tráfego hoje. Sem resposta de IA: só as buscas em que o Google não mostra resumo de IA, com CTR bem maior. Fonte: First Page Sage, 22/09/2026.",
  ctrTitle: "Curva de CTR usada",
  ctrCols: { position: "Posição", ctr: "CTR", origin: "Origem" },
  measured: "Publicado (First Page Sage, 2026)",
  ctrSource: "Fonte: First Page Sage, \"Google Click-Through Rates (CTR) by Ranking Position\", colunas CTR combinado (padrão) e sem resposta de IA, edição de 22/09/2026 (https://www.firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/). Posição 11 em diante vale 0%.",
  lineError: (line, reason) => `Linha ${line}: ${reason}`,
  lineReasons: {
    columns: "use três colunas: palavra-chave; volume; posição.",
    volume: "o volume precisa ser um número inteiro, como 12.100.",
    position: "a posição precisa ser um inteiro de 1 a 100.",
    keyword: "a palavra-chave está vazia ou tem caracteres inválidos.",
  },
  truncated: "Passou de 200 linhas: as extras foram ignoradas.",
  errors: {
    "no-keywords": "Informe pelo menos uma palavra-chave válida.",
    "too-many-keywords": "Use no máximo 200 palavras-chave.",
    "invalid-volume": "O volume está fora do limite.",
    "invalid-position": "A posição precisa ser de 1 a 100.",
    "invalid-scenario": "Informe um número inteiro válido para o cenário.",
  },
};

const en: OrganicStrings = {
  rows: "Keywords, monthly volume and current position",
  rowsHint: "One per line: keyword; volume; position. You can paste from a spreadsheet. Up to 200 lines.",
  exampleRows: "running shoes;12,100;5\nsports socks;3,600;8\nhiking backpack;1,300;14",
  scenario: "Climb scenario",
  target: "Reach a position",
  rise: "Climb positions",
  targetValue: "Target position",
  riseValue: "Positions to climb",
  valueHint: "Whole number. The target position goes from 1 to 100.",
  result: "Estimated organic traffic per month",
  cols: { keyword: "Keyword", volume: "Volume", position: "Position", newPosition: "Scenario position", now: "Clicks today", scenario: "Scenario clicks", gain: "Gain" },
  tableLabel: "Estimated clicks per keyword",
  total: "Total",
  summary: (now, next, gain) => `Today: ${now} clicks per month. In the scenario: ${next}. Estimated gain: ${gain} clicks per month.`,
  curve: "CTR curve",
  curveCombined: "With AI summaries (blended)",
  curveNoAi: "Without an AI answer",
  curveHint: "Blended: average of searches with and without an AI summary at the top of the page, the default curve for forecasting traffic today. Without an AI answer: only searches where Google shows no AI summary, with much higher CTR. Source: First Page Sage, September 22, 2026.",
  ctrTitle: "CTR curve used",
  ctrCols: { position: "Position", ctr: "CTR", origin: "Origin" },
  measured: "Published (First Page Sage, 2026)",
  ctrSource: "Source: First Page Sage, \"Google Click-Through Rates (CTR) by Ranking Position\", blended CTR (default) and no-AI-answer columns, September 22, 2026 edition (https://www.firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/). Position 11 onward counts as 0%.",
  lineError: (line, reason) => `Line ${line}: ${reason}`,
  lineReasons: {
    columns: "use three columns: keyword; volume; position.",
    volume: "the volume must be a whole number, such as 12,100.",
    position: "the position must be a whole number from 1 to 100.",
    keyword: "the keyword is empty or has invalid characters.",
  },
  truncated: "More than 200 lines: the extra ones were ignored.",
  errors: {
    "no-keywords": "Enter at least one valid keyword.",
    "too-many-keywords": "Use at most 200 keywords.",
    "invalid-volume": "The volume is out of range.",
    "invalid-position": "The position must be from 1 to 100.",
    "invalid-scenario": "Enter a valid whole number for the scenario.",
  },
};

const es: OrganicStrings = {
  rows: "Palabras clave, volumen mensual y posición actual",
  rowsHint: "Una por línea: palabra clave; volumen; posición. Puedes pegar desde una hoja de cálculo. Hasta 200 líneas.",
  exampleRows: "zapatillas de correr;12.100;5\ncalcetines deportivos;3.600;8\nmochila de senderismo;1.300;14",
  scenario: "Escenario de subida",
  target: "Llegar a una posición",
  rise: "Subir posiciones",
  targetValue: "Posición deseada",
  riseValue: "Posiciones a subir",
  valueHint: "Número entero. La posición deseada va de 1 a 100.",
  result: "Tráfico orgánico estimado por mes",
  cols: { keyword: "Palabra clave", volume: "Volumen", position: "Posición", newPosition: "Posición en el escenario", now: "Clics hoy", scenario: "Clics en el escenario", gain: "Ganancia" },
  tableLabel: "Clics estimados por palabra clave",
  total: "Total",
  summary: (now, next, gain) => `Hoy: ${now} clics por mes. En el escenario: ${next}. Ganancia estimada: ${gain} clics por mes.`,
  curve: "Curva de CTR",
  curveCombined: "Con resúmenes de IA (combinado)",
  curveNoAi: "Sin respuesta de IA",
  curveHint: "Combinado: promedio de las búsquedas con y sin resumen de IA arriba en la página, la curva por defecto para pronosticar tráfico hoy. Sin respuesta de IA: solo las búsquedas en las que Google no muestra resumen de IA, con un CTR mucho mayor. Fuente: First Page Sage, 22/09/2026.",
  ctrTitle: "Curva de CTR usada",
  ctrCols: { position: "Posición", ctr: "CTR", origin: "Origen" },
  measured: "Publicado (First Page Sage, 2026)",
  ctrSource: "Fuente: First Page Sage, \"Google Click-Through Rates (CTR) by Ranking Position\", columnas CTR combinado (por defecto) y sin respuesta de IA, edición del 22/09/2026 (https://www.firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/). La posición 11 en adelante vale 0%.",
  lineError: (line, reason) => `Línea ${line}: ${reason}`,
  lineReasons: {
    columns: "usa tres columnas: palabra clave; volumen; posición.",
    volume: "el volumen debe ser un número entero, como 12.100.",
    position: "la posición debe ser un entero de 1 a 100.",
    keyword: "la palabra clave está vacía o tiene caracteres no válidos.",
  },
  truncated: "Más de 200 líneas: las sobrantes se ignoraron.",
  errors: {
    "no-keywords": "Indica al menos una palabra clave válida.",
    "too-many-keywords": "Usa como máximo 200 palabras clave.",
    "invalid-volume": "El volumen está fuera del límite.",
    "invalid-position": "La posición debe ser de 1 a 100.",
    "invalid-scenario": "Indica un número entero válido para el escenario.",
  },
};

const ALL: Record<Lang, OrganicStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Estimador de tráfego orgânico no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): OrganicStrings {
  return ALL[lang];
}
