import { expect, test } from "@playwright/test";
import { expectAxeClean, expectLayoutOk, readDownload, trackExternal } from "./t3-support";
import { findBadText, openHydrated } from "./support";

const PT = "/pt-br/palavras-chave/combinador-de-palavras-chave/";
const lines = (prefix: string, n: number): string => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join("\n");

test.describe("Combinador de palavras-chave", () => {
  test("exemplo gera 12 combinações nos 3 tipos (36 linhas) e nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, PT);
    await expect(page.getByTestId("kc-summary")).toHaveText("36 de 36 linhas.");
    const out = page.getByLabel("Palavras-chave geradas");
    const value = await out.inputValue();
    expect(value.split("\n")).toHaveLength(36);
    expect(value.split("\n").slice(0, 3)).toEqual(["comprar tênis masculino", '"comprar tênis masculino"', "[comprar tênis masculino]"]);
    await expectAxeClean(page, "exemplo");
    await expectLayoutOk(page);
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("desmarcar tipos reduz a saída; sem tipo e sem termo mostram erro", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Frase: “termo”").uncheck();
    await page.getByLabel("Exata: [termo]").uncheck();
    await expect(page.getByTestId("kc-summary")).toHaveText("12 de 12 linhas.");
    await page.getByLabel("Ampla: termo").uncheck();
    await expect(page.getByText("Marque pelo menos um tipo de correspondência.")).toBeVisible();
    await page.getByLabel("Ampla: termo").check();
    for (const l of ["Lista A", "Lista B", "Lista C (opcional)"]) await page.getByLabel(l, { exact: true }).fill("");
    await expect(page.getByText("Escreva pelo menos um termo em alguma lista.")).toBeVisible();
    await expectAxeClean(page, "erros");
  });

  test("listas grandes respeitam o limite e informam o total real", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Lista A", { exact: true }).fill(lines("a", 30));
    await page.getByLabel("Lista B", { exact: true }).fill(lines("b", 30));
    await page.getByLabel("Lista C (opcional)").fill(lines("c", 30));
    await page.getByLabel("Limite de linhas na saída").selectOption("1000");
    await expect(page.getByTestId("kc-summary")).toHaveText("1000 de 81000 linhas.");
    await expect(page.getByText("Há 81000 combinações no total")).toBeVisible();
    expect((await page.getByLabel("Palavras-chave geradas").inputValue()).split("\n")).toHaveLength(1000);
  });

  test("avisa de combinação acima de 80 caracteres e normaliza símbolos e caixa", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Lista A", { exact: true }).fill(`${"a".repeat(90)}\nTênis (Azul)!`);
    await page.getByLabel("Lista B", { exact: true }).fill("x");
    await page.getByLabel("Lista C (opcional)").fill("");
    await expect(page.getByText("1 combinação(ões) passam de 80 caracteres")).toBeVisible();
    await expect(page.getByLabel("Palavras-chave geradas")).toHaveValue(new RegExp("tênis azul x\\n\"tênis azul x\"\\n\\[tênis azul x\\]"));
    await page.getByLabel("Remover acentos").check();
    await expect(page.getByLabel("Palavras-chave geradas")).toHaveValue(/tenis azul x/);
  });

  test("CSV exportado traz o tipo e neutraliza injeção de fórmula", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Lista A", { exact: true }).fill("+cmd\n-2\n@soma\n=1+1");
    await page.getByLabel("Lista B", { exact: true }).fill("x");
    await page.getByLabel("Lista C (opcional)").fill("");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar CSV" }).click()]);
    expect(download.suggestedFilename()).toBe("keywords.csv");
    const csv = await readDownload(download);
    expect(csv).toContain("keyword,match type,formatted,kind");
    expect(csv).toContain("'+cmd x,Broad,'+cmd x,keyword");
    expect(csv).toContain("'-2 x,Exact");
    expect(csv).not.toMatch(/(^|[\r\n,])[=+\-@]/);
  });

  test("em inglês e espanhol o exemplo também funciona", async ({ page }) => {
    await openHydrated(page, "/en/keywords/keyword-combiner/");
    await expect(page.getByTestId("kc-summary")).toHaveText("36 of 36 lines.");
    await openHydrated(page, "/es/palabras-clave/combinador-de-palabras-clave/");
    await expect(page.getByTestId("kc-summary")).toHaveText("36 de 36 líneas.");
    await expectAxeClean(page, "es");
  });
});
