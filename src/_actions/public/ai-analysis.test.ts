import { describe, it, expect, vi } from 'vitest'
import { triggerAiAnalysis } from './ai-analysis'
import * as reportData from '@/_modules/report/report.data'
import { after } from 'next/server'

vi.mock('@/_modules/report/report.data', () => ({
  processAiAnalysis: vi.fn(),
}))

vi.mock('next/server', () => ({
  after: vi.fn((cb) => cb()),
}))

describe('AI Analysis Trigger', () => {
  it('should call processAiAnalysis within after callback', async () => {
    const reportId = 'report-123'
    const description = 'Sensitive report description'
    const country = 'Brasil'

    await triggerAiAnalysis(reportId, description, country)

    expect(after).toHaveBeenCalled()
    expect(reportData.processAiAnalysis).toHaveBeenCalledWith(reportId, description, country)
  })
})
