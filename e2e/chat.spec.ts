import { test, expect } from '@playwright/test'

import { loginAdmin } from './helpers/auth'
import { submitReportViaForm } from './helpers/report'

test.describe('Chat Round Trip (Whistleblower <-> Admin)', () => {
  test('01 - Anonymous message reaches admin, admin reply reaches anonymous', async ({
    browser,
  }) => {
    const anonContext = await browser.newContext()
    const adminContext = await browser.newContext()
    const anonPage = await anonContext.newPage()
    const adminPage = await adminContext.newPage()

    try {
      const trackingCode = await submitReportViaForm(anonPage)
      expect(trackingCode).toBeTruthy()

      const anonMessage = `Mensagem do denunciante ${Date.now()}`
      await anonPage.goto(`/pt-BR/report/${trackingCode}`, { waitUntil: 'load' })
      await anonPage.getByPlaceholder('Digite sua mensagem...').fill(anonMessage)
      await anonPage.getByRole('button', { name: 'Enviar' }).click()
      await expect(anonPage.getByText(anonMessage).filter({ visible: true }).first()).toBeVisible({
        timeout: 15000,
      })

      await loginAdmin(adminPage)
      await adminPage
        .getByRole('link', { name: /denúncias|reports/i })
        .first()
        .click()
      await adminPage.waitForURL(/\/pt-BR\/admin\/report/, { timeout: 10000 })

      const searchInput = adminPage.getByPlaceholder(/buscar|search|código/i).first()
      await expect(searchInput).toBeVisible({ timeout: 10000 })
      await searchInput.fill(trackingCode)
      await searchInput.press('Enter')

      const detailsLink = adminPage
        .getByRole('link', { name: /ver detalhes|view details/i })
        .first()
      await expect(detailsLink).toBeVisible({ timeout: 10000 })
      await detailsLink.click()
      await adminPage.waitForURL(/\/pt-BR\/admin\/report\//, { timeout: 10000 })

      await expect(adminPage.getByText(anonMessage).filter({ visible: true }).first()).toBeVisible({
        timeout: 15000,
      })

      const adminReply = `Resposta do admin ${Date.now()}`
      await adminPage.getByPlaceholder('Responder como Admin...').fill(adminReply)
      await adminPage.getByRole('button', { name: 'Enviar' }).click()
      await expect(adminPage.getByText(adminReply).filter({ visible: true }).first()).toBeVisible({
        timeout: 15000,
      })

      await anonPage.reload({ waitUntil: 'load' })
      await expect(anonPage.getByText(adminReply).filter({ visible: true }).first()).toBeVisible({
        timeout: 15000,
      })
    } finally {
      await anonContext.close()
      await adminContext.close()
    }
  })
})
