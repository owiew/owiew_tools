import { expect, test, type Page } from "@playwright/test";
import { findBadText, openHydrated } from "./support";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: todos os testes de ferramenta provam "nada sai do navegador".
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

test.describe("Gerador de UTM", () => {
  test("gera, normaliza, avisa e nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/links-e-utm/gerador-de-utm/");
    await page.getByLabel("URL de destino").fill("loja.com/tenis?cor=azul#topo");
    await page.getByLabel("Origem (utm_source)").fill("Google");
    await page.getByLabel("Mídia (utm_medium)").fill("CPC");
    await page.getByLabel("Campanha (utm_campaign)").fill("Promoção de Verão!");
    const out = page.getByTestId("utm-output");
    await expect(out).toHaveText("https://loja.com/tenis?cor=azul&utm_source=google&utm_medium=cpc&utm_campaign=promocao-de-verao#topo");
    await expect(page.getByText("Faltava o https://")).toBeVisible();
    await page.getByLabel("Separador no lugar de espaços e símbolos").selectOption("_");
    await expect(out).toContainText("utm_campaign=promocao_de_verao");
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("mensagens de erro por campo faltando e URL inválida", async ({ page }) => {
    await openHydrated(page, "/pt-br/links-e-utm/gerador-de-utm/");
    await page.getByLabel("URL de destino").fill("javascript:alert(1)");
    await expect(page.getByText("Só aceitamos links http:// ou https://.")).toBeVisible();
    await page.getByLabel("URL de destino").fill("https://a.com");
    await expect(page.getByText("Informe a origem (utm_source).")).toBeVisible();
  });

  test("salva o padrão no localStorage e restaura depois de recarregar", async ({ page }) => {
    await openHydrated(page, "/pt-br/links-e-utm/gerador-de-utm/");
    await page.getByLabel("Remover acentos").uncheck();
    await page.getByRole("button", { name: "Salvar este padrão" }).click();
    await expect(page.getByText("Padrão salvo neste navegador.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Remover acentos")).not.toBeChecked();
    await page.getByRole("button", { name: "Restaurar padrão da casa" }).click();
    await expect(page.getByLabel("Remover acentos")).toBeChecked();
  });

  test("padrão salvo corrompido não quebra a página", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("owiew-tools:utm-rules", "{nao-e-json"));
    await openHydrated(page, "/pt-br/links-e-utm/gerador-de-utm/");
    await expect(page.getByLabel("Converter para minúsculas")).toBeChecked();
  });

  test("lote: gera, mostra erro por linha e exporta CSV protegido", async ({ page }) => {
    await openHydrated(page, "/en/links-and-utm/utm-builder/");
    await page.getByRole("button", { name: "Batch" }).click();
    await page.getByLabel("Source (utm_source)").fill("newsletter");
    await page.getByLabel("Medium (utm_medium)").fill("email");
    await page.getByLabel("Campaign (utm_campaign)").fill("Spring Sale");
    await page.getByLabel("URLs or CSV").fill('https://a.com/x\n=HYPERLINK("http://evil.test")\nhttps://b.com/y');
    await expect(page.getByRole("status").filter({ hasText: "2 built, 1 with errors." })).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    expect(download.suggestedFilename()).toBe("utm-links.csv");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const csv = Buffer.concat(chunks).toString("utf8");
    expect(csv).toContain("https://a.com/x?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale");
    expect(csv).toContain("'=HYPERLINK(");
    expect(csv).not.toMatch(/(^|[\r\n,])=HYPERLINK/);
  });
});

test.describe("Inspetor de URL", () => {
  test("quebra parâmetros, aponta problemas e identifica clique", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/links-e-utm/inspetor-de-url/");
    await page.getByLabel("URL para inspecionar").fill("https://loja.com/p?utm_source=Google&utm_source=bing&utm_medium=cpc&utm_campaign=Verao%20Quente&gclid=abc&fbclid=1#x");
    const alerts = page.getByRole("region", { name: "Alertas" });
    await expect(alerts).toContainText("utm_source aparece mais de uma vez com valores diferentes");
    await expect(alerts).toContainText("O valor de utm_campaign tem letra maiúscula");
    await expect(alerts).toContainText("O valor de utm_campaign tem espaço");
    const table = page.locator(".table-wrap");
    await expect(table).toContainText("Google Ads");
    await expect(table).toContainText("Meta");
    await expect(table).toContainText("Verao Quente");
    expect(external).toEqual([]);
  });

  test("URL inválida mostra erro e a página continua viva", async ({ page }) => {
    await openHydrated(page, "/en/links-and-utm/url-inspector/");
    for (const bad of ["not a url", "javascript:alert(1)", "http://", "%%%", "https://a.com/?x=%E0%A4%A"]) {
      await page.getByLabel("URL to inspect").fill(bad);
      await expect(page.locator("h1")).toBeVisible();
    }
    await page.getByLabel("URL to inspect").fill("javascript:alert(1)");
    await expect(page.getByRole("alert")).toContainText("http:// or https://");
  });

  test("codec codifica e decodifica", async ({ page }) => {
    await openHydrated(page, "/es/enlaces-y-utm/inspector-de-url/");
    await page.getByLabel("Texto o fragmento de URL").fill("verão & café");
    await expect(page.getByTestId("codec-encoded")).toHaveText("ver%C3%A3o%20%26%20caf%C3%A9");
    await page.getByLabel("Texto o fragmento de URL").fill("promo%C3%A7%C3%A3o");
    await expect(page.getByTestId("codec-decoded")).toHaveText("promoção");
    await page.getByLabel("Texto o fragmento de URL").fill("100%");
    await expect(page.getByText("No se pudo decodificar")).toBeVisible();
  });
});

test.describe("Calculadora de ROAS", () => {
  test("exemplo preenchido, recálculo e formatação por idioma", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/calculadoras/calculadora-de-roas/");
    await expect(page.getByTestId("roas")).toHaveText("4,00x");
    await expect(page.getByTestId("breakeven")).toHaveText("2,50x");
    await expect(page.getByTestId("profit")).toHaveText(/R\$\s1\.500,00/);
    await page.getByLabel("Margem de contribuição (%)", { exact: true }).fill("25");
    await expect(page.getByTestId("breakeven")).toHaveText("4,00x");
    await expect(page.getByTestId("profit")).toHaveText(/R\$\s0,00/);
    await expect(page.getByText("exatamente no ponto de equilíbrio")).toBeVisible();
    await page.getByLabel("Investimento em mídia").fill("3.000,00");
    await expect(page.getByTestId("profit")).toHaveText(/-R\$\s500,00/);
    expect(external).toEqual([]);
  });

  test("entrada inválida mostra erro por campo e não calcula", async ({ page }) => {
    await openHydrated(page, "/en/calculators/roas-calculator/");
    await page.getByLabel("Ad spend").fill("12abc");
    await expect(page.getByText("Use numbers only")).toBeVisible();
    await expect(page.getByTestId("roas")).toHaveCount(0);
    await page.getByLabel("Ad spend").fill("2,500.00");
    await page.getByLabel("Contribution margin (%)", { exact: true }).fill("120");
    await expect(page.getByText("between 0 and 100%")).toBeVisible();
    await page.getByLabel("Contribution margin (%)", { exact: true }).fill("0");
    await expect(page.getByTestId("breakeven")).toHaveText("n/a");
  });

  test("centavos sem erro de ponto flutuante", async ({ page }) => {
    await openHydrated(page, "/en/calculators/roas-calculator/");
    await page.getByLabel("Revenue attributed to ads").fill("0.30");
    await page.getByLabel("Ad spend").fill("0.10");
    await page.getByLabel("Contribution margin (%)", { exact: true }).fill("100");
    await expect(page.getByTestId("contribution")).toHaveText("$0.30");
    await expect(page.getByTestId("profit")).toHaveText("$0.20");
  });
});

test("busca client-side encontra ferramenta sem acento e só usa a própria origem", async ({ page }) => {
  const external = trackExternal(page);
  await page.goto("/pt-br/");
  await page.getByLabel("Buscar ferramenta").fill("inspetor url");
  await expect(page.locator(".search-results a").first()).toContainText("Inspetor de URL");
  await page.getByLabel("Buscar ferramenta").fill("margem de contribuicao");
  await expect(page.locator(".search-results a").first()).toContainText("Calculadora de ROAS");
  await page.getByLabel("Buscar ferramenta").fill("zzzz");
  await expect(page.locator(".search-results")).toContainText("Nenhuma ferramenta encontrada.");
  expect(external).toEqual([]);
});

test("alternância de tema persiste e idioma troca para a mesma página", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openHydrated(page, "/pt-br/links-e-utm/gerador-de-utm/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator(".lang-nav").getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/links-and-utm\/utm-builder\/$/);
});

test("CSP bloqueia conexão com terceiros (prova de privacidade no navegador)", async ({ page }) => {
  await page.goto("/pt-br/");
  const blocked = await page.evaluate(async () => {
    try {
      await fetch("https://example.com/", { mode: "no-cors" });
      return false;
    } catch {
      return true;
    }
  });
  expect(blocked).toBe(true);
});
