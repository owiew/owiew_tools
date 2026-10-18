import { expect, test, type Page } from "@playwright/test";
import { findBadText, openHydrated } from "./support";

const PT = "/pt-br/links-e-utm/gerador-de-nomenclatura/";
const EN = "/en/links-and-utm/campaign-naming-generator/";
const ES = "/es/enlaces-y-utm/generador-de-nomenclatura-de-campanas/";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: todos os testes desta ferramenta provam "nada sai do navegador".
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

test.describe("Gerador de nomenclatura de campanhas", () => {
  test("nome de exemplo, separador, caixa, data e decodificação", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, PT);
    const out = page.getByTestId("naming-output");
    await expect(out).toHaveText("meta-ads_conversao_remarketing-30d_black-friday_20261101");
    await expect(page.getByTestId("naming-length")).toHaveText("56 caracteres");
    await expect(page.getByRole("rowheader", { name: "Oferta" })).toBeVisible();

    await page.getByLabel("Objetivo", { exact: true }).fill("Tráfego Pago");
    await expect(out).toHaveText("meta-ads_trafego-pago_remarketing-30d_black-friday_20261101");

    await page.getByLabel("Separador entre blocos").selectOption("-");
    await expect(out).toHaveText("meta_ads-trafego_pago-remarketing_30d-black_friday-20261101");
    await page.getByLabel("Separador entre blocos").selectOption("|");
    await expect(out).toHaveText("meta-ads|trafego-pago|remarketing-30d|black-friday|20261101");

    await page.getByLabel("Caixa das letras").selectOption("upper");
    await expect(out).toHaveText("META-ADS|TRAFEGO-PAGO|REMARKETING-30D|BLACK-FRIDAY|20261101");
    await page.getByLabel("Caixa das letras").selectOption("keep");
    await page.getByLabel("Remover acentos").uncheck();
    await expect(out).toHaveText("Meta-Ads|Tráfego-Pago|Remarketing-30d|Black-Friday|20261101");

    await page.getByLabel("Data", { exact: true }).fill("2026-12-25");
    await page.getByLabel("Formato da data").selectOption("MMMYY");
    await expect(out).toHaveText("Meta-Ads|Tráfego-Pago|Remarketing-30d|Black-Friday|dez26");
    await page.getByLabel("Data", { exact: true }).fill("");
    await expect(page.getByText("Sem data: o bloco será ignorado.")).toBeVisible();
    await expect(out).toHaveText("Meta-Ads|Tráfego-Pago|Remarketing-30d|Black-Friday");

    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("reordenar blocos com os botões e bloco vazio ignorado", async ({ page }) => {
    await openHydrated(page, PT);
    const out = page.getByTestId("naming-output");
    await expect(page.getByRole("button", { name: "Subir Canal", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Descer Data", exact: true })).toBeDisabled();

    await page.getByRole("button", { name: "Subir Oferta", exact: true }).click();
    await expect(out).toHaveText("meta-ads_conversao_black-friday_remarketing-30d_20261101");
    await expect(page.getByRole("button", { name: "Subir Oferta", exact: true })).toBeFocused();
    await expect(page.getByText("Oferta agora é o bloco 3 de 5.")).toBeAttached();

    await page.getByRole("button", { name: "Descer Canal", exact: true }).click();
    await expect(out).toHaveText("conversao_meta-ads_black-friday_remarketing-30d_20261101");

    await page.getByLabel("Canal ou plataforma (opcional)").fill("");
    await page.getByLabel("Público", { exact: true }).fill("   ");
    await expect(out).toHaveText("conversao_black-friday_20261101");
  });

  test("entrada inválida: bloco longo demais mostra erro no campo e nada vazio gera nome", async ({ page }) => {
    await openHydrated(page, PT);
    const offer = page.getByLabel("Oferta", { exact: true });
    await offer.fill("x".repeat(201));
    await expect(page.getByText("Este bloco passa de 200 caracteres. Encurte o texto.")).toBeVisible();
    await expect(offer).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Um dos blocos tem texto demais (máximo de 200 caracteres).")).toBeVisible();
    await offer.fill("Black Friday");
    await expect(offer).toHaveAttribute("aria-invalid", "false");

    for (const label of ["Canal ou plataforma (opcional)", "Objetivo", "Público", "Oferta"]) {
      await page.getByLabel(label, { exact: true }).fill("");
    }
    await page.getByLabel("Data", { exact: true }).fill("");
    await expect(page.getByText("Preencha ao menos um bloco para ver o nome.")).toBeVisible();
    await expect(page.getByTestId("naming-output")).toHaveCount(0);
  });

  test("aviso de nome longo", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByLabel("Oferta", { exact: true }).fill("promocao ".repeat(15));
    await expect(page.getByText("O nome passa de 100 caracteres.", { exact: false })).toBeVisible();
  });

  test("lote: combinações, tabela, CSV e teto de 500", async ({ page }) => {
    await openHydrated(page, PT);
    await page.getByRole("button", { name: "Em lote", exact: true }).click();
    await page.getByLabel("Vários canais (um por linha)").fill("Meta\nGoogle");
    await page.getByLabel("Várias ofertas (uma por linha)").fill("Black Friday\nNatal\nVerão");
    await expect(page.getByTestId("naming-batch-summary")).toHaveText("6 nomes gerados (limite de 500).");
    await expect(page.getByRole("cell", { name: "google_conversao_remarketing-30d_verao_20261101", exact: true })).toBeVisible();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar CSV" }).click()]);
    expect(download.suggestedFilename()).toBe("nomes-de-campanha.csv");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const csv = Buffer.concat(chunks).toString("utf8");
    expect(csv).toContain("canal,objetivo,publico,oferta,data,nome,tamanho");
    expect(csv).toContain("meta,conversao,remarketing-30d,black-friday,20261101,meta_conversao_remarketing-30d_black-friday_20261101,52");

    const many = (n: number) => Array.from({ length: n }, (_, i) => `v${i}`).join("\n");
    await page.getByLabel("Vários canais (um por linha)").fill(many(26));
    await page.getByLabel("Várias ofertas (uma por linha)").fill(many(20));
    await expect(page.getByText("São combinações demais: o limite é de 500 nomes. Reduza as listas.")).toBeVisible();
    await page.getByLabel("Vários canais (um por linha)").fill(many(25));
    await expect(page.getByTestId("naming-batch-summary")).toHaveText("500 nomes gerados (limite de 500).");
    await expect(page.getByText("Mostrando 200 de 500.", { exact: false })).toBeVisible();
  });

  test("en: rótulos, formato de data e nada sai do navegador", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, EN);
    const out = page.getByTestId("naming-output");
    await expect(out).toHaveText("meta-ads_conversion_remarketing-30d_black-friday_20261101");
    await expect(page.getByTestId("naming-length")).toHaveText("57 characters");
    await page.getByLabel("Objective", { exact: true }).fill("Traffic");
    await page.getByLabel("Date format").selectOption("MMMYY");
    await expect(out).toHaveText("meta-ads_traffic_remarketing-30d_black-friday_nov26");
    await page.getByRole("button", { name: "Move Offer up", exact: true }).click();
    await expect(out).toHaveText("meta-ads_traffic_black-friday_remarketing-30d_nov26");
    expect(external).toEqual([]);
  });

  test("es: rótulos y caja alta", async ({ page }) => {
    await openHydrated(page, ES);
    const out = page.getByTestId("naming-output");
    await expect(out).toHaveText("meta-ads_conversion_remarketing-30d_black-friday_20261101");
    await page.getByLabel("Mayúsculas y minúsculas").selectOption("upper");
    await page.getByLabel("Formato de la fecha").selectOption("MMMYY");
    await expect(out).toHaveText("META-ADS_CONVERSION_REMARKETING-30D_BLACK-FRIDAY_NOV26");
    await page.getByRole("button", { name: "En lote", exact: true }).click();
    await page.getByLabel("Varios canales (uno por línea)").fill("Meta\nGoogle");
    await expect(page.getByTestId("naming-batch-summary")).toHaveText("2 nombres generados (límite de 500).");
  });
});
