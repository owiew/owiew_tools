import { expect, test } from "@playwright/test";
import { expectAxeClean, expectLayoutOk, trackExternal } from "./t3-support";
import { findBadText, openHydrated } from "./support";

const PT = "/pt-br/calculadoras/teste-ab/";

test.describe("Teste A/B", () => {
  test("exemplo preenchido mostra vencedor, p-valor e intervalo; nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, PT);
    await expect(page.getByTestId("ab-rate-a")).toHaveText("5,00%");
    await expect(page.getByTestId("ab-rate-b")).toHaveText("6,20%");
    await expect(page.getByTestId("ab-z")).toHaveText("2,610");
    await expect(page.getByTestId("ab-p")).toHaveText("0,0091");
    await expect(page.getByTestId("ab-ci")).toContainText("+0,30%");
    await expect(page.getByRole("region", { name: "Resultado" }).getByText("B venceu")).toBeVisible();
    await expectAxeClean(page, "exemplo");
    await expectLayoutOk(page);
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("diferença sem significância fica inconclusiva e o recálculo é imediato", async ({ page }) => {
    await openHydrated(page, PT);
    for (const [label, v] of [["Visitantes (A)", "400"], ["Conversões (A)", "20"], ["Visitantes (B)", "400"], ["Conversões (B)", "26"]] as const) await page.getByLabel(label).fill(v);
    await expect(page.getByTestId("ab-p")).toHaveText("0,3622");
    await expect(page.getByRole("region", { name: "Resultado" }).getByText("Inconclusivo")).toBeVisible();
    await page.getByLabel("Conversões (B)").fill("0");
    await page.getByLabel("Conversões (A)").fill("0");
    await expect(page.getByRole("region", { name: "Resultado" }).getByText("Sem variação:")).toBeVisible();
    await expect(page.getByText("NaN")).toHaveCount(0);
  });

  test("entradas hostis mostram erro por campo e a página continua viva", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Conversões (A)").fill("6000");
    await expect(page.getByText("As conversões não podem passar dos visitantes.")).toBeVisible();
    await expect(page.getByLabel("Conversões (A)")).toHaveAttribute("aria-invalid", "true");
    for (const bad of ["-5", "abc", "1,5", "", "9".repeat(40), "<script>alert(1)</script>", "\u0000"]) {
      await page.getByLabel("Visitantes (B)").fill(bad);
      await expect(page.locator("h1")).toBeVisible();
      expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    }
    await expect(page.getByText("Corrija os campos destacados")).toBeVisible();
    await expectAxeClean(page, "erros");
  });

  test("tamanho de amostra: exemplo, referência do manual Stata e erros", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Tamanho de amostra" }).click();
    await expect(page.getByTestId("ab-per-group")).toHaveText("8.158");
    await expect(page.getByTestId("ab-total")).toHaveText("16.316");
    await expect(page.getByTestId("ab-days")).toHaveText("17");
    // Manual Stata [PSS-2] power twoproportions, exemplo 1: 635 por grupo (taxas 0,1% e 1,5%).
    await page.getByLabel("Taxa de conversão atual (%)").fill("0,1");
    await page.getByLabel("Efeito mínimo detectável (MDE)", { exact: true }).fill("1,4");
    await page.getByLabel("O MDE é").selectOption("absolute");
    await expect(page.getByTestId("ab-per-group")).toHaveText("635");
    await expect(page.getByTestId("ab-total")).toHaveText("1.270");
    await page.getByLabel("Taxa de conversão atual (%)").fill("99");
    await page.getByLabel("Efeito mínimo detectável (MDE)", { exact: true }).fill("5");
    await expect(page.locator("#ab-mde-err")).toContainText("passaria de 100%");
    await page.getByLabel("Taxa de conversão atual (%)").fill("0");
    await expect(page.locator("#ab-baseline-err")).toContainText("entre 0,01% e 99,99%");
    await page.getByLabel("Taxa de conversão atual (%)").fill("5");
    await page.getByLabel("O MDE é").selectOption("relative");
    await page.getByLabel("Efeito mínimo detectável (MDE)", { exact: true }).fill("20");
    await page.getByLabel("Tipo de teste").last().selectOption("1");
    await expect(page.getByTestId("ab-per-group")).toHaveText("6.426");
    await expectAxeClean(page, "amostra");
    await expectLayoutOk(page);
  });

  test("em inglês e espanhol os números seguem o idioma", async ({ page }) => {
    await openHydrated(page, "/en/calculators/ab-test-calculator/");
    await expect(page.getByTestId("ab-p")).toHaveText("0.0091");
    await page.getByRole("button", { name: "Sample size" }).click();
    await expect(page.getByTestId("ab-per-group")).toHaveText("8,158");
    await openHydrated(page, "/es/calculadoras/prueba-ab/");
    await expect(page.getByTestId("ab-p")).toHaveText("0,0091");
    await expectAxeClean(page, "es");
  });
});
