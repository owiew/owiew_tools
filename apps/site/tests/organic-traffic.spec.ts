import { expect, test, type Page } from "@playwright/test";
import { findBadText, openHydrated } from "./support";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: prova de que nada sai do navegador. Entrada: página. Saída: lista viva.
 */
function trackExternal(page: Page): string[] {
  const external: string[] = [];
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) external.push(req.url());
  });
  return external;
}

test.describe("Estimador de tráfego orgânico", () => {
  test("calcula cliques por posição e o ganho do cenário, com a fonte da curva visível", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/utilidades/estimador-de-trafego-organico/");
    // 12.100 x 0,70% = 85; 3.600 x 0,30% = 11; 1.300 na posição 14 = 0
    await expect(page.getByTestId("org-total-now")).toHaveText("96");
    // posição 1 (7,1%): 859 + 256 + 92
    await expect(page.getByTestId("org-total-new")).toHaveText("1.207");
    await expect(page.getByTestId("org-total-gain")).toHaveText("+1.111");

    await page.getByLabel("Subir posições").check();
    await expect(page.getByLabel("Posições a subir")).toHaveValue("3");
    // 5->2: 363 (3,0% de 12.100); 8->5: 25; 14->11: 0
    await expect(page.getByTestId("org-total-new")).toHaveText("388");

    await page.getByLabel("Palavras-chave, volume mensal e posição atual").fill("a;1.000;3");
    await page.getByLabel("Chegar a uma posição").check();
    await page.getByLabel("Posição desejada").fill("1");
    await expect(page.getByTestId("org-total-now")).toHaveText("17");
    await expect(page.getByTestId("org-total-new")).toHaveText("71");

    await expect(page.getByText("First Page Sage").first()).toBeVisible();
    await expect(page.getByText("Publicado (First Page Sage, 2026)").first()).toBeVisible();
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("alterna entre os dois cenários da First Page Sage por radio group acessível", async ({ page }) => {
    await openHydrated(page, "/pt-br/utilidades/estimador-de-trafego-organico/");
    const group = page.getByRole("group", { name: "Curva de CTR" });
    const combined = group.getByRole("radio", { name: "Com resumos de IA (combinado)" });
    const noAi = group.getByRole("radio", { name: "Sem resposta de IA" });
    await expect(combined).toBeChecked();
    await expect(noAi).not.toBeChecked();
    await expect(group).toContainText("First Page Sage, 22/09/2026");
    await expect(page.getByTestId("org-total-new")).toHaveText("1.207");
    await expect(page.getByRole("cell", { name: "7,10%" })).toBeVisible();

    // Teclado: seta troca o radio; sem resposta de IA = 22,6; 10,2; 5,8; 3,7; 2,5; 1,8; ...
    await combined.focus();
    await page.keyboard.press("ArrowRight");
    await expect(noAi).toBeChecked();
    // 12.100 x 2,5% = 303 (pos. 5); 3.600 x 0,9% = 32 (pos. 8); 1.300 na 14 = 0
    await expect(page.getByTestId("org-total-now")).toHaveText("335");
    // posição 1 (22,6%): 2.735 + 814 + 294
    await expect(page.getByTestId("org-total-new")).toHaveText("3.843");
    await expect(page.getByRole("cell", { name: "22,60%" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Curva de CTR usada: Sem resposta de IA/ })).toBeVisible();

    await combined.check();
    await expect(page.getByTestId("org-total-new")).toHaveText("1.207");
  });

  test("en e es oferecem os dois cenários com rótulo traduzido", async ({ page }) => {
    await openHydrated(page, "/en/utilities/organic-traffic-estimator/");
    await page.getByRole("radio", { name: "Without an AI answer" }).check();
    await expect(page.getByTestId("org-total-now")).toHaveText("335");
    await openHydrated(page, "/es/utilidades/estimador-de-trafico-organico/");
    await expect(page.getByRole("radio", { name: "Con resúmenes de IA (combinado)" })).toBeChecked();
    await page.getByRole("radio", { name: "Sin respuesta de IA" }).check();
    await expect(page.getByTestId("org-total-now")).toHaveText("335");
  });

  test("erro por linha sem perder as linhas boas, e cenário inválido", async ({ page }) => {
    await openHydrated(page, "/pt-br/utilidades/estimador-de-trafego-organico/");
    await page.getByLabel("Palavras-chave, volume mensal e posição atual").fill("a;1.000;3\nb;abc;2\nc;50;0\nd;10");
    await expect(page.getByText("Linha 2: o volume precisa ser um número inteiro")).toBeVisible();
    await expect(page.getByText("Linha 3: a posição precisa ser um inteiro de 1 a 100.")).toBeVisible();
    await expect(page.getByText("Linha 4: use três colunas")).toBeVisible();
    await expect(page.getByTestId("org-total-now")).toHaveText("17");
    await page.getByLabel("Posição desejada").fill("zero");
    await expect(page.getByText("Informe um número inteiro válido para o cenário.").first()).toBeVisible();
    await page.getByLabel("Palavras-chave, volume mensal e posição atual").fill("");
    await expect(page.getByText("Informe pelo menos uma palavra-chave válida.")).toBeVisible();
  });

  test("en e es calculam igual com milhar do idioma", async ({ page }) => {
    await openHydrated(page, "/en/utilities/organic-traffic-estimator/");
    await expect(page.getByTestId("org-total-new")).toHaveText("1,207");
    await openHydrated(page, "/es/utilidades/estimador-de-trafico-organico/");
    await expect(page.getByTestId("org-total-new")).toHaveText("1207");
  });
});
