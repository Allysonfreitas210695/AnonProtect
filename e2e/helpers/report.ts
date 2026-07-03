import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface SubmitReportOptions {
  description?: string
  filePath?: string
}

const DEFAULT_DESCRIPTION = 'Denúncia de teste automatizado E2E via Playwright.'

export async function submitReportViaForm(
  page: Page,
  opts: SubmitReportOptions = {}
): Promise<string> {
  await page.goto('/pt-BR/report/new', { waitUntil: 'load' })

  await page.getByRole('combobox').first().click()
  await page.getByRole('option').first().click()

  const description = opts.description ?? DEFAULT_DESCRIPTION
  await page
    .getByPlaceholder('Descreva o ocorrido com o máximo de detalhes possível...')
    .fill(description)

  if (opts.filePath) {
    await page.locator('input[type="file"]').setInputFiles(opts.filePath)
  }

  await page.getByLabel(/Li e aceito os termos de privacidade/).click()
  await page
    .getByLabel(/Autorizo o processamento da minha denúncia por Inteligência Artificial/)
    .click()

  await page.getByRole('button', { name: 'Enviar Denúncia' }).click()

  await page.waitForURL(/\/report\/success/, { timeout: 20000 })

  const url = new URL(page.url())
  const trackingCode = url.searchParams.get('code')
  expect(trackingCode).toBeTruthy()

  return trackingCode as string
}
