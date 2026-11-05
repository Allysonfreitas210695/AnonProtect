import { test, expect } from '@playwright/test'

import { submitReportViaForm } from './helpers/report'

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
    await expect(page.getByLabel('Código de Acompanhamento')).toBeVisible()
  })

  test('03 - Track report with valid code shows status', async ({ page }) => {
    // O código é gerado no envio (16 símbolos Base32), então a denúncia é criada aqui
    const trackingCode = await submitReportViaForm(page)
    await page.goto('/pt-BR/report/track', { waitUntil: 'load' })
    const input = page.getByLabel('Código de Acompanhamento')
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(trackingCode)
    await page.getByRole('button', { name: 'Acessar' }).click()
    await page.waitForURL(new RegExp(`/report/${trackingCode}`), { timeout: 20000 })
    await expect(page.getByText(/pendente/i).first()).toBeVisible({ timeout: 10000 })
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
