import { Shield, Lock, Brain, MessageSquare, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Link } from '@/i18n/navigation'

export default function HowItWorksPage() {
  const t = useTranslations('HowItWorks')

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 lg:py-20">
      <header className="space-y-4 text-center">
        <h1 className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg lg:text-xl">
          {t('subtitle')}
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg" className="px-8">
            <Link href="/report/new">
              <MessageSquare className="mr-2 h-5 w-5" />
              {t('ctaReport')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/">{t('ctaBackHome')}</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        <Card className="bg-card/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
              <Shield className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold">{t('step1Title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-center text-sm leading-relaxed">
            {t('step1Description')}
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold">{t('step2Title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-center text-sm leading-relaxed">
            {t('step2Description')}
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
              <Brain className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold">{t('step3Title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-center text-sm leading-relaxed">
            {t('step3Description')}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <Card className="bg-primary/5 border-primary/30 shadow-2xl">
          <CardHeader className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <EyeOff className="text-primary h-5 w-5" />
            </div>
            <CardTitle className="text-base font-bold">{t('anonymityTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p className="text-muted-foreground">{t('anonymityIntro')}</p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5">
              <li>{t('anonymityItem1')}</li>
              <li>{t('anonymityItem2')}</li>
              <li>{t('anonymityItem3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/40 shadow-xl">
          <CardHeader className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Brain className="text-primary h-5 w-5" />
            </div>
            <CardTitle className="text-base font-bold">{t('aiUsageTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>{t('aiUsageIntro')}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t('aiUsageItem1')}</li>
              <li>{t('aiUsageItem2')}</li>
              <li>{t('aiUsageItem3')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-muted/40 border-none shadow-inner">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold">{t('readyTitle')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('readyDescription')}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/report/new">{t('readyCtaNew')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/report/track">{t('readyCtaTrack')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
