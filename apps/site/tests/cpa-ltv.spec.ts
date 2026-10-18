import { expect, test } from "@playwright/test";
import { openHydrated } from "./support";

/** Rótulo exato de campo, para não casar por prefixo com outros campos. */
const exact = { exact: true } as const;

/** Rastreia requisições para fora da própria origem (a ferramenta não pode fazer nenhuma). */
function trackExternal(page: import("@playwright/test").Page): string[] {
  const external: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.protocol.startsWith("http") && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") external.push(req.url());
  });
  return external;
}

test.describe("Calculadora de CPA máximo e LTV", () => {
  test("exemplo preenchido, recálculo por CAC e vereditos", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/calculadoras/calculadora-de-cpa-e-ltv/");
    await expect(page.getByTestId("ltv-revenue")).toHaveText(/R\$\s500,00/);
    await expect(page.getByTestId("ltv-margin")).toHaveText(/R\$\s200,00/);
    await expect(page.getByTestId("breakeven-cpa")).toHaveText(/R\$\s80,00/);
    await expect(page.getByTestId("max-cpa")).toHaveText(/R\$\s66,67/);
    await expect(page.getByTestId("ratio")).toHaveText("2,50x");
    await expect(page.getByTestId("profit")).toHaveText(/R\$\s120,00/);
    await expect(page.getByTestId("payback-purchases")).toHaveText("1,00 compras");
    await expect(page.getByTestId("payback-months")).toHaveText("4,8 meses");
    await expect(page.getByTestId("max-cpa-payback")).toHaveText(/R\$\s100,00/);

    await page.getByLabel("CAC atual (custo por cliente adquirido)", exact).fill("60,00");
    await expect(page.getByTestId("ratio")).toHaveText("3,33x");
    await expect(page.getByTestId("profit")).toHaveText(/R\$\s140,00/);
    await expect(page.getByText("devolve com folga")).toBeVisible();

    await page.getByLabel("CAC atual (custo por cliente adquirido)", exact).fill("250,00");
    await expect(page.getByTestId("ratio")).toHaveText("0,80x");
    await expect(page.getByTestId("profit")).toHaveText(/-R\$\s50,00/);
    await expect(page.getByText("não cobre o CAC dentro do período")).toBeVisible();

    await page.getByLabel("CAC atual (custo por cliente adquirido)", exact).fill("");
    await expect(page.getByTestId("ratio")).toHaveText("n/d");
    await expect(page.getByText("Informe um CAC maior que zero")).toBeVisible();
    expect(external).toEqual([]);
  });

  test("CAC por verba e clientes, inclusive com zero clientes", async ({ page }) => {
    await openHydrated(page, "/pt-br/calculadoras/calculadora-de-cpa-e-ltv/");
    await page.getByLabel("Calcular por verba e clientes", exact).check();
    await expect(page.getByTestId("ratio")).toHaveText("2,50x");
    await page.getByLabel("Clientes novos adquiridos", exact).fill("160");
    await expect(page.getByTestId("ratio")).toHaveText("4,00x");
    await page.getByLabel("Clientes novos adquiridos", exact).fill("0");
    await expect(page.getByText("Com zero clientes não existe CAC")).toBeVisible();
    await expect(page.getByTestId("ratio")).toHaveText("n/d");
    await expect(page.getByTestId("max-cpa")).toHaveText(/R\$\s66,67/);
  });

  test("margem zero e compras zero não geram NaN nem divisão por zero", async ({ page }) => {
    await openHydrated(page, "/en/calculators/cpa-and-ltv-calculator/");
    await page.getByLabel("Contribution margin (%)", exact).fill("0");
    await expect(page.getByTestId("ltv-margin")).toHaveText("$0.00");
    await expect(page.getByTestId("max-cpa")).toHaveText("$0.00");
    await expect(page.getByTestId("payback-purchases")).toHaveText("n/a");
    await page.getByLabel("Contribution margin (%)", exact).fill("40");
    await page.getByLabel("Purchases per customer over their lifetime", exact).fill("0");
    await expect(page.getByTestId("ltv-revenue")).toHaveText("$0.00");
    await expect(page.getByTestId("ratio")).toHaveText("0.00x");
    await expect(page.locator("main")).not.toContainText("NaN");
  });

  test("entrada inválida mostra erro por campo e não calcula (en)", async ({ page }) => {
    await openHydrated(page, "/en/calculators/cpa-and-ltv-calculator/");
    await expect(page.getByTestId("ltv-margin")).toHaveText("$200.00");
    await expect(page.getByTestId("ratio")).toHaveText("2.50x");
    await page.getByLabel("Contribution margin (%)", exact).fill("120");
    await expect(page.getByText("between 0 and 100%")).toBeVisible();
    await expect(page.getByTestId("ltv-margin")).toHaveCount(0);
    await page.getByLabel("Contribution margin (%)", exact).fill("40");
    await page.getByLabel("Average order value", exact).fill("12abc");
    await expect(page.getByText("Use numbers only")).toBeVisible();
    await page.getByLabel("Average order value", exact).fill("200.00");
    await page.getByLabel("Customer lifetime (months, optional)", exact).fill("");
    await expect(page.getByText("Also enter the customer lifetime")).toBeVisible();
    await page.getByLabel("Wanted payback (months, optional)", exact).fill("");
    await expect(page.getByTestId("ltv-margin")).toHaveText("$200.00");
    await page.getByLabel("Target LTV/CAC ratio", exact).fill("0");
    await expect(page.getByText("between 0.1 and 100")).toBeVisible();
  });

  test("espanhol: rótulos, euro e razão", async ({ page }) => {
    await openHydrated(page, "/es/calculadoras/calculadora-de-cpa-y-ltv/");
    await expect(page.getByLabel("Ticket medio por compra", exact)).toBeVisible();
    await expect(page.getByTestId("ltv-margin")).toHaveText(/200,00\s€/);
    await expect(page.getByTestId("max-cpa")).toHaveText(/66,67\s€/);
    await expect(page.getByTestId("ratio")).toHaveText("2,50x");
    await expect(page.getByTestId("payback-months")).toHaveText("4,8 meses");
    await page.getByLabel("CAC actual (costo por cliente adquirido)", exact).fill("300,00");
    await expect(page.getByTestId("ratio")).toHaveText("0,67x");
  });
});
