import { expect, test, type Page } from "@playwright/test";
import { findBadText, openHydrated } from "./support";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: provas de "nada sai do navegador" desta ferramenta.
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

test.describe("Calculadora de CPM e alcance", () => {
  test("exemplo preenchido e os quatro modos com valores conferidos", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/calculadoras/calculadora-de-cpm-e-alcance/");
    await expect(page.getByTestId("cr-impressions")).toHaveText("200.000");
    await expect(page.getByTestId("cr-spend")).toHaveText(/R\$\s5\.000,00/);
    await expect(page.getByTestId("cr-clicks")).toHaveText("3.000");
    await expect(page.getByTestId("cr-cpc")).toHaveText(/R\$\s1,67/);

    await page.getByLabel("Estimar alcance", { exact: true }).check();
    await expect(page.getByTestId("cr-reach")).toHaveText("80.000");
    await expect(page.getByText("O alcance é uma estimativa")).toBeVisible();
    await page.getByLabel("Frequência média (vezes por pessoa)", { exact: true }).fill("4");
    await expect(page.getByTestId("cr-reach")).toHaveText("50.000");

    await page.getByLabel("Calcular CPM", { exact: true }).check();
    await expect(page.getByTestId("cr-cpm")).toHaveText(/R\$\s25,00/);
    await expect(page.getByTestId("cr-clicks")).toHaveText("15.000");
    await page.getByLabel("Impressões", { exact: true }).fill("0");
    await expect(page.getByText("As impressões precisam ser maiores que zero.")).toBeVisible();

    await page.getByLabel("Calcular verba necessária", { exact: true }).check();
    await expect(page.getByTestId("cr-spend")).toHaveText(/R\$\s20\.000,00/);
    await expect(page.getByTestId("cr-impressions")).toHaveText("800.000");
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("entrada inválida mostra erro por campo e CTR zero some com o CPC", async ({ page }) => {
    await openHydrated(page, "/pt-br/calculadoras/calculadora-de-cpm-e-alcance/");
    await page.getByLabel("Verba investida", { exact: true }).fill("12abc");
    await expect(page.getByText("Use apenas números")).toBeVisible();
    await expect(page.getByTestId("cr-impressions")).toHaveCount(0);
    await page.getByLabel("Verba investida", { exact: true }).fill("5.000,00");
    await page.getByLabel("CPM (custo por mil impressões)", { exact: true }).fill("0");
    await expect(page.getByText("O CPM precisa ser maior que zero.")).toBeVisible();
    await page.getByLabel("CPM (custo por mil impressões)", { exact: true }).fill("25,00");
    await page.getByLabel("Estimar alcance", { exact: true }).check();
    await page.getByLabel("Frequência média (vezes por pessoa)", { exact: true }).fill("0,5");
    await expect(page.getByText("A frequência precisa ser 1 ou mais.")).toBeVisible();
    await page.getByLabel("Frequência média (vezes por pessoa)", { exact: true }).fill("2,5");
    await page.getByLabel("CTR (opcional, %)", { exact: true }).fill("0");
    await expect(page.getByTestId("cr-clicks")).toHaveText("0");
    await expect(page.getByTestId("cr-cpc")).toHaveText("n/d");
    await page.getByLabel("CTR (opcional, %)", { exact: true }).fill("");
    await expect(page.getByTestId("cr-clicks")).toHaveCount(0);
  });

  test("inglês: formatação e erro de frequência", async ({ page }) => {
    await openHydrated(page, "/en/calculators/cpm-and-reach-calculator/");
    await expect(page.getByTestId("cr-impressions")).toHaveText("200,000");
    await expect(page.getByTestId("cr-spend")).toHaveText("$5,000.00");
    await page.getByLabel("Estimate reach", { exact: true }).check();
    await expect(page.getByTestId("cr-reach")).toHaveText("80,000");
    await page.getByLabel("Average frequency (times per person)", { exact: true }).fill("0.9");
    await expect(page.getByText("Frequency must be 1 or more.")).toBeVisible();
  });

  test("espanhol: rótulos e alcance estimado", async ({ page }) => {
    await openHydrated(page, "/es/calculadoras/calculadora-de-cpm-y-alcance/");
    await page.getByLabel("Estimar alcance", { exact: true }).check();
    await expect(page.getByTestId("cr-reach")).toHaveText("80.000");
    await expect(page.getByLabel("Inversión", { exact: true })).toBeVisible();
    await page.getByLabel("Calcular inversión necesaria", { exact: true }).check();
    await expect(page.getByTestId("cr-impressions")).toHaveText("500.000");
  });
});
