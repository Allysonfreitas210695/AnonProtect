import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/_lib/auth'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/_components/shared/status-badge'
import { Button } from '@/_components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { formatCompactDateTime, formatDate } from '@/_utils/formatters'
import { ForwardReportForm } from './_components/forward-form'
import { StatusUpdateForm } from './_components/status-form'
import { ReportCard } from '@/_components/shared/report-card'
import { EvidenceGallery } from './_components/evidence-gallery'
import { ActivityTimeline } from './_components/activity-timeline'
import { InvestigationNotes } from './_components/investigation-notes'
import { Card, CardContent, CardTitle, CardHeader } from '@/_components/ui/card'
import { MessageList } from '@/_components/shared/message-list'
import { AdminMessageForm } from './_components/admin-message-form'
import { AdminPrintButton } from './_components/admin-print-button'
import { getReportById } from '@/_data-access/admin/report.query'
import { getAllDepartments } from '@/_data-access/admin/department.repository'
import { Logo } from '@/_components/shared/logo'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function AdminReportPage({ params }: Props) {
  const t = await getTranslations('ReportDetails')
  const { id, locale } = await params
  const [report, departments, user] = await Promise.all([
    getReportById(id),
    getAllDepartments(),
    getCurrentUser(),
  ])

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-8 px-2 pb-10 lg:px-0">
      {/* Official Print Header */}
      <div className="hidden border-b-2 border-black pb-6 print:block">
        <div className="flex items-center justify-between">
          <Logo size={40} />
          <div className="text-right">
            <h1 className="text-xl font-bold uppercase">{t('officialPrintHeader')}</h1>
            <p className="text-sm font-bold text-red-600">{t('confidentialNotice')}</p>
          </div>
        </div>
      </div>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-muted/50 hover:bg-muted h-8 rounded-full border-none px-3"
            >
              <Link href="/admin/report">
                <ArrowLeft className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                <span className="text-xs font-bold tracking-wide uppercase">{t('back')}</span>
              </Link>
            </Button>
            <StatusBadge status={report.status} />
          </div>
          <h1 className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-3xl font-black text-transparent lg:text-4xl">
            {t('dossierTitle')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminPrintButton label={t('printReport')} />
          <ForwardReportForm reportId={report.id} departments={departments} />
          <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Main Info Card */}
          <ReportCard report={report} showStatus={false}>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('submittedAt')}
                </p>
                <p className="text-sm font-bold">
                  {formatDate(report.createdAt, locale, {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('lastUpdate')}
                </p>
                <p className="text-sm font-bold">{formatCompactDateTime(report.updatedAt)}</p>
              </div>
              {report.assignedDepartment && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {t('department')}
                  </p>
                  <div className="text-primary flex items-center gap-1 text-sm font-bold">
                    <Building2 className="h-3 w-3" />
                    {report.assignedDepartment.name}
                  </div>
                </div>
              )}
            </div>
          </ReportCard>

          <section id="evidence">
            <div className="mb-4 flex items-center gap-3 px-1">
              <div className="bg-primary h-6 w-1.5 rounded-full" />
              <h2 className="text-xl font-black tracking-tight">{t('evidence')}</h2>
            </div>
            <EvidenceGallery attachments={report.attachments} />
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section id="activity">
              <div className="mb-4 flex items-center gap-3 px-1">
                <div className="bg-primary h-6 w-1.5 rounded-full" />
                <h2 className="text-xl font-black tracking-tight">{t('activityTimeline')}</h2>
              </div>
              <ActivityTimeline activities={report.activityLogs} />
            </section>

            <section id="notes">
              <div className="mb-4 flex items-center gap-3 px-1">
                <div className="bg-primary h-6 w-1.5 rounded-full" />
                <h2 className="text-xl font-black tracking-tight">{t('investigationNotes')}</h2>
              </div>
              <InvestigationNotes
                reportId={report.id}
                notes={report.investigationNotes}
                currentUser={user}
              />
            </section>
          </div>
        </div>

        <div className="space-y-8">
          <section id="communication" className="lg:sticky lg:top-8">
            <div className="mb-4 flex items-center gap-3 px-1">
              <div className="bg-primary h-6 w-1.5 rounded-full" />
              <h2 className="text-xl font-black tracking-tight">{t('communicationTitle')}</h2>
            </div>
            <Card className="ring-border flex h-[600px] flex-col overflow-hidden border-none shadow-xl ring-1">
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto p-4">
                  <MessageList messages={report.messages} currentUserType="ADMIN" />
                </div>
              </CardContent>
              <div className="bg-muted/30 border-t p-4">
                <AdminMessageForm reportId={report.id} />
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
