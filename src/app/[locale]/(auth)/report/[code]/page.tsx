import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/_components/ui/card'
import { getReportByCode } from '@/_data-access/public/report.query'
import { MessageList } from '@/_components/shared/message-list'
import { ReportCard } from '@/_components/shared/report-card'
import { MessageForm } from './_components/message-form'
import { getTranslations } from 'next-intl/server'
import { RateLimitGuard } from '@/_components/shared/rate-limit-guard'

export const dynamic = 'force-dynamic'

export default async function ReportStatusPage({ params }: { params: Promise<{ code: string }> }) {
  const t = await getTranslations('Tracking')
  const { code } = await params
  const report = await getReportByCode(code)

  if (!report) {
    notFound()
  }

  return (
    <RateLimitGuard>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 lg:py-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </header>

        <ReportCard report={report} />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">{t('history')}</h2>
          <Card className="bg-card flex h-[600px] flex-col overflow-hidden shadow-xl">
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-y-auto p-4 lg:p-6">
                <MessageList messages={report.messages} currentUserType="USER" />
              </div>
            </CardContent>
            <div className="bg-muted/30 p-4 lg:p-6">
              <MessageForm reportId={report.id} code={code} />
            </div>
          </Card>
        </div>
      </div>
    </RateLimitGuard>
  )
}
