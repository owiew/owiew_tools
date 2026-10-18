import { type Result, fail, ok } from "../result";
import { roundMulDiv } from "./round-mul-div";

/** Códigos de erro do CAC por verba. */
export type CacFromBudgetError = "invalid-amount" | "invalid-customers" | "no-customers";

/** Teto de clientes aceito (um bilhão), contra abuso e estouro. */
export const MAX_CUSTOMERS = 1_000_000_000;

/**
 * Calcula o CAC (custo por cliente adquirido) a partir da verba e do nº de clientes.
 *
 * O quê: CAC = verba / clientes, em centavos inteiros arredondados sem float.
 * Onde: campo "verba e clientes" da calculadora de CPA e LTV. Entradas: verba em
 * centavos (inteiro seguro >= 0) e clientes (inteiro 0..MAX_CUSTOMERS).
 * Saída: Result com o CAC em centavos; zero clientes dá "no-customers" (a UI trata
 * como CAC não informado, sem dividir por zero). Sem efeitos.
 */
export function cacFromBudget(budgetCents: number, customers: number): Result<number, CacFromBudgetError> {
  if (!Number.isSafeInteger(budgetCents) || budgetCents < 0) return fail("invalid-amount");
  if (!Number.isSafeInteger(customers) || customers < 0 || customers > MAX_CUSTOMERS) return fail("invalid-customers");
  if (customers === 0) return fail("no-customers");
  const cac = roundMulDiv([budgetCents], [customers]);
  return cac === null ? fail("invalid-amount") : ok(cac);
}
