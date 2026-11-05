'use client'

import { useTranslations } from 'next-intl'
import { ReportWithCategory } from '@/_schemas/report'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { formatDate } from '@/_shared/utils/formatters'
import { StatusBadge } from '@/_components/shared/status-badge'
import { ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

// Visão do painel: o relato original nunca chega ao componente
export type AdminReportCardData = Omit<ReportWithCategory, 'description'>

type ReportCardProps = (
  | { variant: 'admin'; report: AdminReportCardData; pendingAction?: React.ReactNode }
  | { variant?: 'whistleblower'; report: ReportWithCategory; pendingAction?: never }
) & {
  showStatus?: boolean
  showCategory?: boolean
  showDate?: boolean
  children?: React.ReactNode
}

export function ReportCard({
  report,
  variant = 'whistleblower',
  pendingAction,
  showStatus = true,
  showCategory = true,
  showDate = true,
  children,
}: ReportCardProps) {
  const t = useTranslations('ReportCard')
  const [showOriginal, setShowOriginal] = useState(false)

  const isAdmin = variant === 'admin'
  const original = 'description' in report ? report.description : null
  const hasRedaction = !!report.redactedDescription
  const canToggle = !isAdmin && hasRedaction
  const isPending = isAdmin && !hasRedaction
  const displayDescription =
    canToggle && showOriginal ? original : report.redactedDescription || (isAdmin ? null : original)

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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase print:text-black">
              {t('description')}
            </p>
            {hasRedaction && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  {t('protectedByLgpd')}
                </div>
                {canToggle && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-[10px] font-bold uppercase transition-colors print:hidden"
                  >
                    {showOriginal ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        {t('hideOriginal')}
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        {t('showOriginal')}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          {isPending ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                {t('pendingAnonymization')}
              </div>
              <p className="text-muted-foreground text-sm">{t('pendingAnonymizationHint')}</p>
              <div className="print:hidden">{pendingAction}</div>
            </div>
          ) : (
            <p className="text-foreground/90 text-md leading-relaxed font-medium whitespace-pre-wrap print:text-black">
              {displayDescription}
            </p>
          )}
          <div className="bg-primary/20 absolute top-0 left-0 h-full w-1 opacity-50 print:hidden" />
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
