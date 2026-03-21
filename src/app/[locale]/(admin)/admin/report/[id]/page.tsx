import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/_shared/lib/auth'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2 } from 'lucide-react'
import { StatusBadge } from '@/_components/shared/status-badge'
import { Link } from '@/i18n/navigation'
import { formatCompactDateTime, formatDate } from '@/_shared/utils/formatters'
import { ForwardReportForm } from './_components/forward-form'
import { StatusUpdateForm } from './_components/status-form'
import { ReportCard } from '@/_components/shared/report-card'
import { EvidenceGallery } from './_components/evidence-gallery'
import { ActivityTimeline } from './_components/activity-timeline'
import { InvestigationNotes } from './_components/investigation-notes'
import { Card, CardContent } from '@/_components/ui/card'
import { MessageList } from '@/_components/shared/message-list'
import { AdminMessageForm } from './_components/admin-message-form'
import { AdminPrintButton } from './_components/admin-print-button'
import { Logo } from '@/_components/shared/logo'
import { getReportById } from '@/_modules/admin/admin.query'
import { logReportView } from '@/_modules/admin/admin.data'
import { getAllDepartments } from '@/_modules/department/department.query'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function AdminReportPage({ params }: Props) {
  const t = await getTranslations('ReportDetails')
  const tStatus = await getTranslations('Status')
  const { id, locale } = await params

  const user = await getCurrentUser()
  if (!user) notFound()

  const [report, departments] = await Promise.all([getReportById(id), getAllDepartments()])

  if (!report) {
    notFound()
  }

  // LGPD: Log audit trail for viewing sensitive data
  await logReportView(report.id, user.id)

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

      <div className="space-y-8 print:hidden">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/admin/report`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-bold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backButton')}
              </Link>
              <StatusBadge status={report.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminPrintButton label={t('printButton')} />
              <ForwardReportForm reportId={report.id} departments={departments} />
              <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
            </div>
          </div>

          <h1 className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-3xl font-black text-transparent lg:text-4xl">
            {t('dossierTitle')}
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
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

      {/* 
        -------------------------------------------------------------
        PRINT VIEW (Simplified, Robust, No Interactive Components)
        -------------------------------------------------------------
      */}
      <div className="hidden print:block print:w-full print:bg-white print:p-0">
        <header className="mb-10 flex items-center justify-between border-b-4 border-black pb-6">
          <div className="flex-1">
            <div className="mb-2 text-2xl font-black tracking-tighter uppercase">
              Relatório Oficial de Investigação
            </div>
            <div className="text-sm font-bold text-red-600">CONFIDENCIAL - USO INTERNO</div>
          </div>
          <div className="text-right">
            <div className="font-bold">AnonProtect</div>
            <div className="text-xs tracking-widest uppercase opacity-70">Proteção Anônima</div>
          </div>
        </header>

        {/* Report Identification */}
        <section className="mb-8 border-b-2 border-dashed border-gray-200 pb-8">
          <h1 className="mb-4 text-3xl font-black">Denuncia #{report.trackingCode}</h1>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase">Categoría</div>
              <div className="text-lg font-bold">{report.category?.name || 'Não Informada'}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase">Status</div>
              <div className="text-lg font-bold uppercase">{tStatus(report.status)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase">Data de Criação</div>
              <div className="text-lg font-bold">{formatDate(report.createdAt, locale)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-500 uppercase">Departamento</div>
              <div className="text-lg font-bold">
                {report.assignedDepartment?.name || 'Não atribuído'}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 text-[10px] font-black text-gray-500 uppercase">
              Descrição da Ocorrência
            </div>
            <div className="rounded border bg-gray-50/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {report.description}
            </div>
          </div>
        </section>

        {/* Communication History (Always on new page or follows) */}
        <section className="page-break-before-auto mb-8">
          <h2 className="mb-4 border-b pb-2 text-xl font-black">Comunicação com Denunciante</h2>
          {report.messages.length === 0 ? (
            <div className="py-4 text-sm text-gray-500 italic">Nenhuma mensagem trocada.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase">
                    Participante
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase">Horário</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase">Conteúdo</th>
                </tr>
              </thead>
              <tbody>
                {report.messages.map(
                  (msg: { id: string; sender: string; createdAt: Date; content: string }) => (
                    <tr key={msg.id} className="border-b align-top">
                      <td className="px-3 py-3 text-sm font-bold">
                        {msg.sender === 'ADMIN' ? 'ADMINISTRADOR' : 'DENUNCIANTE'}
                      </td>
                      <td className="px-3 py-3 text-sm whitespace-nowrap">
                        {formatCompactDateTime(msg.createdAt)}
                      </td>
                      <td className="px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Activity Timeline */}
        <section className="page-break-before-auto mb-8">
          <h2 className="mb-4 border-b pb-2 text-xl font-black">Histórico de Atividades</h2>
          <table className="w-full border-collapse">
            <tbody>
              {report.activityLogs.map(
                (log: {
                  id: string
                  createdAt: Date
                  description: string
                  user?: { name: string | null } | null
                }) => (
                  <tr key={log.id} className="border-b align-top">
                    <td className="px-1 py-3 text-sm font-bold whitespace-nowrap">
                      {formatCompactDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-bold">{log.description}</div>
                      {log.user && (
                        <div className="text-[10px] opacity-60">Por: {log.user.name}</div>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>

        {/* Investigation Notes */}
        <section className="page-break-before-auto mb-8">
          <h2 className="mb-4 border-b pb-2 text-xl font-black">Notas de Investigação (Interno)</h2>
          {report.investigationNotes.length === 0 ? (
            <div className="py-4 text-sm text-gray-500 italic">
              Nenhuma nota interna registrada.
            </div>
          ) : (
            <div className="space-y-4">
              {report.investigationNotes.map(
                (note: {
                  id: string
                  content: string
                  createdAt: Date
                  author: { name: string | null }
                }) => (
                  <div key={note.id} className="border-l-4 border-black bg-gray-50/50 p-4">
                    <div className="mb-1 text-[10px] font-black uppercase opacity-60">
                      {note.author.name} - {formatCompactDateTime(note.createdAt)}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* Global CSS Force - Absolute Control */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body, html, main, .bg-background { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          .hidden.print\\:block { display: block !important; visibility: visible !important; width: 100% !important; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
          section { page-break-inside: avoid !important; margin-bottom: 2cm !important; }
          @page { size: A4; margin: 1cm; }
          table { width: 100% !important; border-collapse: collapse !important; }
        }
      `,
        }}
      />
    </div>
  )
}
