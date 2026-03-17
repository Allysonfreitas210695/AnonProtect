import Link from 'next/link'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'
import { getTranslations } from 'next-intl/server'

export default async function ReportLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('ReportLayout')

  return (
    <div className="bg-background flex min-h-screen flex-col overflow-x-hidden">
      <header className="bg-background/80 sticky top-0 z-50 shadow-xs backdrop-blur-sm dark:border-b dark:shadow-none">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size={36} />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-background/80 mt-auto py-8 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm dark:border-t dark:shadow-none">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-2 font-semibold">{t('about')}</h3>
              <p className="text-muted-foreground text-sm">{t('aboutDesc')}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">{t('privacy')}</h3>
              <p className="text-muted-foreground text-sm">{t('privacyDesc')}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">{t('anonymity')}</h3>
              <p className="text-muted-foreground text-sm">{t('anonymityDesc')}</p>
            </div>
          </div>
          <div className="text-muted-foreground mt-8 pt-8 text-center text-sm opacity-50">
            <p>{t('rights', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
