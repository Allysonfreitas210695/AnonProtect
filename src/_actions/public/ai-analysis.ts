'use server'

import { after } from 'next/server'
import * as reportData from '@/_modules/report/report.data'

export async function triggerAiAnalysis(reportId: string, description: string, country: string) {
  after(async () => {
    try {
      await reportData.processAiAnalysis(reportId, description, country)
    } catch (error) {
      console.error('Background AI Analysis Error:', error)
    }
  })
}
