import { expect, test, type Page } from "@playwright/test";
import { openHydrated } from "./support";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: testes do Planejador de verba ("nada sai do navegador").
 * Entrada: página. Saída: lista (viva) de URLs externas requisitadas.
 */
function trackExternal(page: Page): string[] {
  const external: string[] = [];
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) external.push(req.url());
  });
  return external;
}

test.describe("Planejador de verba por funil", () => {
  test("exemplo preenchido, recálculo, cenários e modo CTR e CPM", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/calculadoras/planejador-de-verba/");
    await expect(page.getByTestId("leads")).toHaveText("500");
    await expect(page.getByTestId("clicks")).toHaveText("10.000");
    await expect(page.getByTestId("budget")).toHaveText(/R\$\s15\.000,00/);
    await expect(page.getByTestId("cpl")).toHaveText(/R\$\s30,00/);
    await expect(page.getByTestId("cpa")).toHaveText(/R\$\s300,00/);
    await expect(page.getByTestId("revenue")).toHaveText(/R\$\s30\.000,00/);
    await expect(page.getByTestId("roas")).toHaveText("2,00x");
    await expect(page.getByTestId("stage-clicks")).toHaveText("10.000");
    await expect(page.getByTestId("sc-pessimistic-budget")).toHaveText(/R\$\s23\.437,50/);
    await expect(page.getByTestId("sc-optimistic-budget")).toHaveText(/R\$\s10\.425,00/);

    await page.getByLabel("Taxa de clique para lead (%)", { exact: true }).fill("4");
    await expect(page.getByTestId("clicks")).toHaveText("12.500");
    await expect(page.getByTestId("budget")).toHaveText(/R\$\s18\.750,00/);

    await page.getByLabel("Modo de custo da mídia").selectOption("ctr-cpm");
    await page.getByLabel("Meta de vendas", { exact: true }).fill("30");
    await page.getByLabel("Taxa de lead para venda (%)", { exact: true }).fill("5");
    await page.getByLabel("Taxa de clique para lead (%)", { exact: true }).fill("25");
    await page.getByLabel("CTR (taxa de cliques, %)", { exact: true }).fill("1,2");
    await page.getByLabel("CPM (custo por mil impressões)", { exact: true }).fill("30,00");
    await expect(page.getByTestId("leads")).toHaveText("600");
    await expect(page.getByTestId("clicks")).toHaveText("2.400");
    await expect(page.getByTestId("impressions")).toHaveText("200.000");
    await expect(page.getByTestId("budget")).toHaveText(/R\$\s6\.000,00/);
    await expect(page.getByTestId("cpa")).toHaveText(/R\$\s200,00/);
    expect(external).toEqual([]);
  });

  test("taxa zero e entrada inválida mostram erro por campo e não calculam", async ({ page }) => {
    await openHydrated(page, "/pt-br/calculadoras/planejador-de-verba/");
    const lead = page.getByLabel("Taxa de lead para venda (%)", { exact: true });
    await lead.fill("0");
    await expect(page.getByText("A taxa precisa ser maior que zero.")).toBeVisible();
    await expect(lead).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("budget")).toHaveCount(0);
    await lead.fill("10");
    await expect(page.getByTestId("budget")).toHaveCount(1);
    await page.getByLabel("Meta de vendas", { exact: true }).fill("12abc");
    await expect(page.getByText("Use apenas números")).toBeVisible();
    await page.getByLabel("Meta de vendas", { exact: true }).fill("2,5");
    await expect(page.getByText("Use um número inteiro de vendas.")).toBeVisible();
    await page.getByLabel("Meta de vendas", { exact: true }).fill("50");
    await page.getByLabel("Taxa de clique para lead (%)", { exact: true }).fill("120");
    await expect(page.getByText("A taxa precisa estar entre 0 e 100%.")).toBeVisible();
  });

  test("en: formatação, arredondamento para cima e estouro", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/en/calculators/funnel-budget-planner/");
    await expect(page.getByTestId("budget")).toHaveText("$15,000.00");
    await expect(page.getByTestId("cpa")).toHaveText("$300.00");
    await expect(page.getByTestId("roas")).toHaveText("2.00x");
    await page.getByLabel("Sales goal", { exact: true }).fill("7");
    await page.getByLabel("Lead-to-sale rate (%)", { exact: true }).fill("3");
    await page.getByLabel("Click-to-lead rate (%)", { exact: true }).fill("10");
    await expect(page.getByTestId("leads")).toHaveText("234");
    await expect(page.getByTestId("clicks")).toHaveText("2,340");
    await page.getByLabel("Sales goal", { exact: true }).fill("999,999,999,999");
    await page.getByLabel("Lead-to-sale rate (%)", { exact: true }).fill("0.01");
    await page.getByLabel("Click-to-lead rate (%)", { exact: true }).fill("0.01");
    await expect(page.getByText("too large to calculate safely")).toBeVisible();
    expect(external).toEqual([]);
  });

  test("es: etiquetas y formato", async ({ page }) => {
    await openHydrated(page, "/es/calculadoras/planificador-de-presupuesto/");
    await expect(page.getByTestId("leads")).toHaveText("500");
    await expect(page.getByTestId("budget")).toHaveText(/15\.000,00\s€/);
    await page.getByLabel("Tasa de lead a venta (%)", { exact: true }).fill("0");
    await expect(page.getByText("La tasa debe ser mayor que cero.")).toBeVisible();
  });
});
