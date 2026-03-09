'use server'

import { actionClient } from '@/_utils/safe-action'
import { reportSchema } from '@/_schemas/report'
import * as reportRepository from '@/_data-access/public/report.repository'

export const submitReportAction = actionClient
  .schema(reportSchema)
  .action(async ({ parsedInput: { type, description } }) => {
    const report = await reportRepository.createReport({ type, description })
    return { success: true, trackingCode: report.trackingCode }
  })
