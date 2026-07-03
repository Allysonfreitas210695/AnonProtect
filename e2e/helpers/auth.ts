import type { Page } from '@playwright/test'

export async function login(page: Page, email: string, password: string) {
  await page.goto('/pt-BR/login', { waitUntil: 'load' })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

export async function loginAdmin(page: Page) {
  await login(page, 'admin@sistema.com', 'admin123')
  await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
}

export async function loginSupervisor(page: Page) {
  await login(page, 'supervisor@sistema.com', 'super123')
  await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
}
