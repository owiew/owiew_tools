import { defineConfig } from "@playwright/test";

// CHROME_PATH aponta para um Chrome/Chromium do sistema (útil offline); no CI o
// Playwright instala o próprio Chromium e a variável fica vazia.
const executablePath = process.env["CHROME_PATH"] || undefined;

export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  retries: 0,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4321",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    { name: "mobile-360", use: { viewport: { width: 360, height: 740 }, isMobile: false } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4321/pt-br/",
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
  },
});
