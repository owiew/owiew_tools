import AxeBuilder from "@axe-core/playwright";
import { expect, type Download, type Page } from "@playwright/test";

/**
 * Registra qualquer requisição que saia da origem do site.
 *
 * Onde: specs das ferramentas do T3 ("nada sai do navegador"). Entrada: página.
 * Saída: lista (viva) de URLs externas requisitadas.
 */
export function trackExternal(page: Page): string[] {
  const external: string[] = [];
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) external.push(req.url());
  });
  return external;
}

/**
 * Roda o axe (WCAG 2.2 AA) na página no estado atual e exige zero violações.
 *
 * Onde: specs das ferramentas, depois das interações (abas, erros, resultados).
 * Entradas: página e rótulo do estado para a mensagem. Efeito: falha o teste com a lista de violações.
 */
export async function expectAxeClean(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(summary, `${label}: ${summary.join("\n")}`).toEqual([]);
}

/**
 * Exige que a página não tenha rolagem horizontal e que os alvos de toque tenham 44px.
 *
 * Onde: specs das ferramentas, nos dois viewports (360px e desktop).
 * Entrada: página (já na ferramenta). Efeito: falha com a lista dos alvos pequenos.
 */
export async function expectLayoutOk(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "rolagem horizontal").toBeLessThanOrEqual(0);
  const small = await page.evaluate(() => {
    const sel = "main button, main select, main input:not([type=checkbox]), main textarea, main summary, main .check";
    return [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((el) => el.offsetParent !== null && !el.closest("p"))
      .map((el) => ({ el: `${el.tagName.toLowerCase()}.${el.className}:${(el.textContent ?? "").trim().slice(0, 20)}`, h: el.getBoundingClientRect().height, w: el.getBoundingClientRect().width }))
      .filter((r) => r.h < 43.5 || r.w < 43.5);
  });
  expect(small, "alvos menores que 44px").toEqual([]);
}

/**
 * Lê o conteúdo de um download como texto UTF-8.
 *
 * Onde: provas de exportação CSV. Entrada: o Download do Playwright. Saída: o texto do arquivo.
 */
export async function readDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}
