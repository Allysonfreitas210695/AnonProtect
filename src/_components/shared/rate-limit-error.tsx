import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { ShieldAlert } from 'lucide-react'

export async function RateLimitError() {
  const t = await getTranslations('RateLimit')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="bg-destructive/10 mb-6 rounded-full p-6">
        <ShieldAlert className="text-destructive h-12 w-12" />
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{t('description')}</p>
      <Button asChild size="lg" className="rounded-full">
        <Link href="/">{t('back')}</Link>
      </Button>
    </div>
  )
}
