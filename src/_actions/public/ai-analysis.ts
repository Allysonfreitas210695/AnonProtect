import 'server-only'

import { after } from 'next/server'
import * as reportData from '@/_modules/report/report.data'
import { logger } from '@/_shared/lib/logger'

export async function triggerAiAnalysis(reportId: string, description: string, country: string) {
  after(async () => {
    try {
      await reportData.processAiAnalysis(reportId, description, country)
    } catch (error) {
      logger.error(error, 'Background AI Analysis Error:')
    }
  })
}
