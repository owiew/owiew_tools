import { type Lang } from "../../src/i18n/locales";

/** Textos da interface da Calculadora de ROAS. */
export interface RoasStrings {
  readonly currency: string;
  readonly revenue: string;
  readonly revenueHint: string;
  readonly spend: string;
  readonly spendHint: string;
  readonly margin: string;
  readonly marginHint: string;
  readonly example: { readonly revenue: string; readonly spend: string; readonly margin: string };
  readonly results: string;
  readonly roas: string;
  readonly breakEven: string;
  readonly contribution: string;
  readonly profit: string;
  readonly profitMargin: string;
  readonly breakEvenRevenue: string;
  readonly maxSpend: string;
  readonly notAvailable: string;
  readonly verdict: Record<"no-spend" | "profit" | "breakeven" | "loss", string>;
  readonly fieldErrors: Record<string, string>;
  readonly marginRange: string;
  readonly fix: string;
}

const pt: RoasStrings = {
  currency: "Moeda",
  revenue: "Receita atribuída aos anúncios",
  revenueHint: "Total vendido pela campanha no período.",
  spend: "Investimento em mídia",
  spendHint: "Quanto você gastou com anúncios no mesmo período.",
  margin: "Margem de contribuição (%)",
  marginHint: "Percentual da receita que sobra depois de custo do produto, impostos e taxas, antes da mídia.",
  example: { revenue: "10.000,00", spend: "2.500,00", margin: "40" },
  results: "Resultado",
  roas: "ROAS",
  breakEven: "ROAS de equilíbrio",
  contribution: "Margem de contribuição",
  profit: "Lucro depois da mídia",
  profitMargin: "Lucro sobre a receita",
  breakEvenRevenue: "Receita para empatar",
  maxSpend: "Investimento máximo sem prejuízo",
  notAvailable: "n/d",
  verdict: {
    "no-spend": "Informe um investimento maior que zero para calcular o ROAS.",
    profit: "A campanha está acima do ponto de equilíbrio: cada real investido volta com lucro.",
    breakeven: "A campanha está exatamente no ponto de equilíbrio: sem lucro e sem prejuízo.",
    loss: "A campanha está abaixo do ponto de equilíbrio: a receita não cobre custo do produto e mídia.",
  },
  fieldErrors: {
    empty: "Preencha este campo.",
    invalid: "Use apenas números, por exemplo 1.250,50.",
    negative: "O valor não pode ser negativo.",
    "too-many-decimals": "Use no máximo duas casas decimais.",
    "too-large": "O valor é grande demais.",
  },
  marginRange: "A margem precisa estar entre 0 e 100%.",
  fix: "Corrija os campos destacados para ver o resultado.",
};

const en: RoasStrings = {
  currency: "Currency",
  revenue: "Revenue attributed to ads",
  revenueHint: "Total sold by the campaign in the period.",
  spend: "Ad spend",
  spendHint: "How much you spent on ads in the same period.",
  margin: "Contribution margin (%)",
  marginHint: "Share of revenue left after product cost, taxes and fees, before ad spend.",
  example: { revenue: "10,000.00", spend: "2,500.00", margin: "40" },
  results: "Result",
  roas: "ROAS",
  breakEven: "Break-even ROAS",
  contribution: "Contribution margin",
  profit: "Profit after ad spend",
  profitMargin: "Profit on revenue",
  breakEvenRevenue: "Revenue to break even",
  maxSpend: "Maximum spend without a loss",
  notAvailable: "n/a",
  verdict: {
    "no-spend": "Enter an ad spend above zero to calculate ROAS.",
    profit: "The campaign is above break-even: every dollar invested comes back with profit.",
    breakeven: "The campaign is exactly at break-even: no profit and no loss.",
    loss: "The campaign is below break-even: revenue does not cover product cost and ad spend.",
  },
  fieldErrors: {
    empty: "Fill in this field.",
    invalid: "Use numbers only, for example 1,250.50.",
    negative: "The value cannot be negative.",
    "too-many-decimals": "Use at most two decimal places.",
    "too-large": "The value is too large.",
  },
  marginRange: "The margin must be between 0 and 100%.",
  fix: "Fix the highlighted fields to see the result.",
};

const es: RoasStrings = {
  currency: "Moneda",
  revenue: "Ingresos atribuidos a los anuncios",
  revenueHint: "Total vendido por la campaña en el período.",
  spend: "Inversión en medios",
  spendHint: "Cuánto gastaste en anuncios en el mismo período.",
  margin: "Margen de contribución (%)",
  marginHint: "Porcentaje de los ingresos que queda después del costo del producto, impuestos y comisiones, antes de la inversión.",
  example: { revenue: "10.000,00", spend: "2.500,00", margin: "40" },
  results: "Resultado",
  roas: "ROAS",
  breakEven: "ROAS de equilibrio",
  contribution: "Margen de contribución",
  profit: "Ganancia después de la inversión",
  profitMargin: "Ganancia sobre los ingresos",
  breakEvenRevenue: "Ingresos para empatar",
  maxSpend: "Inversión máxima sin pérdida",
  notAvailable: "n/d",
  verdict: {
    "no-spend": "Indica una inversión mayor que cero para calcular el ROAS.",
    profit: "La campaña está por encima del punto de equilibrio: cada unidad invertida vuelve con ganancia.",
    breakeven: "La campaña está exactamente en el punto de equilibrio: sin ganancia ni pérdida.",
    loss: "La campaña está por debajo del punto de equilibrio: los ingresos no cubren el costo del producto ni la inversión.",
  },
  fieldErrors: {
    empty: "Completa este campo.",
    invalid: "Usa solo números, por ejemplo 1.250,50.",
    negative: "El valor no puede ser negativo.",
    "too-many-decimals": "Usa como máximo dos decimales.",
    "too-large": "El valor es demasiado grande.",
  },
  marginRange: "El margen debe estar entre 0 y 100%.",
  fix: "Corrige los campos resaltados para ver el resultado.",
};

const ALL: Record<Lang, RoasStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos da Calculadora de ROAS no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): RoasStrings {
  return ALL[lang];
}
