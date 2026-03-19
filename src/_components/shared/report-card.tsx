import { useTranslations } from 'next-intl'
import { ReportWithCategory } from '@/_schemas/report'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { formatDate } from '@/_shared/utils/formatters'
import { StatusBadge } from '@/_components/shared/status-badge'

interface ReportCardProps {
  report: ReportWithCategory
  showStatus?: boolean
  showCategory?: boolean
  showDate?: boolean
  children?: React.ReactNode
}

export function ReportCard({
  report,
  showStatus = true,
  showCategory = true,
  showDate = true,
  children,
}: ReportCardProps) {
  const t = useTranslations('ReportCard')

  return (
    <Card className="bg-card/40 ring-border/50 relative overflow-hidden border-none shadow-sm ring-1 backdrop-blur-md transition-all duration-300 hover:shadow-lg print:bg-white print:shadow-none print:ring-0">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-foreground text-2xl font-black tracking-tighter lg:text-3xl">
            {t('title', { code: report.trackingCode })}
          </CardTitle>
          {showStatus && (
            <div className="print:hidden">
              <StatusBadge status={report.status} className="shadow-sm" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {showCategory && (
            <div className="group">
              <p className="text-muted-foreground group-hover:text-primary mb-1.5 text-[10px] font-black tracking-widest uppercase transition-colors print:text-black">
                {t('category')}
              </p>
              <p className="text-primary text-xl font-extrabold tracking-tight print:text-black">
                {report.category?.name || t('notInformed')}
              </p>
            </div>
          )}
          {showDate && (
            <div className="group">
              <p className="text-muted-foreground group-hover:text-primary mb-1.5 text-[10px] font-black tracking-widest uppercase transition-colors print:text-black">
                {t('creationDate')}
              </p>
              <p className="text-xl font-bold tracking-tight print:text-black">
                {formatDate(report.createdAt)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted/30 ring-border/30 hover:bg-muted/40 relative overflow-hidden rounded-2xl p-6 ring-1 transition-all print:bg-white print:p-0 print:ring-0">
          <p className="text-muted-foreground mb-3 text-[10px] font-black tracking-widest uppercase print:text-black">
            {t('description')}
          </p>
          <p className="text-foreground/90 text-md leading-relaxed font-medium whitespace-pre-wrap print:text-black">
            {report.description}
          </p>
          <div className="bg-primary/20 absolute top-0 left-0 h-full w-1 opacity-50 print:hidden" />
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
