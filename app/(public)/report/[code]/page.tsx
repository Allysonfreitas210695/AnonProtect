import { notFound } from 'next/navigation'
import { Card, CardContent } from "@/app/_components/ui/card"
import { getReportByCode } from '@/app/_lib/data'
import { MessageList } from '@/app/_components/shared/message-list'
import { ReportCard } from '@/app/_components/shared/report-card'
import { MessageForm } from './message-form'

export const dynamic = 'force-dynamic'

export default async function ReportStatusPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const report = await getReportByCode(code)

  if (!report) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto my-12 space-y-8">
      <ReportCard report={report} />

      <div>
        <h2 className="text-2xl font-bold mb-4">Comunicação</h2>
        <Card className="h-[500px] flex flex-col">
          <CardContent className="flex-1 p-4 overflow-hidden">
            <div className="h-full overflow-y-auto pr-4">
              <MessageList messages={report.messages} currentUserType="USER" />
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <MessageForm reportId={report.id} code={code} />
          </div>
        </Card>
      </div>
    </div>
  )
}
