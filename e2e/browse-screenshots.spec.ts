import { test } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const dir = path.resolve(__dirname, '../screenshots')
fs.mkdirSync(dir, { recursive: true })

test.setTimeout(120000)

test('Browse admin area and take screenshots', async ({ page }) => {
  // 1. Login page
  await page.goto('/pt-BR/login', { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${dir}/01-login.png`, fullPage: true })

  // Fill credentials and submit
  await page.fill('input[name="email"]', 'admin@sistema.com')
  await page.fill('input[name="password"]', 'admin123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
  await page.waitForTimeout(3000)

  // 2. Dashboard
  await page.screenshot({ path: `${dir}/02-dashboard.png`, fullPage: true })

  // 3. Reports list
  await page
    .getByRole('link', { name: /denúncias/i })
    .first()
    .click()
  await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${dir}/03-lista-denuncias.png`, fullPage: true })

  // 4. Report detail (if available)
  const detailsLink = page.getByRole('link', { name: /ver detalhes/i }).first()
  if (await detailsLink.isVisible()) {
    await detailsLink.click()
    await page.waitForTimeout(5000)
  }
  await page.screenshot({ path: `${dir}/04-detalhe-denuncia.png`, fullPage: true })

  // 5. Profile
  await page.goto('/pt-BR/admin/profile', { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${dir}/05-perfil.png`, fullPage: true })

  // 6. Settings (admin only)
  await page.goto('/pt-BR/admin/settings', { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${dir}/06-configuracoes.png`, fullPage: true })
})
