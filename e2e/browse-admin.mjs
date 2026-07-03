import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.resolve(__dirname, '../screenshots')

import fs from 'fs'
fs.mkdirSync(screenshotDir, { recursive: true })

const browser = await chromium.launch({
  headless: false,
  executablePath: '/home/allyson/.cache/ms-playwright/chromium-1229/chrome-linux64/chrome',
  args: ['--start-maximized'],
})

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
})

const page = await context.newPage()

async function snap(name) {
  const filepath = path.join(screenshotDir, `${name}.png`)
  await page.screenshot({ path: filepath, fullPage: true })
  console.log(`  📸 Screenshot: ${name}.png`)
}

async function pause(ms = 1000) {
  await page.waitForTimeout(ms)
}

// 1. Login
console.log('\n🔐 1. Logando como admin...')
await page.goto('http://127.0.0.1:3000/pt-BR/login', { waitUntil: 'load' })
await snap('01-login')

await page.fill('input[name="email"]', 'admin@sistema.com')
await page.fill('input[name="password"]', 'admin123')
await page.getByRole('button', { name: 'Entrar', exact: true }).click()
await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
await pause(2000)
await snap('02-dashboard')

// 2. Reports list
console.log('\n📋 2. Navegando para lista de denúncias...')
await page.getByRole('link', { name: /denúncias/i }).first().click()
await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
await pause(2000)
await snap('03-lista-denuncias')

// 3. Try to click on first report detail
console.log('\n🔍 3. Abrindo detalhes da primeira denúncia...')
const detailsLink = page.getByRole('link', { name: /ver detalhes/i }).first()
if (await detailsLink.isVisible()) {
  await detailsLink.click()
  await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })
  await pause(2000)
  await snap('04-detalhe-denuncia')
} else {
  console.log('  ⚠️ Nenhuma denúncia com link de detalhes encontrada')
}

// 4. Profile page
console.log('\n👤 4. Acessando perfil...')
await page.getByRole('link', { name: /meu perfil|perfil/i }).first().click()
await page.waitForURL(/\/pt-BR\/admin\/profile/, { timeout: 10000 })
await pause(2000)
await snap('05-perfil')

// 5. Settings (admin only)
console.log('\n⚙️ 5. Acessando configurações...')
const settingsLink = page.getByRole('link', { name: /configurações/i }).first()
if (await settingsLink.isVisible()) {
  await settingsLink.click()
  await page.waitForURL(/\/pt-BR\/admin\/settings/, { timeout: 10000 })
  await pause(2000)
  await snap('06-configuracoes')
} else {
  console.log('  ⚠️ Link de configurações não encontrado')
}

console.log(`\n✅ Navegação concluída! Screenshots salvos em: ${screenshotDir}`)
await browser.close()
