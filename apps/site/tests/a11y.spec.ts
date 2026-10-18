import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { EMPTY_CATEGORY_PATHS, sitemapPaths } from "./support";

const PAGES = [...sitemapPaths(), ...EMPTY_CATEGORY_PATHS];

for (const scheme of ["light", "dark"] as const) {
  for (const path of PAGES) {
    test(`axe WCAG 2.2 AA sem violações: ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}

test("a página não tem rolagem horizontal e os alvos de toque têm 44px", async ({ page }) => {
  for (const path of ["/pt-br/", "/pt-br/links-e-utm/gerador-de-utm/", "/en/links-and-utm/url-inspector/", "/es/calculadoras/calculadora-de-roas/"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path}: rolagem horizontal`).toBeLessThanOrEqual(0);
    const small = await page.evaluate(() => {
      const sel = "header a, footer a, main button, main select, main input:not([type=checkbox]), main textarea, main summary, main .tool-card, .check";
      return [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => el.offsetParent !== null && !el.closest("p"))
        .map((el) => ({ el: `${el.tagName.toLowerCase()}.${el.className}:${(el.textContent ?? "").trim().slice(0, 20)}`, h: el.getBoundingClientRect().height, w: el.getBoundingClientRect().width }))
        .filter((r) => r.h < 43.5 || r.w < 43.5);
    });
    expect(small, `${path}: alvos menores que 44px`).toEqual([]);
  }
});
