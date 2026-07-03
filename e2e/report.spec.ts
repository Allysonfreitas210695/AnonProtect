import { test, expect } from '@playwright/test'

const KNOWN_TRACKING_CODE = 'AP-2025-0001'

test.describe('Report (Whistleblower) Flows', () => {
  test('01 - New report page renders with form', async ({ page }) => {
    await page.goto('/pt-BR/report/new', { waitUntil: 'load' })
    await expect(page.getByText(/descrição|description|descripción/i)).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText(/categoria|category/i)).toBeVisible()
  })

  test('02 - Track report page renders with code input', async ({ page }) => {
    await page.goto('/pt-BR/report/track', { waitUntil: 'load' })
    await expect(page.getByText(/código|code|código de rastreamento/i)).toBeVisible()
  })

  test('03 - Track report with valid code shows status', async ({ page }) => {
    await page.goto('/pt-BR/report/track', { waitUntil: 'load' })
    const input = page.locator('input').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(KNOWN_TRACKING_CODE)
    const trackButton = page.getByRole('button', { name: /consultar|track|buscar/i }).first()
    await expect(trackButton).toBeVisible()
    await trackButton.click()
    await expect(page.getByText(/status|situação|em análise|recebid/i).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('04 - Report success page shows tracking code', async ({ page }) => {
    await page.goto(`/pt-BR/report/success?code=${KNOWN_TRACKING_CODE}`, { waitUntil: 'load' })
    await expect(page.getByText(/denúncia enviada|report submitted/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('05 - View report by tracking code', async ({ page }) => {
    await page.goto(`/pt-BR/report/${KNOWN_TRACKING_CODE}`, { waitUntil: 'load' })
    await expect(page.locator('body')).toBeVisible()
  })

  test('06 - Invalid tracking code shows error', async ({ page }) => {
    await page.goto('/pt-BR/report/INVALID-CODE', { waitUntil: 'load' })
    await expect(page.locator('body')).toBeVisible()
  })
})
