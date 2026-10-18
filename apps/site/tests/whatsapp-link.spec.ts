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

test.describe("Link de WhatsApp", () => {
  test("gera o link com mensagem codificada e UTM no link citado", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/utilidades/link-de-whatsapp/");
    await page.getByLabel("Número com DDD").fill("+55 (11) 91234-5678");
    await page.getByLabel("Mensagem inicial (opcional)").fill("Oi & tudo bem? 100% #1\nQuero a oferta");
    await page.getByLabel("Link para citar na mensagem (opcional)").fill("loja.com/oferta");
    await page.getByLabel("Origem (utm_source)").fill("Instagram");
    await page.getByLabel("Mídia (utm_medium)").fill("Bio");
    await page.getByLabel("Campanha (utm_campaign)").fill("Lançamento");
    const out = page.getByTestId("wa-output");
    await expect(out).toHaveText(
      "https://wa.me/5511912345678?text=Oi%20%26%20tudo%20bem%3F%20100%25%20%231%0AQuero%20a%20oferta%0Ahttps%3A%2F%2Floja.com%2Foferta%3Futm_source%3Dinstagram%26utm_medium%3Dbio%26utm_campaign%3Dlancamento",
    );
    await expect(page.getByTestId("wa-preview")).toContainText("https://loja.com/oferta?utm_source=instagram&utm_medium=bio&utm_campaign=lancamento");
    await expect(page.getByText("O link citado estava sem https://").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Testar no WhatsApp/ })).toHaveAttribute("rel", "noopener noreferrer");
    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("erros por campo: número inválido, DDI inválido, UTM incompleta e URL hostil", async ({ page }) => {
    await openHydrated(page, "/pt-br/utilidades/link-de-whatsapp/");
    const phone = page.getByLabel("Número com DDD");
    await phone.fill("11abc");
    await expect(page.getByText("O número só pode ter dígitos").first()).toBeVisible();
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await phone.fill("(11) 91234-5678");
    await page.getByLabel("Código do país (DDI)").fill("0");
    await expect(page.getByText("Informe o código do país com 1 a 3 dígitos").first()).toBeVisible();
    await page.getByLabel("Código do país (DDI)").fill("55");
    await page.getByLabel("Mídia (utm_medium)").fill("");
    await expect(page.getByText("Informe a mídia (utm_medium).").first()).toBeVisible();
    await page.getByLabel("Mídia (utm_medium)").fill("bio");
    await page.getByLabel("Link para citar na mensagem (opcional)").fill("javascript:alert(1)");
    await expect(page.getByText("Só aceitamos links http:// ou https://.").first()).toBeVisible();
    await expect(page.getByTestId("wa-output")).toHaveCount(0);
  });

  test("sem UTM nem mensagem devolve só o número; en e es funcionam", async ({ page }) => {
    await openHydrated(page, "/en/utilities/whatsapp-link-generator/");
    await page.getByLabel("Add UTM to the quoted link").uncheck();
    await page.getByLabel("First message (optional)").fill("");
    await page.getByLabel("Link to quote in the message (optional)").fill("");
    await page.getByLabel("Phone number").fill("(415) 555-0123");
    await expect(page.getByTestId("wa-output")).toHaveText("https://wa.me/14155550123");
    await openHydrated(page, "/es/utilidades/generador-de-enlace-de-whatsapp/");
    await page.getByLabel("Mensaje inicial (opcional)").fill("¡Hola! Quiero más info");
    await expect(page.getByTestId("wa-output")).toContainText("https://wa.me/34612345678?text=%C2%A1Hola!%20Quiero%20m%C3%A1s%20info");
  });
});
