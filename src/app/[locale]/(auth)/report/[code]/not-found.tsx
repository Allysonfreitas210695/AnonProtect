'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { ShieldAlert, Search, Home } from 'lucide-react'

export default function ReportNotFound() {
  const t = useTranslations('NotFound')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <ShieldAlert className="h-12 w-12" />
      </div>

      <h1 className="mb-4 text-3xl font-black tracking-tight lg:text-4xl">{t('title')}</h1>

      <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">{t('description')}</p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="gap-2">
          <Link href="/report/track">
            <Search className="h-5 w-5" />
            {t('trackAnother')}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-5 w-5" />
            {t('backHome')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
