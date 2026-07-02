import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/_components/ui/alert'
import { Card, CardContent } from '@/_components/ui/card'
import { ShieldCheck, Home, Search, Sparkles } from 'lucide-react'
import { TrackingQrCode } from '@/_components/shared/tracking-qr-code'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>
}) {
  const t = await getTranslations('Success')
  const { code } = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="relative mx-auto my-12 max-w-2xl px-4 text-center">
      <div className="bg-success/5 absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl" />

      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="bg-success/20 absolute inset-0 animate-ping rounded-full" />
          <div className="bg-success/10 relative rounded-full p-5 shadow-lg">
            <ShieldCheck className="text-success h-16 w-16" />
          </div>
        </div>
      </div>

      <h1 className="text-foreground mb-4 text-4xl font-black tracking-tight sm:text-5xl">
        {t('title')}
      </h1>
      <p className="text-muted-foreground mx-auto max-w-lg text-lg font-medium sm:text-xl">
        {t('message')}
      </p>

      <Card className="bg-card/40 my-10 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="bg-primary/5 py-3">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
            {t('trackingCodeLabel')}
          </p>
        </div>
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="group relative inline-flex items-center gap-4">
              <div className="text-primary font-mono text-4xl font-black tracking-[0.2em] drop-shadow-sm sm:text-5xl">
                {code}
              </div>
            </div>
            <div className="border-border/50 sm:border-l sm:pl-6">
              <TrackingQrCode trackingCode={code} baseUrl={baseUrl} />
            </div>
          </div>
        </CardContent>
        <div className="bg-muted/30 flex justify-center py-4">
          <p className="text-muted-foreground text-xs">{t('securitySignature')}</p>
        </div>
      </Card>

      <Alert className="bg-warning/5 mb-6 text-left shadow-lg">
        <AlertTitle className="text-warning mb-2 flex items-center gap-2 font-black">
          {t('actionNecessary')}
        </AlertTitle>
        <AlertDescription className="text-foreground/80 text-sm leading-relaxed font-medium">
          {t('securityWarning')}
        </AlertDescription>
      </Alert>

      {/* Background AI Analysis Status */}
      <div className="bg-primary/5 mb-10 overflow-hidden rounded-2xl border border-dashed p-6 text-left">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="text-primary h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold tracking-tight uppercase">{t('aiAnalysisStatus')}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              {t('aiAnalysisPending')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button asChild variant="outline" size="lg" className="h-12 px-8 font-bold">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            {t('backToHome')}
          </Link>
        </Button>
        <Button asChild size="lg" className="shadow-primary/20 h-12 px-8 font-bold shadow-lg">
          <Link href={`/report/track?code=${code}`}>
            <Search className="mr-2 h-4 w-4" />
            {t('trackNow')}
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground/60 mt-12 text-[10px] font-medium tracking-tighter uppercase">
        {t('encryptionInfo')}
      </p>
    </div>
  )
}
