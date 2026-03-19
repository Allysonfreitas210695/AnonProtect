import { NextResponse } from 'next/server'
import { getSystemStatus } from '@/_actions/admin/system-status'
import { logger } from '@/_shared/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const statuses = await getSystemStatus()

    // Check for critical failures (Database)
    const databaseStatus = statuses.find((s) => s.name.includes('Database'))
    const isUnhealthy = databaseStatus?.status === 'unavailable'

    if (isUnhealthy) {
      logger.error({ statuses }, 'Health Check FAILIURE: Database is unavailable')
      return NextResponse.json({ status: 'unhealthy', services: statuses }, { status: 503 })
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: statuses,
    })
  } catch (error) {
    logger.error({ error }, 'Critical error during health check')
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 })
  }
}
