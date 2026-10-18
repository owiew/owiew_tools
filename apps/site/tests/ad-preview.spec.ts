import { expect, test } from "@playwright/test";
import { expectAxeClean, expectLayoutOk, readDownload, trackExternal } from "./t3-support";
import { findBadText, openHydrated } from "./support";

const PT = "/pt-br/anuncios/previa-de-anuncio/";

test.describe("Prévia e contador de anúncio", () => {
  test("exemplo pronto: prévia genérica, URL exibida e nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, PT);
    await expect(page.getByText("Pronto: tudo cabe nos limites")).toBeVisible();
    await expect(page.getByTestId("google-display-url")).toHaveText("exemplo.com.br/tenis/corrida");
    await expect(page.locator(".ad-title").first()).toHaveText("Tênis de corrida com desconto | Frete grátis acima de R$ 199 | Troca grátis em 30 dias");
    await expect(page.locator("#ad-h0-count")).toHaveText("29 / 30");
    await expectAxeClean(page, "google");
    await expectLayoutOk(page);
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("contador acusa excesso em texto, marca o campo e conta largura dupla como 2", async ({ page }) => {
    await openHydrated(page, PT);
    const h1 = page.getByLabel("Título 1", { exact: true });
    await h1.fill("a".repeat(31));
    await expect(page.locator("#ad-h0-count")).toHaveText("31 / 30 (1 acima do limite)");
    await expect(h1).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Ainda não está pronto")).toBeVisible();
    await h1.fill("日".repeat(16));
    await expect(page.locator("#ad-h0-count")).toHaveText("32 / 30 (2 acima do limite)");
    await h1.fill("a".repeat(30));
    await expect(page.locator("#ad-h0-count")).toHaveText("30 / 30");
    await expect(page.getByText("Pronto: tudo cabe nos limites")).toBeVisible();
    await page.getByLabel("Descrição 1", { exact: true }).fill("d".repeat(91));
    await expect(page.locator("#ad-d0-count")).toHaveText("91 / 90 (1 acima do limite)");
    await page.getByLabel("Caminho 1", { exact: true }).fill("a".repeat(16));
    await expect(page.locator("#ad-path1-count")).toHaveText("16 / 15 (1 acima do limite)");
    await expectAxeClean(page, "excesso");
  });

  test("mínimos, duplicados, caminho 2 sem caminho 1 e limite de 15 títulos", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Remover Título 4" }).click();
    await page.getByRole("button", { name: "Remover Título 3" }).click();
    await expect(page.getByText("Preencha pelo menos 3 títulos.")).toBeVisible();
    await page.getByRole("button", { name: "Adicionar título" }).click();
    await page.getByLabel("Título 3", { exact: true }).fill("FRETE GRÁTIS ACIMA DE R$ 199");
    await expect(page.getByText("Há títulos repetidos.")).toBeVisible();
    await page.getByLabel("Caminho 1", { exact: true }).fill("");
    await expect(page.getByText("O caminho 2 só funciona se o caminho 1 estiver preenchido.")).toBeVisible();
    const add = page.getByRole("button", { name: "Adicionar título" });
    for (let i = 0; i < 20 && (await add.isEnabled()); i++) await add.click();
    await expect(page.locator("input[id^=ad-h]")).toHaveCount(15);
    await expect(add).toBeDisabled();
    await page.getByLabel("Título 15", { exact: true }).fill("Oferta!");
    await expect(page.getByRole("region", { name: "Prévia" }).getByText("Ponto de exclamação em título")).toBeVisible();
  });

  test("Meta: trunca o texto principal acima de 125 e não corta abaixo", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Meta (Facebook e Instagram)" }).click();
    await expect(page.locator("#meta-primary-count")).toContainText("154 / 125 (29 acima do limite)");
    const shown = page.getByTestId("meta-primary-shown");
    await expect(shown).toContainText("…");
    await expect(shown).toContainText("ver mais");
    await expect(page.getByText("Algum texto passa do recomendado")).toBeVisible();
    await page.getByLabel("Texto principal").fill("Texto curto e direto.");
    await expect(shown).toHaveText("Texto curto e direto.");
    await expect(page.getByText("Tudo dentro dos limites recomendados.")).toBeVisible();
    await page.getByLabel("Título", { exact: true }).fill("t".repeat(40));
    await expect(page.getByTestId("meta-headline-shown")).toHaveText(`${"t".repeat(27)}…`);
    await expectAxeClean(page, "meta");
    await expectLayoutOk(page);
  });

  test("exporta CSV com os dois anúncios e neutraliza injeção de fórmula", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Título 2", { exact: true }).fill('=HYPERLINK("http://evil.test")');
    await page.getByLabel("Título 3", { exact: true }).fill("+cmd");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar CSV" }).click()]);
    expect(download.suggestedFilename()).toBe("ad-texts.csv");
    const csv = await readDownload(download);
    expect(csv).toContain("platform,field,position,text,length,limit,status");
    expect(csv).toContain("google,headline,1,Tênis de corrida com desconto,29,30,ok");
    expect(csv).toContain("meta,primary_text,1,");
    expect(csv).toContain("'=HYPERLINK(");
    expect(csv).toContain("'+cmd");
    expect(csv).not.toMatch(/(^|[\r\n,])[=+]/);
  });

  test("em inglês e espanhol: textos e limites no idioma", async ({ page }) => {
    await openHydrated(page, "/en/ads/ad-preview-and-counter/");
    await expect(page.getByText("Ready: everything fits the limits")).toBeVisible();
    await expect(page.getByTestId("google-display-url")).toHaveText("example.com/running/shoes");
    await openHydrated(page, "/es/anuncios/vista-previa-de-anuncio/");
    await expect(page.getByText("Listo: todo cabe en los límites")).toBeVisible();
    await expectAxeClean(page, "es");
  });
});
