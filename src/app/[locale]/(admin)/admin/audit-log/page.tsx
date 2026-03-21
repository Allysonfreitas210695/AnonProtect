import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { GlobalActivityLog } from '@/_components/shared/global-activity-log'
import { getGlobalActivityLogs as getAuditLogs } from '@/_modules/admin/admin.query'
import { Button } from '@/_components/ui/button'
import { Link } from '@/i18n/navigation'
import { getCurrentUser } from '@/_shared/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const t = await getTranslations('AuditLog')
  const activities = await getAuditLogs(100)

  return (
    <div className="flex-1 space-y-8 p-4 pt-4 sm:p-8 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{t('description')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">{t('backToDashboard')}</Link>
        </Button>
      </div>

      <Card className="bg-card/40 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">
            {t('recentActivitiesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalActivityLog activities={activities} />
        </CardContent>
      </Card>
    </div>
  )
}
