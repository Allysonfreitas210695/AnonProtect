import path from 'path'

import { test, expect } from '@playwright/test'

import { loginAdmin } from './helpers/auth'
import { submitReportViaForm } from './helpers/report'

test.describe('Attachment Upload', () => {
  test('01 - Report with attachment is created and visible in admin evidence gallery', async ({
    page,
  }) => {
    const filePath = path.resolve(__dirname, 'fixtures/evidence.pdf')
    const trackingCode = await submitReportViaForm(page, { filePath })
    expect(trackingCode).toBeTruthy()

    await loginAdmin(page)

    await page
      .getByRole('link', { name: /denúncias|reports/i })
      .first()
      .click()
    await page.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })

    const searchInput = page.getByPlaceholder(/buscar|search|código/i).first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill(trackingCode)
    await searchInput.press('Enter')

    const detailsLink = page.getByRole('link', { name: /ver detalhes|view details/i }).first()
    await expect(detailsLink).toBeVisible({ timeout: 10000 })
    await detailsLink.click()
    await page.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })

    await expect(page.getByText('evidence.pdf')).toBeVisible({ timeout: 15000 })
  })
})
