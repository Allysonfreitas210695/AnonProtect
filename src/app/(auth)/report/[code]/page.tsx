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
    <div className="mx-auto px-4 py-8 lg:py-12 max-w-4xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Acompanhamento</h1>
        <p className="text-muted-foreground">Veja abaixo o status e histórico da sua denúncia</p>
      </header>

      <ReportCard report={report} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Comunicação e Histórico</h2>
        <Card className="flex h-[600px] flex-col overflow-hidden border-border shadow-md bg-card">
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <MessageList messages={report.messages} currentUserType="USER" />
            </div>
          </CardContent>
          <div className="border-t bg-muted/30 p-4 lg:p-6">
            <MessageForm reportId={report.id} code={code} />
          </div>
        </Card>
      </div>
    </div>
  )
}
