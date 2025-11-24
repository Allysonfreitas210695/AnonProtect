import { notFound } from 'next/navigation'
import { Card, CardContent } from "@/app/_components/ui/card"
import { getReportById } from '@/app/_lib/data'
import { MessageList } from '@/app/_components/shared/message-list'
import { ReportCard } from '@/app/_components/shared/report-card'
import { StatusUpdateForm } from './status-form'
import { AdminMessageForm } from './admin-message-form'

export const dynamic = 'force-dynamic'

export default async function AdminReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await getReportById(id)

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Denúncia #{report.trackingCode}</h1>
        <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
      </div>

      <ReportCard report={report} showStatus={false}>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
            <p className="text-sm">{new Date(report.updatedAt).toLocaleDateString('pt-BR')}</p>
          </div>
          {report.assignedTo && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Responsável</p>
              <p className="text-sm">{report.assignedTo.name}</p>
            </div>
          )}
        </div>
      </ReportCard>

      <div>
        <h2 className="text-2xl font-bold mb-4">Comunicação com Denunciante</h2>
        <Card className="h-[500px] flex flex-col">
          <CardContent className="flex-1 p-4 overflow-hidden">
            <div className="h-full overflow-y-auto pr-4">
              <MessageList messages={report.messages} currentUserType="ADMIN" />
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <AdminMessageForm reportId={report.id} />
          </div>
        </Card>
      </div>
    </div>
  )
}
