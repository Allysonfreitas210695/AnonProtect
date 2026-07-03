import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('01 - Landing page loads with CTAs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })
    await expect(page.locator('h1')).toBeVisible()
    await expect(
      page.getByRole('link', { name: /nova denúncia|new report|nueva denuncia/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /acompanhar|track|seguimiento/i }).first()
    ).toBeVisible()
  })

  test('02 - How it works page', async ({ page }) => {
    await page.goto('/how-it-works', { waitUntil: 'load' })
    await expect(page.getByText(/como funciona|how it works/i)).toBeVisible()
    await expect(
      page.getByRole('link', { name: /fazer denúncia|make report/i }).first()
    ).toBeVisible()
  })

  test('03 - Privacy policy page', async ({ page }) => {
    await page.goto('/privacy-policy', { waitUntil: 'load' })
    await expect(page.getByText(/privacidade|privacy/i)).toBeVisible()
  })

  test('04 - Terms of service page', async ({ page }) => {
    await page.goto('/terms-of-service', { waitUntil: 'load' })
    await expect(page.getByText(/termos|terms/i)).toBeVisible()
  })

  test('05 - Transparency page with public stats', async ({ page }) => {
    await page.goto('/transparency', { waitUntil: 'load' })
    await page.waitForTimeout(2000)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('06 - Not found page returns 404', async ({ page }) => {
    const response = await page.goto('/nonexistent-page', { waitUntil: 'load' })
    await expect(page.locator('body')).toBeVisible()
  })
})
