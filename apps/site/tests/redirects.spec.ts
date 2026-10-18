import { expect, test } from "@playwright/test";
import { sitemapPaths, toolPaths } from "./support";

/**
 * Caminho curto de uma página de ferramenta: `/<idioma>/<slug>/` (sem a categoria).
 *
 * Onde: specs de redirecionamento. Entrada: caminho canônico de 3 segmentos.
 * Saída: o caminho curto com barra final.
 */
function shortOf(canonical: string): string {
  const [lang, , slug] = canonical.split("/").filter(Boolean);
  return `/${lang}/${slug}/`;
}

test("self-check: o caminho curto some a categoria e o inexistente dá 404", async ({ request }) => {
  expect(shortOf("/pt-br/calculadoras/calculadora-de-roas/")).toBe("/pt-br/calculadora-de-roas/");
  expect((await request.get("/pt-br/nao-existe-esta-ferramenta/")).status()).toBe(404);
});

test("as 14 ferramentas x 3 idiomas têm link curto", () => {
  expect(toolPaths()).toHaveLength(42);
});

for (const canonical of toolPaths()) {
  const short = shortOf(canonical);
  test(`link curto ${short} redireciona para ${canonical}`, async ({ page, request }) => {
    const res = await request.get(short);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain(`<link rel="canonical" href="https://tools.owiew.com${canonical}"`);
    expect(html).toMatch(new RegExp(`<meta http-equiv="refresh" content="0;url=${canonical}"`));
    expect(html).toMatch(/<meta name="robots" content="noindex/);
    expect(html).toContain(`<a href="${canonical}">`);
    expect(sitemapPaths()).not.toContain(short);

    await page.goto(short);
    await page.waitForURL(`**${canonical}`);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}
