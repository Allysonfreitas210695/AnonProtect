import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/app/_components/ui/card'
import { getReportById } from '@/app/_lib/data'
import { MessageList } from '@/app/_components/shared/message-list'
import { ReportCard } from '@/app/_components/shared/report-card'
import { StatusUpdateForm } from './status-form'
import { AdminMessageForm } from './admin-message-form'
import { EvidenceGallery } from './evidence-gallery'
import { ActivityTimeline } from './activity-timeline'
import { InvestigationNotes } from './investigation-notes'

export const dynamic = 'force-dynamic'

export default async function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReportById(id)

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold lg:text-3xl">Denúncia #{report.trackingCode}</h1>
        <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
      </div>

      <ReportCard report={report} showStatus={false}>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
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

      {/* Evidence Gallery */}
      <EvidenceGallery attachments={report.attachments} />

      {/* Two Column Layout for Timeline and Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Timeline */}
        <ActivityTimeline activities={report.activityLogs} />

        {/* Investigation Notes */}
        <InvestigationNotes reportId={report.id} notes={report.investigationNotes} />
      </div>

      {/* Communication Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Comunicação com Denunciante</h2>
        <Card className="flex h-[500px] flex-col">
          <CardContent className="flex-1 overflow-hidden p-4">
            <div className="h-full overflow-y-auto pr-4">
              <MessageList messages={report.messages} currentUserType="ADMIN" />
            </div>
          </CardContent>
          <div className="border-t p-4">
            <AdminMessageForm reportId={report.id} />
          </div>
        </Card>
      </div>
    </div>
  )
}
