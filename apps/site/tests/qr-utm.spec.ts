import { expect, test, type Download, type Page } from "@playwright/test";
import jsQR from "jsqr";
import sharp from "sharp";
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

/**
 * Lê um download inteiro em memória.
 *
 * Onde: testes de download do QR Code. Entrada: download do Playwright.
 * Saída: Buffer com o conteúdo do arquivo.
 */
async function readDownload(d: Download): Promise<Buffer> {
  const stream = await d.createReadStream();
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

/**
 * Decodifica um QR Code a partir de PNG ou SVG (o decodificador só existe no teste).
 *
 * Onde: provas de ida e volta. Entrada: bytes da imagem. Saída: texto lido ou null.
 */
async function decode(bytes: Buffer): Promise<string | null> {
  const { data, info } = await sharp(bytes, { density: 144 }).flatten({ background: "#ffffff" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data ?? null;
}

const PAYLOAD = "https://loja.com/cardapio?utm_source=mesa&utm_medium=qr&utm_campaign=cardapio-2026";

test.describe("Gerador de QR Code", () => {
  test("PNG e SVG baixados decodificam de volta para o link com UTM", async ({ page }) => {
    const external = trackExternal(page);
    await openHydrated(page, "/pt-br/utilidades/gerador-de-qr-code/");
    await expect(page.getByTestId("qr-payload")).toHaveText(PAYLOAD);

    const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar PNG" }).click()]);
    expect(png.suggestedFilename()).toBe("qr-code.png");
    const pngBytes = await readDownload(png);
    expect((await sharp(pngBytes).metadata()).format).toBe("png");
    expect(await decode(pngBytes)).toBe(PAYLOAD);

    const [svg] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar SVG" }).click()]);
    expect(svg.suggestedFilename()).toBe("qr-code.svg");
    const svgBytes = await readDownload(svg);
    expect(svgBytes.toString("utf8")).not.toMatch(/<script|http:\/\/(?!www\.w3\.org)/);
    expect(await decode(svgBytes)).toBe(PAYLOAD);

    expect(findBadText(await page.locator("main").innerText())).toEqual([]);
    expect(external).toEqual([]);
  });

  test("opções: sem UTM, correção H, tamanho e margem mudam o resultado e ainda decodificam", async ({ page }) => {
    await openHydrated(page, "/en/utilities/qr-code-generator/");
    await page.getByLabel("Add UTM to the link").uncheck();
    await page.getByLabel("Destination link").fill("shop.com/a b".replace(" ", "-"));
    await page.getByLabel("Error correction").selectOption("H");
    await page.getByLabel("Size (px)").fill("1024");
    await page.getByLabel("Margin (modules)").fill("2");
    await expect(page.getByTestId("qr-payload")).toHaveText("https://shop.com/a-b");
    await expect(page.getByText("Margin below 4 modules").first()).toBeVisible();
    await expect(page.getByTestId("qr-facts")).toContainText("px image");
    const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PNG" }).click()]);
    expect(await decode(await readDownload(png))).toBe("https://shop.com/a-b");
  });

  test("contraste baixo, tamanho, margem e link inválidos são recusados com mensagem", async ({ page }) => {
    await openHydrated(page, "/pt-br/utilidades/gerador-de-qr-code/");
    await page.getByLabel("Cor dos módulos").fill("#777777");
    await page.getByLabel("Cor do fundo").fill("#888888");
    await expect(page.getByText("Contraste baixo demais").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Baixar PNG" })).toHaveCount(0);
    await page.getByLabel("Cor dos módulos").fill("#000000");
    await page.getByLabel("Cor do fundo").fill("#ffffff");
    await page.getByLabel("Tamanho (px)").fill("50");
    await expect(page.getByText("Use um tamanho inteiro entre 128 e 2048 px.").first()).toBeVisible();
    await page.getByLabel("Tamanho (px)").fill("512");
    await page.getByLabel("Margem (módulos)").fill("-3");
    await expect(page.getByText("Use uma margem inteira entre 0 e 16 módulos.").first()).toBeVisible();
    await page.getByLabel("Margem (módulos)").fill("4");
    await page.getByLabel("Link de destino").fill("javascript:alert(1)");
    await expect(page.getByText("Só aceitamos links http:// ou https://.").first()).toBeVisible();
  });

  test("self-check: o decodificador não lê imagem sem QR Code (a prova de ida e volta não é vazia)", async () => {
    const blank = await sharp({ create: { width: 300, height: 300, channels: 3, background: "#ffffff" } }).png().toBuffer();
    expect(await decode(blank)).toBeNull();
  });
});
