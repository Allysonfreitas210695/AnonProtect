import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Shield, Lock, EyeOff, FileText } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'

export default function PrivacyPolicyPage() {
  const t = useTranslations('Compliance.privacy')
  const commonT = useTranslations('Compliance')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
      <div className="mb-12 space-y-4 text-center">
        <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
          <Shield className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-muted-foreground text-lg">{t('intro')}</p>
      </div>

      <div className="grid gap-8">
        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <EyeOff className="text-primary h-5 w-5" />
              {t('collection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('collectionDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="text-primary h-5 w-5" />
              {t('usage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('usageDesc')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 ring-border/50 border-none shadow-xl ring-1 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="text-primary h-5 w-5" />
              {t('security')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{t('securityDesc')}</p>
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
