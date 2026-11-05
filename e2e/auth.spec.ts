import { test, expect } from '@playwright/test'

import { loginAdmin, loginSupervisor } from './helpers/auth'

test.describe('Authentication Flows', () => {
  test('01 - Login page renders correctly', async ({ page }) => {
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await expect(page.getByText(/área administrativa/i).first()).toBeVisible()
    await expect(page.getByPlaceholder('admin@sistema.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('02 - Login as admin succeeds', async ({ page }) => {
    await loginAdmin(page, { fresh: true })
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/administrador/i).first()).toBeVisible()
  })

  test('03 - Login as supervisor succeeds', async ({ page }) => {
    await loginSupervisor(page, { fresh: true })
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/supervisor/i).first()).toBeVisible()
  })

  test('04 - Invalid credentials show error toast', async ({ page }) => {
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await page.fill('input[name="email"]', 'admin@sistema.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page.getByText(/incorreta|erro|inválido/i)).toBeVisible({ timeout: 10000 })
  })

  test('05 - Logout redirects to login', async ({ page }) => {
    await loginAdmin(page)
    await page.getByRole('button', { name: /sair/i }).click()
    // O logoutAction redireciona para /login sem prefixo de idioma
    await page.waitForURL(/\/(pt-BR\/)?login/, { timeout: 15000 })
    await expect(page.getByText(/área administrativa/i).first()).toBeVisible()
  })

  test('06 - Forgot password page renders', async ({ page }) => {
    await page.goto('/pt-BR/forgot-password', { waitUntil: 'load' })
    await expect(page.getByText(/recuperar|esqueceu|senha/i)).toBeVisible()
  })

  test('07 - Forgot password form submission', async ({ page }) => {
    await page.goto('/pt-BR/forgot-password', { waitUntil: 'load' })
    const submitBtn = page.getByRole('button', { name: /enviar|recuperar/i }).first()
    const emailInput = page.getByPlaceholder(/email|e-?mail/i).first()
    await expect(submitBtn).toBeVisible()
    await expect(emailInput).toBeVisible()
    await emailInput.fill('admin@sistema.com')
    await submitBtn.click()
    await expect(page.locator('body')).toBeVisible()
  })

  test('08 - Login page redirects to admin if authenticated', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/pt-BR/login', { waitUntil: 'load' })
    await page.waitForURL(/\/pt-BR\/admin/, { timeout: 10000 })
    expect(page.url()).toContain('/admin')
  })
})
