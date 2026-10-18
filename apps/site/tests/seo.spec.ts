import { expect, test } from "@playwright/test";
import { findBadText, sitemapPaths, toolPaths } from "./support";

test("self-check: o detector de template quebrado precisa falhar com texto ruim", () => {
  expect(findBadText("Resultado: undefined")).toEqual(["undefined"]);
  expect(findBadText("Total {{ valor }} e NaN")).toEqual(expect.arrayContaining(["{{", "NaN"]));
  expect(findBadText("Texto normal com Nanquim e nulo")).toEqual([]);
});

test("raiz redireciona por HTML estático para pt-br com link e hreflang", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('http-equiv="refresh" content="0; url=/pt-br/"');
  expect(html).toContain('href="/pt-br/"');
  expect(html).toContain('hreflang="x-default"');
});

for (const path of sitemapPaths()) {
  test(`SEO e conteúdo: ${path}`, async ({ page }) => {
    await page.goto(path);
    const lang = path.split("/")[1] ?? "";
    expect(await page.locator("html").getAttribute("lang")).toBe(lang === "pt-br" ? "pt-BR" : lang);
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`https://tools.owiew.com${path}`);
    const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => e.getAttribute("hreflang")));
    expect(alternates.sort()).toEqual(["en", "es", "pt-BR", "x-default"]);
    expect((await page.locator('meta[name="description"]').getAttribute("content"))?.length ?? 0).toBeGreaterThan(60);
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toMatch(/^https:\/\/tools\.owiew\.com\/og\/(pt-br|en|es)\/[a-z-]+\.png$/);
    expect(findBadText(await page.locator("body").innerText())).toEqual([]);
  });
}

for (const path of toolPaths()) {
  test(`JSON-LD completo e OG existente: ${path}`, async ({ page, request }) => {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}") as Record<string, unknown>));
    expect(blocks.map((b) => b["@type"]).sort()).toEqual(["BreadcrumbList", "FAQPage", "HowTo", "WebApplication"]);
    const app = blocks.find((b) => b["@type"] === "WebApplication");
    expect(app).toMatchObject({ applicationCategory: "BusinessApplication", isAccessibleForFree: true, offers: { price: "0" } });
    const faq = blocks.find((b) => b["@type"] === "FAQPage") as { mainEntity: unknown[] };
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4);
    expect(await page.locator("details summary").count()).toBe(faq.mainEntity.length);
    const og = (await page.locator('meta[property="og:image"]').getAttribute("content")) ?? "";
    const res = await request.get(new URL(og).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
}
