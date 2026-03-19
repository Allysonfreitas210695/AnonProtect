import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Home } from 'lucide-react'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'
import { getTranslations } from 'next-intl/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tNav = await getTranslations('Navigation')
  const tFooter = await getTranslations('Footer')
  const tReportLayout = await getTranslations('ReportLayout')

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 shadow-md backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size={36} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    {tNav('home')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">{tNav('admin')}</Link>
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-background/80 mt-auto py-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-2 font-semibold">{tReportLayout('about')}</h3>
              <p className="text-muted-foreground text-sm">{tReportLayout('aboutDesc')}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">{tReportLayout('privacy')}</h3>
              <p className="text-muted-foreground text-sm">{tReportLayout('privacyDesc')}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">{tFooter('trust')}</h3>
              <p className="text-muted-foreground text-sm">{tReportLayout('anonymityDesc')}</p>
            </div>
          </div>
          <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            <p>{tFooter('rights', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
