'use client'

import React, { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { StatusBadge } from '@/_components/shared/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/_components/ui/table'
import { Checkbox } from '@/_components/ui/checkbox'
import { formatDate } from '@/_utils/formatters'
import { ReportStatus } from '@/_generated/prisma'
import { batchUpdateReportStatusAction } from '@/_actions/admin/report.action'
import { toast } from 'sonner'
import { Loader2, Archive } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Report {
  id: string
  trackingCode: string
  status: ReportStatus
  createdAt: Date
  country: string | null
  city: string | null
  category: { name: string } | null
}

interface ReportsTableClientProps {
  reports: Report[]
}

export function ReportsTableClient({ reports }: ReportsTableClientProps) {
  const t = useTranslations('Admin')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const toggleAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(reports.map((r) => r.id))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleBatchArchive = () => {
    if (selectedIds.length === 0) return

    startTransition(async () => {
      try {
        const result = await batchUpdateReportStatusAction({
          reportIds: selectedIds,
          status: 'ARCHIVED',
        })

        if (result?.data?.success) {
          toast.success(result.data.message)
          setSelectedIds([])
        } else {
          toast.error('Erro ao arquivar denúncias')
        }
      } catch {
        toast.error('Erro de conexão')
      }
    })
  }

  return (
    <div className="relative">
      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="border-primary/20 bg-background/80 fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border px-6 py-3 shadow-2xl backdrop-blur-md"
          >
            <span className="text-foreground text-sm font-bold">
              {selectedIds.length} {selectedIds.length === 1 ? 'selecionada' : 'selecionadas'}
            </span>
            <div className="bg-border h-4 w-px" />
            <Button
              size="sm"
              variant="default"
              className="h-8 gap-2 rounded-full font-bold tracking-wide uppercase"
              onClick={handleBatchArchive}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Archive className="h-3 w-3" />
              )}
              {t('archiveSelected') || 'Arquivar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-muted h-8 rounded-full border-none bg-transparent font-bold tracking-wide uppercase"
              onClick={() => setSelectedIds([])}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[50px] py-4">
                  <Checkbox
                    checked={selectedIds.length === reports.length && reports.length > 0}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-foreground/70 w-[140px] py-4 text-[10px] font-bold tracking-wider uppercase">
                  {t('code')}
                </TableHead>
                <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                  {t('type')}
                </TableHead>
                <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                  Localização
                </TableHead>
                <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                  {t('date')}
                </TableHead>
                <TableHead className="text-foreground/70 py-4 text-[10px] font-bold tracking-wider uppercase">
                  {t('status')}
                </TableHead>
                <TableHead className="text-foreground/70 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-20 text-center">
                    <p className="font-medium">{t('noReports')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => {
                  const isSelected = selectedIds.includes(report.id)
                  return (
                    <TableRow
                      key={report.id}
                      className={`group border-border/40 hover:bg-muted/40 font-medium transition-all ${
                        isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      <TableCell className="py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(report.id)}
                          aria-label={`Select ${report.trackingCode}`}
                        />
                      </TableCell>
                      <TableCell className="text-primary/90 py-4 font-mono text-sm font-black">
                        {report.trackingCode}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-semibold">
                        {report.category?.name || 'Geral'}
                      </TableCell>
                      <TableCell className="py-4 text-xs">
                        {report.country
                          ? `${report.country}${report.city ? `, ${report.city}` : ''}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4 text-xs">
                        {formatDate(report.createdAt)}
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground h-8 transform rounded-lg text-[11px] font-bold tracking-wide uppercase opacity-0 transition-all group-hover:opacity-100 active:scale-95"
                        >
                          <Link href={`/admin/report/${report.id}`}>{t('viewDetails')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
