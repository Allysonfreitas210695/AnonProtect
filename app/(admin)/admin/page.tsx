import Link from 'next/link'
import { Report } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllReports } from '@/lib/data'
import { REPORT_STATUS, STATUS_COLORS, REPORT_TYPES } from '@/lib/constants'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const reports = await getAllReports()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">Denúncias</h1>
          <p className="text-muted-foreground mt-2">Gerencie todas as denúncias recebidas</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma denúncia registrada ainda.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report: Report) => (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-semibold">{report.trackingCode}</TableCell>
                  <TableCell>{REPORT_TYPES[report.type] || report.type}</TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[report.status]}>
                      {REPORT_STATUS[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/report/${report.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
