import { type Lang } from "../../src/i18n/locales";

/** Textos da interface da Calculadora de CPA máximo e LTV. */
export interface CpaLtvStrings {
  readonly currency: string;
  readonly ticket: string;
  readonly ticketHint: string;
  readonly margin: string;
  readonly marginHint: string;
  readonly purchases: string;
  readonly purchasesHint: string;
  readonly cacMode: string;
  readonly modeCac: string;
  readonly modeBudget: string;
  readonly cac: string;
  readonly cacHint: string;
  readonly budget: string;
  readonly budgetHint: string;
  readonly customers: string;
  readonly customersHint: string;
  readonly ratio: string;
  readonly ratioHint: string;
  readonly lifetime: string;
  readonly lifetimeHint: string;
  readonly payback: string;
  readonly paybackHint: string;
  readonly example: Readonly<Record<"ticket" | "margin" | "purchases" | "cac" | "budget" | "customers" | "ratio" | "lifetime" | "payback", string>>;
  readonly results: string;
  readonly ltvMargin: string;
  readonly ltvRevenue: string;
  readonly maxCpaTarget: string;
  readonly breakEvenCpa: string;
  readonly ratioNow: string;
  readonly profit: string;
  readonly paybackPurchases: string;
  readonly paybackMonths: string;
  readonly maxCpaPayback: string;
  readonly notAvailable: string;
  readonly purchasesUnit: string;
  readonly monthsUnit: string;
  readonly verdict: Readonly<Record<"no-cac" | "loss" | "attention" | "healthy", string>>;
  readonly convention: string;
  readonly noCustomers: string;
  readonly notPaid: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
  readonly marginRange: string;
  readonly purchasesRange: string;
  readonly ratioRange: string;
  readonly monthsRange: string;
  readonly needLifetime: string;
  readonly fix: string;
}

const pt: CpaLtvStrings = {
  currency: "Moeda",
  ticket: "Ticket médio por compra",
  ticketHint: "Valor médio de cada pedido.",
  margin: "Margem de contribuição (%)",
  marginHint: "Percentual da receita que sobra depois de custo do produto, impostos, frete e taxas, antes da mídia.",
  purchases: "Compras por cliente no período de vida",
  purchasesHint: "Média de compras de cada cliente, com até duas casas decimais. Sem recompra, use 1.",
  cacMode: "Como informar o custo de aquisição",
  modeCac: "Já sei o CAC",
  modeBudget: "Calcular por verba e clientes",
  cac: "CAC atual (custo por cliente adquirido)",
  cacHint: "Deixe vazio para ver só os tetos de CPA.",
  budget: "Verba investida em aquisição",
  budgetHint: "Total gasto para conquistar clientes novos no período.",
  customers: "Clientes novos adquiridos",
  customersHint: "Número de clientes que essa verba trouxe.",
  ratio: "Razão alvo LTV/CAC",
  ratioHint: "Convenção: 3,0. Use um valor menor se a margem e a recompra forem previsíveis.",
  lifetime: "Período de vida do cliente (meses, opcional)",
  lifetimeHint: "Em quantos meses o cliente faz as compras acima. Habilita o payback em meses.",
  payback: "Payback desejado (meses, opcional)",
  paybackHint: "Prazo máximo para o caixa recuperar o investimento no cliente.",
  example: { ticket: "200,00", margin: "40", purchases: "2,5", cac: "80,00", budget: "8.000,00", customers: "100", ratio: "3,0", lifetime: "12", payback: "6" },
  results: "Resultado",
  ltvMargin: "LTV de margem",
  ltvRevenue: "LTV por receita",
  maxCpaTarget: "CPA máximo para a razão alvo",
  breakEvenCpa: "CPA de equilíbrio na 1ª compra",
  ratioNow: "LTV/CAC atual",
  profit: "Lucro por cliente",
  paybackPurchases: "Payback em compras",
  paybackMonths: "Payback em meses",
  maxCpaPayback: "CPA máximo para o payback desejado",
  notAvailable: "n/d",
  purchasesUnit: "compras",
  monthsUnit: "meses",
  verdict: {
    "no-cac": "Informe um CAC maior que zero para comparar com o LTV. Os tetos de CPA acima já valem.",
    loss: "LTV/CAC abaixo de 1: o cliente não devolve em margem o que custou para conquistar.",
    attention: "LTV/CAC entre 1 e a razão alvo: há retorno, mas abaixo da folga que você definiu.",
    healthy: "LTV/CAC na razão alvo ou acima: o cliente devolve com folga o que custou.",
  },
  convention: "Faixas são convenção de mercado (prejuízo abaixo de 1, atenção até a razão alvo, saudável acima), não lei. Margem, recompra e caixa mudam o que é aceitável.",
  noCustomers: "Com zero clientes não existe CAC: os resultados abaixo mostram só os tetos de CPA.",
  notPaid: "O LTV de margem não cobre o CAC dentro do período informado.",
  fieldErrors: {
    empty: "Preencha este campo.",
    invalid: "Use apenas números, por exemplo 1.250,50.",
    negative: "O valor não pode ser negativo.",
    "too-many-decimals": "Há casas decimais demais para este campo.",
    "too-large": "O valor é grande demais.",
  },
  marginRange: "A margem precisa estar entre 0 e 100%.",
  purchasesRange: "Use de 0 a 10.000 compras por cliente.",
  ratioRange: "A razão precisa estar entre 0,1 e 100.",
  monthsRange: "Use um número inteiro de meses entre 1 e 1.200.",
  needLifetime: "Informe também o período de vida para usar o payback desejado.",
  fix: "Corrija os campos destacados para ver o resultado.",
};

const en: CpaLtvStrings = {
  currency: "Currency",
  ticket: "Average order value",
  ticketHint: "Average value of each order.",
  margin: "Contribution margin (%)",
  marginHint: "Share of revenue left after product cost, taxes, shipping and fees, before ad spend.",
  purchases: "Purchases per customer over their lifetime",
  purchasesHint: "Average purchases per customer, up to two decimals. With no repeat purchases, use 1.",
  cacMode: "How to enter the acquisition cost",
  modeCac: "I know the CAC",
  modeBudget: "Calculate from budget and customers",
  cac: "Current CAC (cost per acquired customer)",
  cacHint: "Leave empty to see only the CPA ceilings.",
  budget: "Acquisition budget",
  budgetHint: "Total spent to win new customers in the period.",
  customers: "New customers acquired",
  customersHint: "Number of customers this budget brought in.",
  ratio: "Target LTV/CAC ratio",
  ratioHint: "Convention: 3.0. Use a lower value if margin and repeat purchases are predictable.",
  lifetime: "Customer lifetime (months, optional)",
  lifetimeHint: "Over how many months the customer makes the purchases above. Enables payback in months.",
  payback: "Wanted payback (months, optional)",
  paybackHint: "Longest time cash can wait to recover the investment in a customer.",
  example: { ticket: "200.00", margin: "40", purchases: "2.5", cac: "80.00", budget: "8,000.00", customers: "100", ratio: "3.0", lifetime: "12", payback: "6" },
  results: "Result",
  ltvMargin: "Margin LTV",
  ltvRevenue: "Revenue LTV",
  maxCpaTarget: "Max CPA for the target ratio",
  breakEvenCpa: "Break-even CPA on 1st purchase",
  ratioNow: "Current LTV/CAC",
  profit: "Profit per customer",
  paybackPurchases: "Payback in purchases",
  paybackMonths: "Payback in months",
  maxCpaPayback: "Max CPA for the wanted payback",
  notAvailable: "n/a",
  purchasesUnit: "purchases",
  monthsUnit: "months",
  verdict: {
    "no-cac": "Enter a CAC above zero to compare it with LTV. The CPA ceilings above already apply.",
    loss: "LTV/CAC below 1: the customer does not return in margin what it cost to win them.",
    attention: "LTV/CAC between 1 and the target ratio: there is a return, but below the cushion you set.",
    healthy: "LTV/CAC at or above the target ratio: the customer returns what they cost with room to spare.",
  },
  convention: "Bands are a market convention (loss below 1, attention up to the target ratio, healthy above), not a law. Margin, repeat purchases and cash change what is acceptable.",
  noCustomers: "With zero customers there is no CAC: the results below show only the CPA ceilings.",
  notPaid: "Margin LTV does not cover CAC within the period you entered.",
  fieldErrors: {
    empty: "Fill in this field.",
    invalid: "Use numbers only, for example 1,250.50.",
    negative: "The value cannot be negative.",
    "too-many-decimals": "Too many decimal places for this field.",
    "too-large": "The value is too large.",
  },
  marginRange: "The margin must be between 0 and 100%.",
  purchasesRange: "Use 0 to 10,000 purchases per customer.",
  ratioRange: "The ratio must be between 0.1 and 100.",
  monthsRange: "Use a whole number of months from 1 to 1,200.",
  needLifetime: "Also enter the customer lifetime to use the wanted payback.",
  fix: "Fix the highlighted fields to see the result.",
};

const es: CpaLtvStrings = {
  currency: "Moneda",
  ticket: "Ticket medio por compra",
  ticketHint: "Valor medio de cada pedido.",
  margin: "Margen de contribución (%)",
  marginHint: "Porcentaje de los ingresos que queda después del costo del producto, impuestos, envío y comisiones, antes de la inversión en anuncios.",
  purchases: "Compras por cliente en su vida",
  purchasesHint: "Promedio de compras de cada cliente, con hasta dos decimales. Sin recompra, usa 1.",
  cacMode: "Cómo indicar el costo de adquisición",
  modeCac: "Ya conozco el CAC",
  modeBudget: "Calcular con inversión y clientes",
  cac: "CAC actual (costo por cliente adquirido)",
  cacHint: "Déjalo vacío para ver solo los techos de CPA.",
  budget: "Inversión en captación",
  budgetHint: "Total gastado para conseguir clientes nuevos en el período.",
  customers: "Clientes nuevos adquiridos",
  customersHint: "Número de clientes que trajo esa inversión.",
  ratio: "Razón objetivo LTV/CAC",
  ratioHint: "Convención: 3,0. Usa un valor menor si el margen y la recompra son previsibles.",
  lifetime: "Vida del cliente (meses, opcional)",
  lifetimeHint: "En cuántos meses el cliente hace las compras de arriba. Habilita el payback en meses.",
  payback: "Payback deseado (meses, opcional)",
  paybackHint: "Plazo máximo para que la caja recupere la inversión en el cliente.",
  example: { ticket: "200,00", margin: "40", purchases: "2,5", cac: "80,00", budget: "8.000,00", customers: "100", ratio: "3,0", lifetime: "12", payback: "6" },
  results: "Resultado",
  ltvMargin: "LTV de margen",
  ltvRevenue: "LTV por ingresos",
  maxCpaTarget: "CPA máximo para la razón objetivo",
  breakEvenCpa: "CPA de equilibrio en la 1.ª compra",
  ratioNow: "LTV/CAC actual",
  profit: "Ganancia por cliente",
  paybackPurchases: "Payback en compras",
  paybackMonths: "Payback en meses",
  maxCpaPayback: "CPA máximo para el payback deseado",
  notAvailable: "n/d",
  purchasesUnit: "compras",
  monthsUnit: "meses",
  verdict: {
    "no-cac": "Indica un CAC mayor que cero para compararlo con el LTV. Los techos de CPA de arriba ya valen.",
    loss: "LTV/CAC por debajo de 1: el cliente no devuelve en margen lo que costó conseguirlo.",
    attention: "LTV/CAC entre 1 y la razón objetivo: hay retorno, pero por debajo del margen de seguridad que definiste.",
    healthy: "LTV/CAC en la razón objetivo o por encima: el cliente devuelve con holgura lo que costó.",
  },
  convention: "Los tramos son una convención del mercado (pérdida por debajo de 1, atención hasta la razón objetivo, saludable por encima), no una ley. Margen, recompra y caja cambian lo que es aceptable.",
  noCustomers: "Con cero clientes no existe CAC: los resultados de abajo muestran solo los techos de CPA.",
  notPaid: "El LTV de margen no cubre el CAC dentro del período indicado.",
  fieldErrors: {
    empty: "Completa este campo.",
    invalid: "Usa solo números, por ejemplo 1.250,50.",
    negative: "El valor no puede ser negativo.",
    "too-many-decimals": "Hay demasiados decimales para este campo.",
    "too-large": "El valor es demasiado grande.",
  },
  marginRange: "El margen debe estar entre 0 y 100%.",
  purchasesRange: "Usa de 0 a 10.000 compras por cliente.",
  ratioRange: "La razón debe estar entre 0,1 y 100.",
  monthsRange: "Usa un número entero de meses entre 1 y 1.200.",
  needLifetime: "Indica también la vida del cliente para usar el payback deseado.",
  fix: "Corrige los campos resaltados para ver el resultado.",
};

const ALL: Record<Lang, CpaLtvStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos da Calculadora de CPA máximo e LTV no idioma pedido.
 *
 * Onde: Ui.tsx e compute.ts. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): CpaLtvStrings {
  return ALL[lang];
}
