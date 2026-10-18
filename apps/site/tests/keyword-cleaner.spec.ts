import { expect, test } from "@playwright/test";
import { expectAxeClean, expectLayoutOk, readDownload, trackExternal } from "./t3-support";
import { findBadText, openHydrated } from "./support";

const PT = "/pt-br/palavras-chave/limpador-de-palavras-chave/";

test.describe("Limpador de palavras-chave", () => {
  test("limpa o exemplo: minúsculas, símbolos fora, repetida removida; nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, PT);
    await expect(page.getByTestId("kcl-stats")).toHaveText("7 entradas, 6 mantidas, 1 repetidas removidas, 0 fora do limite.");
    await expect(page.getByLabel("Lista limpa")).toHaveValue("tênis azul\ntênis de corrida\ncomprar tênis barato\nazul tênis\ntenis de corrida\nsapato social");
    await expectAxeClean(page, "limpar");
    await expectLayoutOk(page);
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("opções: sem acento, ordem das palavras, ordenar e agrupar por termo", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Remover acentos").check();
    await expect(page.getByTestId("kcl-stats")).toHaveText("7 entradas, 5 mantidas, 2 repetidas removidas, 0 fora do limite.");
    await page.getByLabel("Remover acentos").uncheck();
    await page.getByLabel("Tratar “tênis azul” e “azul tênis” como repetidas").check();
    await expect(page.getByLabel("Lista limpa")).not.toHaveValue(/azul tênis$/m);
    await page.getByLabel("Tratar “tênis azul” e “azul tênis” como repetidas").uncheck();
    await page.getByLabel("Ordem").selectOption("az");
    await expect(page.getByLabel("Lista limpa")).toHaveValue(/^azul tênis\ncomprar tênis barato/);
    await page.getByLabel("Agrupar por termo").check();
    const grouped = await page.getByLabel("Lista limpa").inputValue();
    expect(grouped).toContain("# tênis\n");
    expect(grouped).toContain("# Outros\n");
    await expectAxeClean(page, "agrupado");
  });

  test("entradas hostis: limite de tamanho, byte nulo, símbolos e lista vazia", async ({ page }) => {
    await openHydrated(page, PT);
    const input = page.getByLabel("Palavras-chave", { exact: true });
    await input.fill(`a b c d e f g h i j k\n${"z".repeat(81)}\nok\u0000ok\n!!!\n<script>alert(1)</script>`);
    await expect(page.getByTestId("kcl-stats")).toContainText("2 fora do limite");
    await page.getByRole("button", { name: /Removidas \(/ }).click();
    await expect(page.getByRole("cell", { name: "Mais de 10 palavras" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Mais de 80 caracteres" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Vazia depois da limpeza" })).toBeVisible();
    await expect(page.getByLabel("Lista limpa")).toHaveValue("ok ok\nscript alert 1 /script");
    await input.fill("");
    await expect(page.getByTestId("kcl-stats")).toContainText("0 entradas");
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
  });

  test("CSV do limpador neutraliza injeção de fórmula", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Palavras-chave", { exact: true }).fill("+cmd\n-2\n@soma\n=1+1");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar CSV" }).first().click()]);
    expect(download.suggestedFilename()).toBe("keywords-clean.csv");
    const csv = await readDownload(download);
    expect(csv).toContain("group,keyword");
    expect(csv).toContain("other,'+cmd");
    expect(csv).not.toMatch(/(^|[\r\n,])[=+\-@]/);
  });

  test("negativas: sugere por frequência, aplica a correspondência e as sementes", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Gerar negativas" }).click();
    const firstRow = page.locator("section[aria-labelledby=neg-results] tbody tr").first();
    await expect(firstRow).toContainText("grátis");
    await expect(firstRow).toContainText("2");
    await expect(page.getByLabel("Lista de negativas")).toHaveValue('"grátis"\n"curso"\n"download"\n"emprego"\n"fábrica"\n"pdf"');
    await page.getByLabel("Correspondência das negativas").selectOption("exact");
    await expect(page.getByLabel("Lista de negativas")).toHaveValue(/^\[grátis\]\n/);
    await page.getByLabel("Aparece em pelo menos").selectOption("2");
    await expect(page.getByLabel("Lista de negativas")).toHaveValue("[grátis]");
    await page.getByLabel("Incluir negativas comuns").check();
    await expect(page.getByLabel("Lista de negativas")).toHaveValue(/\[torrent\]/);
    await expectAxeClean(page, "negativas");
    await expectLayoutOk(page);
  });

  test("negativas: erro sem termos, CSV com tipo e injeção neutralizada", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Gerar negativas" }).click();
    await page.getByLabel("Termos de pesquisa", { exact: true }).fill("+cmd grátis\n-x grátis");
    await page.getByLabel("Suas palavras-chave").fill("");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar CSV" }).last().click()]);
    expect(download.suggestedFilename()).toBe("negative-keywords.csv");
    const csv = await readDownload(download);
    expect(csv).toContain("keyword,match type,formatted,kind");
    expect(csv).toContain("grátis,Phrase");
    expect(csv).toContain(",negative");
    expect(csv).not.toMatch(/(^|[\r\n,])[=+\-@]/);
    await page.getByLabel("Termos de pesquisa", { exact: true }).fill("   ");
    await expect(page.getByText("Cole pelo menos um termo de pesquisa.")).toBeVisible();
  });

  test("em inglês e espanhol o exemplo também funciona", async ({ page }) => {
    await openHydrated(page, "/en/keywords/keyword-cleaner/");
    await expect(page.getByTestId("kcl-stats")).toContainText("7 entries");
    await openHydrated(page, "/es/palabras-clave/limpiador-de-palabras-clave/");
    await expect(page.getByTestId("kcl-stats")).toContainText("7 entradas");
    await expectAxeClean(page, "es");
  });
});
