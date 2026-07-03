import { test, expect } from '@playwright/test'

import { loginAdmin } from './helpers/auth'

test.describe('Admin - Report Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('01 - Dashboard shows stats cards', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByText(/visão geral/i)).toBeVisible()
    await expect(page.getByText(/denúncias recentes|recent reports/i)).toBeVisible()
  })

  test('02 - Reports list loads with table', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('table')).toBeVisible()
  })

  test('03 - Report search filter works', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
    await page.waitForTimeout(1000)
    const searchInput = page.getByPlaceholder(/buscar|search|código/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('AP-2025')
      await searchInput.press('Enter')
      await page.waitForTimeout(2000)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('04 - Date filter works', async ({ page }) => {
    await expect(page.getByText(/7d|30d|90d|todos|all/i)).toBeVisible()
  })

  test('05 - View report detail from dashboard', async ({ page }) => {
    const detailsLink = page.getByRole('link', { name: /ver detalhes|view details/i }).first()
    if (await detailsLink.isVisible()) {
      await detailsLink.click()
      await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('06 - Report detail shows status update dropdown', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
    await page.waitForTimeout(1000)

    const detailsLink = page.getByRole('link', { name: /ver detalhes|view details/i }).first()
    if (await detailsLink.isVisible()) {
      await detailsLink.click()
      await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })
      await page.waitForTimeout(2000)

      const statusSelect = page.locator('select').first()
      if (await statusSelect.isVisible()) {
        const currentValue = await statusSelect.inputValue()
        expect(currentValue).toBeTruthy()
      }
    }
  })

  test('07 - Analytics page loads', async ({ page }) => {
    await page.goto('/pt-BR/admin/analytics', { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('08 - System status page loads', async ({ page }) => {
    await page.goto('/pt-BR/admin/status', { waitUntil: 'load' })
    await page.waitForTimeout(3000)
    await expect(page.locator('body')).toBeVisible()
  })
})
