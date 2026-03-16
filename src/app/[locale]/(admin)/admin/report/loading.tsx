import { Card } from '@/_components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/_components/ui/table'

export default function ReportsLoading() {
  return (
    <div className="animate-pulse space-y-8 pb-10">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-10 w-64 rounded-md" />
          <div className="bg-muted h-4 w-48 rounded-md" />
        </div>
        <div className="flex gap-3">
          <div className="bg-muted h-10 w-48 rounded-xl" />
          <div className="bg-muted h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="px-2">
        <div className="bg-muted/50 h-9 w-full max-w-2xl rounded-xl" />
      </div>

      <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-none">
              <TableHead className="py-4">
                <div className="bg-muted h-4 w-20 rounded" />
              </TableHead>
              <TableHead className="py-4">
                <div className="bg-muted h-4 w-24 rounded" />
              </TableHead>
              <TableHead className="py-4">
                <div className="bg-muted h-4 w-32 rounded" />
              </TableHead>
              <TableHead className="py-4">
                <div className="bg-muted h-4 w-24 rounded" />
              </TableHead>
              <TableHead className="py-4">
                <div className="bg-muted h-4 w-20 rounded" />
              </TableHead>
              <TableHead className="py-4 text-right">
                <div className="bg-muted ml-auto h-4 w-16 rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRow key={i} className="border-border/40">
                <TableCell className="py-4">
                  <div className="bg-muted h-5 w-24 rounded" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="bg-muted h-5 w-28 rounded" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="bg-muted h-4 w-36 rounded" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="bg-muted h-4 w-24 rounded" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="bg-muted h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="bg-muted ml-auto h-8 w-24 rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
