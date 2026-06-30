import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import {
  Scale,
  AlertTriangle,
  ShieldCheck,
  ScrollText,
  FileText,
  Lock,
  Info,
  Mail,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'

export default function TermsOfServicePage() {
  const t = useTranslations('Compliance.terms')
  const commonT = useTranslations('Compliance')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
      <div className="mb-12 space-y-4 text-center">
        <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
          <Scale className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('intro')}</p>
      </div>

      <div className="grid gap-8">
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldCheck className="text-primary h-5 w-5" />
              {t('responsibility')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('responsibilityDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="text-warning h-5 w-5" />
              {t('prohibitions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('prohibitionsDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ScrollText className="text-primary h-5 w-5" />
              {t('anonymity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('anonymityDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="text-primary h-5 w-5" />
              {t('object')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('objectDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="text-primary h-5 w-5" />
              {t('lgpd')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('lgpdDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Info className="text-primary h-5 w-5" />
              {t('limitation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('limitationDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="text-primary h-5 w-5" />
              {t('contact')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('contactDesc')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center border-t pt-8">
        <Button asChild variant="ghost" className="rounded-full px-8">
          <Link href="/">{commonT('back')}</Link>
        </Button>
      </div>
    </div>
  )
}
