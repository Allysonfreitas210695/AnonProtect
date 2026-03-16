import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'
import { Shield, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/_components/shared/logo'
import { ThemeToggle } from '@/_components/shared/theme-toggle'
import { LocaleSwitcher } from '@/_components/shared/locale-switcher'

export default function Home() {
  const t = useTranslations('Home')

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center gap-12 py-10">
      <div className="absolute top-4 right-4 flex items-center gap-2 lg:top-8 lg:right-8">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
      <header className="max-w-3xl space-y-6 px-4 text-center">
        <div className="mb-4 flex justify-center">
          <Logo size={80} showText={false} className="bg-primary/10 rounded-2xl p-4 shadow-xl" />
        </div>
        <h1 className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg lg:text-xl">
          {t('description')}
          <span className="text-primary mt-2 block text-base font-semibold lg:text-lg">
            {t('identitySafety')}
          </span>
        </p>
      </header>

      <div className="flex w-full max-w-md flex-col justify-center gap-4 px-4 sm:max-w-none sm:flex-row">
        <Button
          asChild
          size="lg"
          className="hover:shadow-primary/20 h-14 px-8 text-lg shadow-lg transition-all hover:-translate-y-1"
        >
          <Link href="/report/new">
            <MessageSquare className="mr-2 h-5 w-5" />
            {t('newReport')}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <Link href="/report/track">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {t('trackStatus')}
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-3xl px-4">
        <Card className="bg-card/50 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-2xl font-bold">
              <Shield className="h-6 w-6" />
              {t('howItWorks')}
            </CardTitle>
            <CardDescription className="text-base font-medium">
              {t('simpleProcess')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                1
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">{t('step1.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('step1.description')}</p>
              </div>
            </div>

            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                2
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">{t('step2.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('step2.description')}</p>
              </div>
            </div>

            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                3
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">{t('step3.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('step3.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="bg-muted/20 mt-20 w-full py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2 space-y-4">
              <Logo size={40} className="opacity-80 grayscale transition-all hover:grayscale-0" />
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                AnonProtect é a plataforma líder em denúncias anônimas corporativas e
                institucionais. Garantimos total sigilo e proteção para quem reporta.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black tracking-widest uppercase opacity-50">
                Links Legais
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black tracking-widest uppercase opacity-50">
                Confiança
              </h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link
                    href="/transparency"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Transparência
                  </Link>
                </li>
                <li>
                  <div className="text-primary flex items-center gap-2">
                    <Shield className="h-4 w-4" /> <span>Hospedagem Blindada</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-xs font-medium opacity-50">
            © {new Date().getFullYear()} AnonProtect Security Solutions. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
