import { type Lang } from "../../src/i18n/locales";

/** Textos da interface da ferramenta Teste A/B. */
export interface AbStrings {
  readonly tabSig: string;
  readonly tabSample: string;
  readonly groupA: string;
  readonly groupB: string;
  readonly visitors: string;
  readonly visitorsHint: string;
  readonly conversions: string;
  readonly confidence: string;
  readonly tails: string;
  readonly tailsTwo: string;
  readonly tailsOne: string;
  readonly results: string;
  readonly rate: string;
  readonly diff: string;
  readonly uplift: string;
  readonly z: string;
  readonly pValue: string;
  readonly ci: string;
  readonly verdict: Record<"a" | "b" | "none" | "no-variation", string>;
  readonly warnings: Record<"small-sample" | "no-variation", string>;
  readonly errors: Record<string, string>;
  readonly fix: string;
  readonly baseline: string;
  readonly baselineHint: string;
  readonly mde: string;
  readonly mdeHint: string;
  readonly mdeKind: string;
  readonly relative: string;
  readonly absolute: string;
  readonly power: string;
  readonly daily: string;
  readonly dailyHint: string;
  readonly perGroup: string;
  readonly total: string;
  readonly days: string;
  readonly target: string;
  readonly sampleNote: string;
  readonly notAvailable: string;
  readonly example: { readonly visitors: string; readonly convA: string; readonly convB: string; readonly baseline: string; readonly mde: string; readonly daily: string };
}

const parseErrorsPt = { empty: "Preencha este campo.", invalid: "Use apenas números.", negative: "O valor não pode ser negativo.", "too-many-decimals": "Use no máximo duas casas decimais.", "too-large": "O valor é grande demais." };
const parseErrorsEn = { empty: "Fill in this field.", invalid: "Use numbers only.", negative: "The value cannot be negative.", "too-many-decimals": "Use at most two decimal places.", "too-large": "The value is too large." };
const parseErrorsEs = { empty: "Completa este campo.", invalid: "Usa solo números.", negative: "El valor no puede ser negativo.", "too-many-decimals": "Usa como máximo dos decimales.", "too-large": "El valor es demasiado grande." };

const pt: AbStrings = {
  tabSig: "Significância do teste", tabSample: "Tamanho de amostra",
  groupA: "A (controle)", groupB: "B (variante)",
  visitors: "Visitantes", visitorsHint: "Quantas pessoas viram esta versão.", conversions: "Conversões",
  confidence: "Nível de confiança", tails: "Tipo de teste", tailsTwo: "Bilateral (há diferença?)", tailsOne: "Unilateral (B é melhor?)",
  results: "Resultado", rate: "Taxa de conversão", diff: "Diferença (B − A)", uplift: "Ganho relativo de B", z: "Estatística z", pValue: "p-valor", ci: "Intervalo de confiança da diferença",
  verdict: {
    b: "B venceu: a diferença é estatisticamente significativa no nível de confiança escolhido.",
    a: "A venceu: B é pior e a diferença é estatisticamente significativa no nível de confiança escolhido.",
    none: "Inconclusivo: a diferença observada pode ser acaso. Continue o teste até atingir a amostra planejada.",
    "no-variation": "Sem variação: nenhuma das versões converteu (ou todas converteram), então não há o que comparar.",
  },
  warnings: { "small-sample": "Há menos de 5 conversões (ou 5 não conversões) em algum grupo. O teste z fica pouco confiável; colete mais dados.", "no-variation": "As duas taxas são 0% ou 100%." },
  errors: { ...parseErrorsPt, "invalid-count": "Use números inteiros, sem negativos.", "conversions-exceed-visitors": "As conversões não podem passar dos visitantes.", "no-visitors": "Informe pelo menos 1 visitante em cada versão.", "invalid-confidence": "Escolha um nível de confiança válido.", "invalid-tails": "Escolha o tipo de teste.", "invalid-baseline": "A taxa atual precisa estar entre 0,01% e 99,99%.", "invalid-mde": "Informe um efeito mínimo maior que zero.", "invalid-power": "Escolha um poder válido.", "target-out-of-range": "Com esse efeito, a taxa da variante passaria de 100%. Reduza o efeito.", "too-large": "A amostra necessária passa de 1 bilhão por grupo: o teste é inviável com esse efeito." },
  fix: "Corrija os campos destacados para ver o resultado.",
  baseline: "Taxa de conversão atual (%)", baselineHint: "A taxa do controle hoje, por exemplo 5.",
  mde: "Efeito mínimo detectável (MDE)", mdeHint: "O menor ganho que valeria a pena detectar.", mdeKind: "O MDE é", relative: "Relativo (% da taxa atual)", absolute: "Absoluto (pontos percentuais)",
  power: "Poder estatístico", daily: "Visitantes por dia no teste (opcional)", dailyHint: "Soma das duas versões. Serve para estimar a duração.",
  perGroup: "Visitantes por versão", total: "Total de visitantes", days: "Duração estimada", target: "Taxa esperada da variante",
  sampleNote: "Calculado para detectar o MDE com o poder escolhido. Se o ganho real for menor que o MDE, a amostra não basta.",
  notAvailable: "n/d",
  example: { visitors: "5.000", convA: "250", convB: "310", baseline: "5", mde: "20", daily: "1.000" },
};

const en: AbStrings = {
  tabSig: "Test significance", tabSample: "Sample size",
  groupA: "A (control)", groupB: "B (variant)",
  visitors: "Visitors", visitorsHint: "How many people saw this version.", conversions: "Conversions",
  confidence: "Confidence level", tails: "Test type", tailsTwo: "Two-sided (is there a difference?)", tailsOne: "One-sided (is B better?)",
  results: "Result", rate: "Conversion rate", diff: "Difference (B − A)", uplift: "Relative lift of B", z: "z statistic", pValue: "p-value", ci: "Confidence interval of the difference",
  verdict: {
    b: "B won: the difference is statistically significant at the chosen confidence level.",
    a: "A won: B is worse and the difference is statistically significant at the chosen confidence level.",
    none: "Inconclusive: the observed difference may be chance. Keep the test running until it reaches the planned sample.",
    "no-variation": "No variation: neither version converted (or all did), so there is nothing to compare.",
  },
  warnings: { "small-sample": "Some group has fewer than 5 conversions (or 5 non-conversions). The z-test is unreliable; collect more data.", "no-variation": "Both rates are 0% or 100%." },
  errors: { ...parseErrorsEn, "invalid-count": "Use whole numbers, no negatives.", "conversions-exceed-visitors": "Conversions cannot exceed visitors.", "no-visitors": "Enter at least 1 visitor in each version.", "invalid-confidence": "Pick a valid confidence level.", "invalid-tails": "Pick the test type.", "invalid-baseline": "The current rate must be between 0.01% and 99.99%.", "invalid-mde": "Enter a minimum effect greater than zero.", "invalid-power": "Pick a valid power.", "target-out-of-range": "With this effect the variant rate would exceed 100%. Lower the effect.", "too-large": "The required sample exceeds 1 billion per group: the test is not feasible with this effect." },
  fix: "Fix the highlighted fields to see the result.",
  baseline: "Current conversion rate (%)", baselineHint: "The control rate today, for example 5.",
  mde: "Minimum detectable effect (MDE)", mdeHint: "The smallest lift that would be worth detecting.", mdeKind: "The MDE is", relative: "Relative (% of the current rate)", absolute: "Absolute (percentage points)",
  power: "Statistical power", daily: "Visitors per day in the test (optional)", dailyHint: "Sum of both versions. Used to estimate duration.",
  perGroup: "Visitors per version", total: "Total visitors", days: "Estimated duration", target: "Expected variant rate",
  sampleNote: "Computed to detect the MDE at the chosen power. If the real lift is smaller than the MDE, the sample is not enough.",
  notAvailable: "n/a",
  example: { visitors: "5,000", convA: "250", convB: "310", baseline: "5", mde: "20", daily: "1,000" },
};

const es: AbStrings = {
  tabSig: "Significancia de la prueba", tabSample: "Tamaño de muestra",
  groupA: "A (control)", groupB: "B (variante)",
  visitors: "Visitantes", visitorsHint: "Cuántas personas vieron esta versión.", conversions: "Conversiones",
  confidence: "Nivel de confianza", tails: "Tipo de prueba", tailsTwo: "Bilateral (¿hay diferencia?)", tailsOne: "Unilateral (¿B es mejor?)",
  results: "Resultado", rate: "Tasa de conversión", diff: "Diferencia (B − A)", uplift: "Mejora relativa de B", z: "Estadístico z", pValue: "Valor p", ci: "Intervalo de confianza de la diferencia",
  verdict: {
    b: "B ganó: la diferencia es estadísticamente significativa con el nivel de confianza elegido.",
    a: "A ganó: B es peor y la diferencia es estadísticamente significativa con el nivel de confianza elegido.",
    none: "No concluyente: la diferencia observada puede ser azar. Sigue la prueba hasta alcanzar la muestra planeada.",
    "no-variation": "Sin variación: ninguna versión convirtió (o todas lo hicieron), así que no hay qué comparar.",
  },
  warnings: { "small-sample": "Algún grupo tiene menos de 5 conversiones (o 5 no conversiones). La prueba z es poco fiable; reúne más datos.", "no-variation": "Las dos tasas son 0% o 100%." },
  errors: { ...parseErrorsEs, "invalid-count": "Usa números enteros, sin negativos.", "conversions-exceed-visitors": "Las conversiones no pueden superar a los visitantes.", "no-visitors": "Indica al menos 1 visitante en cada versión.", "invalid-confidence": "Elige un nivel de confianza válido.", "invalid-tails": "Elige el tipo de prueba.", "invalid-baseline": "La tasa actual debe estar entre 0,01% y 99,99%.", "invalid-mde": "Indica un efecto mínimo mayor que cero.", "invalid-power": "Elige una potencia válida.", "target-out-of-range": "Con ese efecto la tasa de la variante pasaría del 100%. Reduce el efecto.", "too-large": "La muestra necesaria supera los 1000 millones por grupo: la prueba no es viable con ese efecto." },
  fix: "Corrige los campos resaltados para ver el resultado.",
  baseline: "Tasa de conversión actual (%)", baselineHint: "La tasa del control hoy, por ejemplo 5.",
  mde: "Efecto mínimo detectable (MDE)", mdeHint: "La mejora más pequeña que valdría la pena detectar.", mdeKind: "El MDE es", relative: "Relativo (% de la tasa actual)", absolute: "Absoluto (puntos porcentuales)",
  power: "Potencia estadística", daily: "Visitantes por día en la prueba (opcional)", dailyHint: "Suma de las dos versiones. Sirve para estimar la duración.",
  perGroup: "Visitantes por versión", total: "Total de visitantes", days: "Duración estimada", target: "Tasa esperada de la variante",
  sampleNote: "Calculado para detectar el MDE con la potencia elegida. Si la mejora real es menor que el MDE, la muestra no alcanza.",
  notAvailable: "n/d",
  example: { visitors: "5.000", convA: "250", convB: "310", baseline: "5", mde: "20", daily: "1.000" },
};

const ALL: Record<Lang, AbStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Teste A/B no idioma pedido.
 *
 * Onde: Ui.tsx e painéis. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): AbStrings {
  return ALL[lang];
}
