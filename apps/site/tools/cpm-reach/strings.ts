import { type Lang } from "../../src/i18n/locales";

/** Textos da interface da Calculadora de CPM, alcance e frequência. */
export interface CpmReachStrings {
  readonly currency: string;
  readonly modeLegend: string;
  readonly modes: Record<"impressions" | "reach" | "cpm" | "budget", string>;
  readonly spend: string;
  readonly spendHint: string;
  readonly cost: string;
  readonly costHint: string;
  readonly cpm: string;
  readonly cpmHint: string;
  readonly frequency: string;
  readonly frequencyHint: string;
  readonly impressions: string;
  readonly impressionsHint: string;
  readonly reachGoal: string;
  readonly reachGoalHint: string;
  readonly ctr: string;
  readonly ctrHint: string;
  readonly example: Record<"spend" | "cost" | "cpm" | "frequency" | "impressions" | "reach" | "ctr", string>;
  readonly results: string;
  readonly out: Record<"impressions" | "reach" | "reachGoal" | "cpm" | "spend" | "spendNeeded" | "frequency" | "clicks" | "cpc", string>;
  readonly notAvailable: string;
  readonly estimateNote: string;
  readonly roundingNote: string;
  readonly noClicksNote: string;
  readonly fieldErrors: Record<string, string>;
  readonly zeroCpm: string;
  readonly zeroImpressions: string;
  readonly zeroReach: string;
  readonly lowFrequency: string;
  readonly ctrRange: string;
  readonly overflow: string;
  readonly fix: string;
}

const pt: CpmReachStrings = {
  currency: "Moeda",
  modeLegend: "O que você quer calcular",
  modes: {
    impressions: "Calcular impressões",
    reach: "Estimar alcance",
    cpm: "Calcular CPM",
    budget: "Calcular verba necessária",
  },
  spend: "Verba investida",
  spendHint: "Quanto será gasto com anúncios na campanha.",
  cost: "Custo total",
  costHint: "Quanto a campanha custou para entregar essas impressões.",
  cpm: "CPM (custo por mil impressões)",
  cpmHint: "Quanto você paga a cada mil impressões entregues.",
  frequency: "Frequência média (vezes por pessoa)",
  frequencyHint: "Quantas vezes, em média, cada pessoa vê o anúncio. Use 1 ou mais.",
  impressions: "Impressões",
  impressionsHint: "Número total de vezes que o anúncio foi exibido.",
  reachGoal: "Meta de alcance (pessoas)",
  reachGoalHint: "Quantas pessoas diferentes você quer atingir.",
  ctr: "CTR (opcional, %)",
  ctrHint: "Deixe em branco para não estimar cliques e CPC.",
  example: { spend: "5.000,00", cost: "25.000,00", cpm: "25,00", frequency: "2,5", impressions: "1.000.000", reach: "200.000", ctr: "1,5" },
  results: "Resultado",
  out: {
    impressions: "Impressões",
    reach: "Alcance estimado",
    reachGoal: "Meta de alcance",
    cpm: "CPM",
    spend: "Verba",
    spendNeeded: "Verba necessária",
    frequency: "Frequência assumida",
    clicks: "Cliques estimados",
    cpc: "CPC estimado",
  },
  notAvailable: "n/d",
  estimateNote: "O alcance é uma estimativa: impressões divididas pela frequência que você assumiu. O alcance real vem do relatório da plataforma e costuma ser diferente.",
  roundingNote: "Arredondamento: impressões e alcance para baixo, verba para cima, CPM e CPC ao centavo mais próximo.",
  noClicksNote: "Com esse CTR não há cliques estimados, então o CPC não existe.",
  fieldErrors: {
    empty: "Preencha este campo.",
    invalid: "Use apenas números, por exemplo 1.250,50.",
    negative: "O valor não pode ser negativo.",
    "too-many-decimals": "Use menos casas decimais neste campo.",
    "too-large": "O valor é grande demais.",
  },
  zeroCpm: "O CPM precisa ser maior que zero.",
  zeroImpressions: "As impressões precisam ser maiores que zero.",
  zeroReach: "A meta de alcance precisa ser maior que zero.",
  lowFrequency: "A frequência precisa ser 1 ou mais.",
  ctrRange: "O CTR precisa estar entre 0 e 100%.",
  overflow: "O resultado é grande demais para ser calculado. Reduza a verba, as impressões ou a meta.",
  fix: "Corrija os campos destacados para ver o resultado.",
};

const en: CpmReachStrings = {
  currency: "Currency",
  modeLegend: "What do you want to calculate",
  modes: {
    impressions: "Calculate impressions",
    reach: "Estimate reach",
    cpm: "Calculate CPM",
    budget: "Calculate budget needed",
  },
  spend: "Budget",
  spendHint: "How much will be spent on ads in the campaign.",
  cost: "Total cost",
  costHint: "How much the campaign cost to deliver these impressions.",
  cpm: "CPM (cost per thousand impressions)",
  cpmHint: "How much you pay for every thousand impressions delivered.",
  frequency: "Average frequency (times per person)",
  frequencyHint: "How many times, on average, each person sees the ad. Use 1 or more.",
  impressions: "Impressions",
  impressionsHint: "Total number of times the ad was shown.",
  reachGoal: "Reach goal (people)",
  reachGoalHint: "How many different people you want to reach.",
  ctr: "CTR (optional, %)",
  ctrHint: "Leave blank to skip the click and CPC estimate.",
  example: { spend: "5,000.00", cost: "25,000.00", cpm: "25.00", frequency: "2.5", impressions: "1,000,000", reach: "200,000", ctr: "1.5" },
  results: "Result",
  out: {
    impressions: "Impressions",
    reach: "Estimated reach",
    reachGoal: "Reach goal",
    cpm: "CPM",
    spend: "Budget",
    spendNeeded: "Budget needed",
    frequency: "Assumed frequency",
    clicks: "Estimated clicks",
    cpc: "Estimated CPC",
  },
  notAvailable: "n/a",
  estimateNote: "Reach is an estimate: impressions divided by the frequency you assumed. Real reach comes from the platform report and is usually different.",
  roundingNote: "Rounding: impressions and reach round down, budget rounds up, CPM and CPC to the nearest cent.",
  noClicksNote: "At this CTR there are no estimated clicks, so CPC does not exist.",
  fieldErrors: {
    empty: "Fill in this field.",
    invalid: "Use numbers only, for example 1,250.50.",
    negative: "The value cannot be negative.",
    "too-many-decimals": "Use fewer decimal places in this field.",
    "too-large": "The value is too large.",
  },
  zeroCpm: "CPM must be greater than zero.",
  zeroImpressions: "Impressions must be greater than zero.",
  zeroReach: "The reach goal must be greater than zero.",
  lowFrequency: "Frequency must be 1 or more.",
  ctrRange: "CTR must be between 0 and 100%.",
  overflow: "The result is too large to calculate. Reduce the budget, impressions or goal.",
  fix: "Fix the highlighted fields to see the result.",
};

const es: CpmReachStrings = {
  currency: "Moneda",
  modeLegend: "Qué quieres calcular",
  modes: {
    impressions: "Calcular impresiones",
    reach: "Estimar alcance",
    cpm: "Calcular CPM",
    budget: "Calcular inversión necesaria",
  },
  spend: "Inversión",
  spendHint: "Cuánto se gastará en anuncios en la campaña.",
  cost: "Costo total",
  costHint: "Cuánto costó la campaña para entregar esas impresiones.",
  cpm: "CPM (costo por mil impresiones)",
  cpmHint: "Cuánto pagas por cada mil impresiones entregadas.",
  frequency: "Frecuencia media (veces por persona)",
  frequencyHint: "Cuántas veces, en promedio, cada persona ve el anuncio. Usa 1 o más.",
  impressions: "Impresiones",
  impressionsHint: "Número total de veces que se mostró el anuncio.",
  reachGoal: "Meta de alcance (personas)",
  reachGoalHint: "A cuántas personas distintas quieres llegar.",
  ctr: "CTR (opcional, %)",
  ctrHint: "Déjalo en blanco para no estimar clics ni CPC.",
  example: { spend: "5.000,00", cost: "25.000,00", cpm: "25,00", frequency: "2,5", impressions: "1.000.000", reach: "200.000", ctr: "1,5" },
  results: "Resultado",
  out: {
    impressions: "Impresiones",
    reach: "Alcance estimado",
    reachGoal: "Meta de alcance",
    cpm: "CPM",
    spend: "Inversión",
    spendNeeded: "Inversión necesaria",
    frequency: "Frecuencia asumida",
    clicks: "Clics estimados",
    cpc: "CPC estimado",
  },
  notAvailable: "n/d",
  estimateNote: "El alcance es una estimación: impresiones divididas por la frecuencia que asumiste. El alcance real viene del informe de la plataforma y suele ser distinto.",
  roundingNote: "Redondeo: impresiones y alcance hacia abajo, inversión hacia arriba, CPM y CPC al centavo más cercano.",
  noClicksNote: "Con este CTR no hay clics estimados, así que el CPC no existe.",
  fieldErrors: {
    empty: "Completa este campo.",
    invalid: "Usa solo números, por ejemplo 1.250,50.",
    negative: "El valor no puede ser negativo.",
    "too-many-decimals": "Usa menos decimales en este campo.",
    "too-large": "El valor es demasiado grande.",
  },
  zeroCpm: "El CPM debe ser mayor que cero.",
  zeroImpressions: "Las impresiones deben ser mayores que cero.",
  zeroReach: "La meta de alcance debe ser mayor que cero.",
  lowFrequency: "La frecuencia debe ser 1 o más.",
  ctrRange: "El CTR debe estar entre 0 y 100%.",
  overflow: "El resultado es demasiado grande para calcularse. Reduce la inversión, las impresiones o la meta.",
  fix: "Corrige los campos resaltados para ver el resultado.",
};

const ALL: Record<Lang, CpmReachStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos da Calculadora de CPM e alcance no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): CpmReachStrings {
  return ALL[lang];
}
