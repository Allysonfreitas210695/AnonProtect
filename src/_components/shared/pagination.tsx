import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (p: number) => {
    const url = new URL(baseUrl, 'http://localhost') // dummy base for URL parsing
    url.searchParams.set('page', p.toString())
    return `${url.pathname}${url.search}`
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={page <= 1}
      >
        <Link href={getPageUrl(page - 1)} aria-disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      
      <div className="text-sm font-medium">
        Página {page} de {totalPages}
      </div>

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={page >= totalPages}
      >
        <Link href={getPageUrl(page + 1)} aria-disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
