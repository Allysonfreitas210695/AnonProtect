import * as reportRepository from '@/_data-access/public/report.repository'
import { analyzeReport } from '@/_lib/ai'
import { reportSchema } from '@/_schemas/report'
import { z } from 'zod'

type ReportInput = z.infer<typeof reportSchema>

export const ReportService = {
  async submitReport(input: ReportInput) {
    const categories = await reportRepository.getCategories()
    const currentCategory = categories.find((c) => c.id === input.categoryId)
    const categoryNames = categories.map((c) => c.name)

    const aiAnalysis = await analyzeReport(input.description, categoryNames, input.country)

    const trackingCode = this.generateTrackingCode()
    const report = await reportRepository.createReport({
      ...input,
      trackingCode,
      priority: aiAnalysis?.priority || 'MEDIUM',
      assignedDepartmentId: currentCategory?.defaultDepartmentId || undefined,
    })

    return {
      success: true,
      trackingCode: report.trackingCode,
    }
  },

  generateTrackingCode(): string {
    const year = new Date().getFullYear()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `AP-${year}-${randomPart}`
  },

  async verifyTurnstile(token: string) {
    if (!process.env.TURNSTILE_SECRET_KEY) return true

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })

    const verifyData = await verifyRes.json()
    return verifyData.success
  },
}
