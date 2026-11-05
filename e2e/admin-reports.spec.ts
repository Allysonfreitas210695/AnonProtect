import { test, expect } from '@playwright/test'

import { loginAdmin } from './helpers/auth'

test.describe('Admin - Report Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('01 - Dashboard shows stats cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Visão geral do sistema de proteção').first()).toBeVisible()
    await expect(page.getByText('Denúncias Recentes').first()).toBeVisible()
  })

  test('02 - Reports list loads with table', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })
  })

  test('03 - Report search filter works', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })
    const searchInput = page.getByPlaceholder(/buscar|search|código/i).first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('AP-2025')
    await searchInput.press('Enter')
    await expect(page.locator('table')).toBeVisible()
  })

  test('04 - Date filter works', async ({ page }) => {
    const periodFilter = page.getByRole('combobox').filter({ hasText: 'Últimos 30 dias' })
    await expect(periodFilter).toBeVisible({ timeout: 10000 })
    await periodFilter.click()
    await page.getByRole('option', { name: 'Últimos 7 dias' }).click()
    await expect(page).toHaveURL(/period=7d/, { timeout: 10000 })
  })

  test('05 - View report detail from dashboard', async ({ page }) => {
    const detailsLink = page.getByRole('link', { name: /ver detalhes|view details/i }).first()
    await expect(detailsLink).toBeVisible({ timeout: 10000 })
    await detailsLink.click()
    await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 20000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('06 - Report detail shows status update dropdown', async ({ page }) => {
    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })

    const detailsLink = page.getByRole('link', { name: /ver detalhes|view details/i }).first()
    await expect(detailsLink).toBeVisible({ timeout: 10000 })
    await detailsLink.click()
    await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })

    const statusSelect = page.locator('select').first()
    await expect(statusSelect).toBeVisible({ timeout: 10000 })
    const currentValue = await statusSelect.inputValue()
    expect(currentValue).toBeTruthy()
  })

  test('07 - Analytics page loads', async ({ page }) => {
    await page.goto('/pt-BR/admin/analytics', { waitUntil: 'load' })
    await expect(page.locator('body')).toBeVisible()
  })

  test('08 - System status page loads', async ({ page }) => {
    await page.goto('/pt-BR/admin/status', { waitUntil: 'load' })
    await expect(page.locator('body')).toBeVisible()
  })
})
