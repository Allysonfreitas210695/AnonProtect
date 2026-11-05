import { test, expect } from '@playwright/test'

import { loginAdmin, loginSupervisor } from './helpers/auth'

test.describe('Admin - Settings & Profile', () => {
  test.describe('As ADMIN', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdmin(page)
    })

    test('01 - Settings page shows categories section', async ({ page }) => {
      await page
        .getByRole('link', { name: /configurações|settings/i })
        .first()
        .click()
      await page.waitForURL(/\/pt-BR\/admin\/settings/, { timeout: 10000 })
      await expect(page.getByText('Nova Categoria', { exact: true })).toBeVisible({
        timeout: 10000,
      })
      await expect(page.getByText(/categorias cadastradas/i)).toBeVisible()
    })

    test('02 - Settings page shows departments section', async ({ page }) => {
      await page
        .getByRole('link', { name: /configurações|settings/i })
        .first()
        .click()
      await page.waitForURL(/\/pt-BR\/admin\/settings/, { timeout: 10000 })
      await expect(page.getByText(/departamentos cadastrados/i)).toBeVisible({ timeout: 10000 })
    })

    test('03 - Profile page loads', async ({ page }) => {
      await page
        .getByRole('link', { name: /meu perfil|profile|perfil/i })
        .first()
        .click()
      await page.waitForURL(/\/pt-BR\/admin\/profile/, { timeout: 10000 })
      await expect(page.locator('body')).toBeVisible()
    })

    test('04 - Profile shows personal info form', async ({ page }) => {
      await page.goto('/pt-BR/admin/profile', { waitUntil: 'load' })
      const nameInput = page.locator('input[name="name"]').first()
      await expect(nameInput).toBeVisible({ timeout: 10000 })
      await expect(nameInput).toHaveValue(/administrador/i)
    })
  })

  test.describe('As SUPERVISOR', () => {
    test.beforeEach(async ({ page }) => {
      await loginSupervisor(page)
    })

    test('05 - Supervisor cannot access settings page', async ({ page }) => {
      await page.goto('/pt-BR/admin/settings', { waitUntil: 'load' })
      await page.waitForTimeout(3000)
      expect(page.url()).not.toContain('/settings')
    })

    test('06 - Supervisor dashboard works', async ({ page }) => {
      await expect(page.getByText(/dashboard/i).first()).toBeVisible()
    })
  })

  test.describe('Audit Log', () => {
    test('07 - Audit log page loads (ADMIN only)', async ({ page }) => {
      await loginAdmin(page)
      await page.goto('/pt-BR/admin/audit-log', { waitUntil: 'load' })
      await expect(page.locator('body')).toBeVisible()
    })

    test('08 - Supervisor redirected from audit log', async ({ page }) => {
      await loginSupervisor(page)
      await page.goto('/pt-BR/admin/audit-log', { waitUntil: 'load' })
      await page.waitForTimeout(3000)
      expect(page.url()).not.toContain('/audit-log')
    })
  })
})
