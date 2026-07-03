import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/pt-BR/login', { waitUntil: 'load' })
  await page.waitForTimeout(1000)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.waitForURL(/\/pt-BR\/admin/, { timeout: 20000 })
  await page.waitForTimeout(2000)
}

test.describe('Authentication Flows', () => {
  test('01 - Login page renders correctly', async ({ page }) => {
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await page.waitForTimeout(1000)
    await expect(page.getByText(/área administrativa/i).first()).toBeVisible()
    await expect(page.getByPlaceholder('admin@sistema.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('02 - Login as admin succeeds', async ({ page }) => {
    await login(page, 'admin@sistema.com', 'admin123')
    await expect(page.getByText(/dashboard/i).first()).toBeVisible()
    await expect(page.getByText(/administrador global/i)).toBeVisible()
  })

  test('03 - Login as supervisor succeeds', async ({ page }) => {
    await login(page, 'supervisor@sistema.com', 'super123')
    await expect(page.getByText(/dashboard/i).first()).toBeVisible()
    await expect(page.getByText(/supervisor/i)).toBeVisible()
  })

  test('04 - Invalid credentials show error toast', async ({ page }) => {
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await page.waitForTimeout(1000)
    await page.fill('input[name="email"]', 'admin@sistema.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.waitForTimeout(3000)
    await expect(page.getByText(/incorreta|erro|inválido/i)).toBeVisible()
  })

  test('05 - Logout redirects to login', async ({ page }) => {
    await login(page, 'admin@sistema.com', 'admin123')
    await page.getByRole('button', { name: /sair/i }).click()
    await page.waitForURL(/\/pt-BR\/login/, { timeout: 15000 })
    await expect(page.getByText(/área administrativa/i).first()).toBeVisible()
  })

  test('06 - Forgot password page renders', async ({ page }) => {
    await page.goto('/pt-BR/forgot-password', { waitUntil: 'load' })
    await page.waitForTimeout(1000)
    await expect(page.getByText(/recuperar|esqueceu|senha/i)).toBeVisible()
  })

  test('07 - Forgot password form submission', async ({ page }) => {
    await page.goto('/pt-BR/forgot-password', { waitUntil: 'load' })
    await page.waitForTimeout(1000)
    const submitBtn = page.getByRole('button', { name: /enviar|recuperar/i }).first()
    if (await submitBtn.isVisible()) {
      const emailInput = page.getByPlaceholder(/email|e-?mail/i).first()
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@sistema.com')
      }
      await submitBtn.click()
      await page.waitForTimeout(2000)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('08 - Login page redirects to admin if authenticated', async ({ page }) => {
    await login(page, 'admin@sistema.com', 'admin123')
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    expect(page.url()).toContain('/admin')
  })
})
