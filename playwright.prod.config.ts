import { defineConfig, devices } from '@playwright/test'

// Suíte E2E completa contra o ambiente publicado, sem servidor local.
// Os testes que enviam denúncia são pulados (o Turnstile real exige verificação humana)
// e são cobertos pelo roteiro manual em docs/roteiro-testes-manuais.md.
// Uso: npx playwright test -c playwright.prod.config.ts
process.env.E2E_TARGET = 'production'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 300000,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-prod-results.json' }]],
  outputDir: 'test-results/prod',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL ?? 'https://anon-protect.vercel.app',
    headless: !process.env.HEADED,
    launchOptions: { slowMo: process.env.HEADED ? 250 : 0 },
    viewport: { width: 1440, height: 900 },
    trace: 'off',
    screenshot: 'only-on-failure',
  },
})
