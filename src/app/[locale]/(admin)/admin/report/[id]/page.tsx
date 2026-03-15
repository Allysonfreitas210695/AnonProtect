import { getTranslations } from 'next-intl/server'
import { formatCompactDateTime } from '@/_utils/formatters'
import { getCurrentUser } from '@/_lib/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/_components/shared/status-badge'
import { Button } from '@/_components/ui/button'
import { Download, Building2 } from 'lucide-react'
import { ForwardReportForm } from './_components/forward-form'
import { StatusUpdateForm } from './_components/status-form'
import { ReportCard } from '@/_components/shared/report-card'
import { EvidenceGallery } from './_components/evidence-gallery'
import { ActivityTimeline } from './_components/activity-timeline'
import { InvestigationNotes } from './_components/investigation-notes'
import { Card, CardContent } from '@/_components/ui/card'
import { MessageList } from '@/_components/shared/message-list'
import { AdminMessageForm } from './_components/admin-message-form'
import { getReportById } from '@/_data-access/admin/report.query'
import { getAllDepartments } from '@/_data-access/admin/department.repository'

export default async function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('ReportDetails')
  const { id } = await params
  const [report, departments, user] = await Promise.all([
    getReportById(id),
    getAllDepartments(),
    getCurrentUser(),
  ])

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <div className="print-only dossier-header">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">{t('dossierTitle')}</h1>
          <p className="text-muted-foreground text-xs">{t('systemName')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{t('confidential')}</p>
          <p className="text-[10px]">{formatCompactDateTime(new Date())}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold lg:text-3xl">
            {t('reportNumber', { code: report.trackingCode })}
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            {t('downloadPdf')}
          </Button>
          <ForwardReportForm reportId={report.id} departments={departments} />
          <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
        </div>
      </div>

      <ReportCard report={report} showStatus={false}>
        <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{t('lastUpdate')}</p>
            <p className="text-sm">{formatCompactDateTime(report.updatedAt)}</p>
          </div>
          {report.assignedTo && (
            <div>
              <p className="text-muted-foreground text-sm font-medium">{t('responsible')}</p>
              <p className="text-sm">{report.assignedTo.name}</p>
            </div>
          )}
          {report.assignedDepartment && (
            <div>
              <p className="text-muted-foreground text-sm font-medium">{t('department')}</p>
              <div className="text-primary flex items-center gap-1 text-sm font-semibold">
                <Building2 className="h-3 w-3" />
                {report.assignedDepartment.name}
              </div>
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
        <InvestigationNotes
          reportId={report.id}
          notes={report.investigationNotes}
          currentUser={user}
        />
      </div>

      {/* Communication Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">{t('communicationTitle')}</h2>
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
