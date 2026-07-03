import { test, expect } from '@playwright/test'

import { submitReportViaForm } from './helpers/report'

test.describe('AI Auto-Analysis (Graceful Degradation)', () => {
  test('01 - Report creation and tracking view succeed regardless of AI output', async ({
    page,
  }) => {
    const trackingCode = await submitReportViaForm(page)
    expect(trackingCode).toBeTruthy()

    await page.goto(`/pt-BR/report/${trackingCode}`, { waitUntil: 'load' })

    await expect(page.getByText('Acompanhamento de Denúncia')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(trackingCode)).toBeVisible({ timeout: 15000 })
  })
})
