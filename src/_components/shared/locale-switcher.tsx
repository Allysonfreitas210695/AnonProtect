'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/_components/ui/dropdown-menu'
import { Button } from '@/_components/ui/button'
import { Languages } from 'lucide-react'
import { locales } from '@/i18n/request'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const onLocaleChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={t('label')}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((cur) => (
          <DropdownMenuItem
            key={cur}
            onClick={() => onLocaleChange(cur)}
            className={locale === cur ? 'font-bold' : ''}
          >
            {t(cur)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
