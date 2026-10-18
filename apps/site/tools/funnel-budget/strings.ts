import { type Lang } from "../../src/i18n/locales";

/** Textos da interface do Planejador de verba por funil. */
export interface FunnelStrings {
  readonly currency: string;
  readonly mode: string;
  readonly modeCpc: string;
  readonly modeCtrCpm: string;
  readonly sales: string;
  readonly salesHint: string;
  readonly leadRate: string;
  readonly leadRateHint: string;
  readonly clickRate: string;
  readonly clickRateHint: string;
  readonly cpc: string;
  readonly cpcHint: string;
  readonly ctr: string;
  readonly ctrHint: string;
  readonly cpm: string;
  readonly cpmHint: string;
  readonly ticket: string;
  readonly ticketHint: string;
  readonly example: Record<"sales" | "leadRate" | "clickRate" | "cpc" | "ctr" | "cpm" | "ticket", string>;
  readonly results: string;
  readonly leads: string;
  readonly clicks: string;
  readonly impressions: string;
  readonly budget: string;
  readonly cpl: string;
  readonly cpa: string;
  readonly revenue: string;
  readonly roas: string;
  readonly notAvailable: string;
  readonly roundNote: string;
  readonly funnelTitle: string;
  readonly stageImpressions: string;
  readonly stageClicks: string;
  readonly stageLeads: string;
  readonly stageSales: string;
  /** Rótulo da taxa que leva da etapa anterior para esta. */
  readonly stageRate: Record<"clicks" | "leads" | "sales", string>;
  readonly scenariosTitle: string;
  readonly scenariosHint: string;
  readonly scenarioName: Record<"pessimistic" | "base" | "optimistic", string>;
  readonly scenarioRates: string;
  readonly scenarioError: string;
  readonly colScenario: string;
  readonly fieldErrors: Record<string, string>;
  readonly coreErrors: Record<string, string>;
  readonly overflow: string;
  readonly fix: string;
}

const pt: FunnelStrings = {
  currency: "Moeda",
  mode: "Modo de custo da mídia",
  modeCpc: "Tenho o CPC",
  modeCtrCpm: "Tenho CTR e CPM",
  sales: "Meta de vendas",
  salesHint: "Quantas vendas você quer no período (número inteiro).",
  leadRate: "Taxa de lead para venda (%)",
  leadRateHint: "De cada 100 leads, quantos compram. Veja no seu CRM ou histórico.",
  clickRate: "Taxa de clique para lead (%)",
  clickRateHint: "De cada 100 cliques, quantos viram lead: a conversão da página.",
  cpc: "CPC (custo por clique)",
  cpcHint: "Quanto cada clique custa, em média.",
  ctr: "CTR (taxa de cliques, %)",
  ctrHint: "De cada 100 impressões, quantas viram clique.",
  cpm: "CPM (custo por mil impressões)",
  cpmHint: "Quanto custam mil impressões do anúncio.",
  ticket: "Ticket médio (opcional)",
  ticketHint: "Valor médio de cada venda. Preencha para ver receita e ROAS projetados.",
  example: { sales: "50", leadRate: "10", clickRate: "5", cpc: "1,50", ctr: "1,2", cpm: "30,00", ticket: "600,00" },
  results: "Resultado",
  leads: "Leads necessários",
  clicks: "Cliques necessários",
  impressions: "Impressões necessárias",
  budget: "Verba total",
  cpl: "Custo por lead (CPL)",
  cpa: "CPA implícito",
  revenue: "Receita projetada",
  roas: "ROAS projetado",
  notAvailable: "n/d",
  roundNote: "Leads, cliques e impressões são arredondados para cima: você não compra meio lead.",
  funnelTitle: "Funil necessário",
  stageImpressions: "Impressões",
  stageClicks: "Cliques",
  stageLeads: "Leads",
  stageSales: "Vendas",
  stageRate: { clicks: "CTR", leads: "Conversão da página", sales: "Lead para venda" },
  scenariosTitle: "Cenários",
  scenariosHint: "As duas taxas de conversão (clique para lead e lead para venda) sobem ou caem 20%. CPC, CPM e CTR ficam fixos.",
  scenarioName: { pessimistic: "Pessimista", base: "Base", optimistic: "Otimista" },
  scenarioRates: "taxas",
  scenarioError: "fora do limite",
  colScenario: "Cenário",
  fieldErrors: {
    empty: "Preencha este campo.",
    invalid: "Use apenas números, por exemplo 1.250,50.",
    negative: "O valor não pode ser negativo.",
    "too-many-decimals": "Use no máximo duas casas decimais.",
    "too-large": "O valor é grande demais.",
    "sales-decimals": "Use um número inteiro de vendas.",
  },
  coreErrors: {
    "invalid-sales": "A meta precisa ser de pelo menos 1 venda.",
    "zero-lead-rate": "A taxa precisa ser maior que zero.",
    "invalid-lead-rate": "A taxa precisa estar entre 0 e 100%.",
    "zero-click-rate": "A taxa precisa ser maior que zero.",
    "invalid-click-rate": "A taxa precisa estar entre 0 e 100%.",
    "zero-ctr": "A taxa precisa ser maior que zero.",
    "invalid-ctr": "A taxa precisa estar entre 0 e 100%.",
    "invalid-cpc": "Informe um custo válido.",
    "invalid-cpm": "Informe um custo válido.",
    "invalid-ticket": "Informe um valor válido.",
  },
  overflow: "Os números ficaram grandes demais para calcular com segurança. Reduza a meta ou aumente as taxas.",
  fix: "Corrija os campos destacados para ver o resultado.",
};

const en: FunnelStrings = {
  currency: "Currency",
  mode: "Media cost mode",
  modeCpc: "I have the CPC",
  modeCtrCpm: "I have CTR and CPM",
  sales: "Sales goal",
  salesHint: "How many sales you want in the period (whole number).",
  leadRate: "Lead-to-sale rate (%)",
  leadRateHint: "Out of 100 leads, how many buy. Check your CRM or history.",
  clickRate: "Click-to-lead rate (%)",
  clickRateHint: "Out of 100 clicks, how many become a lead: the page conversion rate.",
  cpc: "CPC (cost per click)",
  cpcHint: "What each click costs, on average.",
  ctr: "CTR (click-through rate, %)",
  ctrHint: "Out of 100 impressions, how many become a click.",
  cpm: "CPM (cost per 1,000 impressions)",
  cpmHint: "What 1,000 ad impressions cost.",
  ticket: "Average ticket (optional)",
  ticketHint: "Average value of each sale. Fill it in to see projected revenue and ROAS.",
  example: { sales: "50", leadRate: "10", clickRate: "5", cpc: "1.50", ctr: "1.2", cpm: "30.00", ticket: "600.00" },
  results: "Result",
  leads: "Leads needed",
  clicks: "Clicks needed",
  impressions: "Impressions needed",
  budget: "Total budget",
  cpl: "Cost per lead (CPL)",
  cpa: "Implied CPA",
  revenue: "Projected revenue",
  roas: "Projected ROAS",
  notAvailable: "n/a",
  roundNote: "Leads, clicks and impressions are rounded up: you cannot buy half a lead.",
  funnelTitle: "Funnel needed",
  stageImpressions: "Impressions",
  stageClicks: "Clicks",
  stageLeads: "Leads",
  stageSales: "Sales",
  stageRate: { clicks: "CTR", leads: "Page conversion", sales: "Lead to sale" },
  scenariosTitle: "Scenarios",
  scenariosHint: "Both conversion rates (click to lead and lead to sale) go down or up by 20%. CPC, CPM and CTR stay fixed.",
  scenarioName: { pessimistic: "Pessimistic", base: "Base", optimistic: "Optimistic" },
  scenarioRates: "rates",
  scenarioError: "out of range",
  colScenario: "Scenario",
  fieldErrors: {
    empty: "Fill in this field.",
    invalid: "Use numbers only, for example 1,250.50.",
    negative: "The value cannot be negative.",
    "too-many-decimals": "Use at most two decimal places.",
    "too-large": "The value is too large.",
    "sales-decimals": "Use a whole number of sales.",
  },
  coreErrors: {
    "invalid-sales": "The goal must be at least 1 sale.",
    "zero-lead-rate": "The rate must be greater than zero.",
    "invalid-lead-rate": "The rate must be between 0 and 100%.",
    "zero-click-rate": "The rate must be greater than zero.",
    "invalid-click-rate": "The rate must be between 0 and 100%.",
    "zero-ctr": "The rate must be greater than zero.",
    "invalid-ctr": "The rate must be between 0 and 100%.",
    "invalid-cpc": "Enter a valid cost.",
    "invalid-cpm": "Enter a valid cost.",
    "invalid-ticket": "Enter a valid amount.",
  },
  overflow: "The numbers got too large to calculate safely. Lower the goal or raise the rates.",
  fix: "Fix the highlighted fields to see the result.",
};

const es: FunnelStrings = {
  currency: "Moneda",
  mode: "Modo de costo de medios",
  modeCpc: "Tengo el CPC",
  modeCtrCpm: "Tengo CTR y CPM",
  sales: "Meta de ventas",
  salesHint: "Cuántas ventas quieres en el período (número entero).",
  leadRate: "Tasa de lead a venta (%)",
  leadRateHint: "De cada 100 leads, cuántos compran. Mira tu CRM o tu historial.",
  clickRate: "Tasa de clic a lead (%)",
  clickRateHint: "De cada 100 clics, cuántos se vuelven lead: la conversión de la página.",
  cpc: "CPC (costo por clic)",
  cpcHint: "Cuánto cuesta cada clic, en promedio.",
  ctr: "CTR (tasa de clics, %)",
  ctrHint: "De cada 100 impresiones, cuántas se vuelven clic.",
  cpm: "CPM (costo por mil impresiones)",
  cpmHint: "Cuánto cuestan mil impresiones del anuncio.",
  ticket: "Ticket promedio (opcional)",
  ticketHint: "Valor promedio de cada venta. Complétalo para ver ingresos y ROAS proyectados.",
  example: { sales: "50", leadRate: "10", clickRate: "5", cpc: "1,50", ctr: "1,2", cpm: "30,00", ticket: "600,00" },
  results: "Resultado",
  leads: "Leads necesarios",
  clicks: "Clics necesarios",
  impressions: "Impresiones necesarias",
  budget: "Presupuesto total",
  cpl: "Costo por lead (CPL)",
  cpa: "CPA implícito",
  revenue: "Ingresos proyectados",
  roas: "ROAS proyectado",
  notAvailable: "n/d",
  roundNote: "Leads, clics e impresiones se redondean hacia arriba: no se puede comprar medio lead.",
  funnelTitle: "Embudo necesario",
  stageImpressions: "Impresiones",
  stageClicks: "Clics",
  stageLeads: "Leads",
  stageSales: "Ventas",
  stageRate: { clicks: "CTR", leads: "Conversión de la página", sales: "Lead a venta" },
  scenariosTitle: "Escenarios",
  scenariosHint: "Las dos tasas de conversión (clic a lead y lead a venta) suben o bajan un 20%. CPC, CPM y CTR quedan fijos.",
  scenarioName: { pessimistic: "Pesimista", base: "Base", optimistic: "Optimista" },
  scenarioRates: "tasas",
  scenarioError: "fuera del límite",
  colScenario: "Escenario",
  fieldErrors: {
    empty: "Completa este campo.",
    invalid: "Usa solo números, por ejemplo 1.250,50.",
    negative: "El valor no puede ser negativo.",
    "too-many-decimals": "Usa como máximo dos decimales.",
    "too-large": "El valor es demasiado grande.",
    "sales-decimals": "Usa un número entero de ventas.",
  },
  coreErrors: {
    "invalid-sales": "La meta debe ser de al menos 1 venta.",
    "zero-lead-rate": "La tasa debe ser mayor que cero.",
    "invalid-lead-rate": "La tasa debe estar entre 0 y 100%.",
    "zero-click-rate": "La tasa debe ser mayor que cero.",
    "invalid-click-rate": "La tasa debe estar entre 0 y 100%.",
    "zero-ctr": "La tasa debe ser mayor que cero.",
    "invalid-ctr": "La tasa debe estar entre 0 y 100%.",
    "invalid-cpc": "Indica un costo válido.",
    "invalid-cpm": "Indica un costo válido.",
    "invalid-ticket": "Indica un valor válido.",
  },
  overflow: "Los números quedaron demasiado grandes para calcular con seguridad. Baja la meta o sube las tasas.",
  fix: "Corrige los campos resaltados para ver el resultado.",
};

const ALL: Record<Lang, FunnelStrings> = { "pt-br": pt, en, es };

/**
 * Devolve os textos do Planejador de verba por funil no idioma pedido.
 *
 * Onde: Ui.tsx. Entrada: idioma. Saída: textos. Sem efeitos.
 */
export function strings(lang: Lang): FunnelStrings {
  return ALL[lang];
}
