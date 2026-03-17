'use client'

import { Button } from '@/_components/ui/button'
import { Printer } from 'lucide-react'

export function AdminPrintButton({ label }: { label: string }) {
  return (
    <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
