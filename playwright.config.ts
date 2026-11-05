import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'

// E2E nunca roda contra o banco de produção: exige um banco próprio (ex.: branch de teste na Neon)
const e2eDatabaseUrl = process.env.E2E_DATABASE_URL
if (!e2eDatabaseUrl) {
  throw new Error(
    'Defina E2E_DATABASE_URL apontando para um banco de teste (nunca o de produção) antes de rodar o E2E.'
  )
}
if (process.env.DATABASE_URL && e2eDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error('E2E_DATABASE_URL não pode ser igual a DATABASE_URL.')
}

// Porta própria para não reaproveitar um `npm run dev` comum, que usa o .env de produção
const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60000,
  reporter: 'line',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120000,
    // Variáveis do processo têm precedência sobre o .env no Next.js
    env: {
      DATABASE_URL: e2eDatabaseUrl,
      // O redirecionamento pós-login do Auth.js usa AUTH_URL; sem isso ele aponta para a porta do .env
      AUTH_URL: BASE_URL,
      // Chaves de teste oficiais do Cloudflare Turnstile (sempre aprovam); nunca usar em produção.
      // https://developers.cloudflare.com/turnstile/troubleshooting/testing/
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
    },
  },
})
