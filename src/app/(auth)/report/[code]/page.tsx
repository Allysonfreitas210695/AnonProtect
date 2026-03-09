import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/_components/ui/card'
import { getReportByCode } from '@/_data-access/public/report.query'
import { MessageList } from '@/_components/shared/message-list'
import { ReportCard } from '@/_components/shared/report-card'
import { MessageForm } from './_components/message-form'

export const dynamic = 'force-dynamic'

export default async function ReportStatusPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const report = await getReportByCode(code)

  if (!report) {
    notFound()
  }

  return (
    <div className="mx-auto my-12 max-w-3xl space-y-8">
      <ReportCard report={report} />

      <div>
        <h2 className="mb-4 text-2xl font-bold">Comunicação</h2>
        <Card className="flex h-[500px] flex-col">
          <CardContent className="flex-1 overflow-hidden p-4">
            <div className="h-full overflow-y-auto pr-4">
              <MessageList messages={report.messages} currentUserType="USER" />
            </div>
          </CardContent>
          <div className="border-t p-4">
            <MessageForm reportId={report.id} code={code} />
          </div>
        </Card>
      </div>
    </div>
  )
}
