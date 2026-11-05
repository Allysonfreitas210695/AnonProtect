import fs from 'fs'
import path from 'path'

import type { Page } from '@playwright/test'

// Sessões reaproveitadas entre testes: o login tem rate limit (10 tentativas por IP a cada 15 min),
// então cada perfil faz login real uma única vez e os demais testes reutilizam os cookies.
const STATE_DIR = path.resolve(__dirname, '../../test-results/.auth')

export async function login(page: Page, email: string, password: string) {
  await page.goto('/pt-BR/login', { waitUntil: 'load' })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

async function loginWithCache(page: Page, email: string, password: string, role: string) {
  // Um arquivo por ambiente (localhost vs produção) e por perfil
  await page.goto('/pt-BR/login', { waitUntil: 'commit' })
  const host = new URL(page.url()).host.replace(/[^a-z0-9.-]/gi, '_')
  const file = path.join(STATE_DIR, `${host}-${role}.json`)

  if (fs.existsSync(file)) {
    const state = JSON.parse(fs.readFileSync(file, 'utf-8'))
    await page.context().addCookies(state.cookies)
    await page.goto('/pt-BR/admin', { waitUntil: 'load' })
    if (/\/pt-BR\/admin/.test(page.url())) return
  }

  await login(page, email, password)
  await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
  fs.mkdirSync(STATE_DIR, { recursive: true })
  await page.context().storageState({ path: file })
}

export async function loginAdmin(page: Page, opts: { fresh?: boolean } = {}) {
  if (opts.fresh) {
    await login(page, 'admin@sistema.com', 'admin123')
    await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
    return
  }
  await loginWithCache(page, 'admin@sistema.com', 'admin123', 'admin')
}

export async function loginSupervisor(page: Page, opts: { fresh?: boolean } = {}) {
  if (opts.fresh) {
    await login(page, 'supervisor@sistema.com', 'super123')
    await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
    return
  }
  await loginWithCache(page, 'supervisor@sistema.com', 'super123', 'supervisor')
}
