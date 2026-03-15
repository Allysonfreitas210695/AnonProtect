import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/_components/ui/alert'
import { Card, CardContent } from '@/_components/ui/card'
import { ShieldCheck, Home, Search } from 'lucide-react'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>
}) {
  const t = await getTranslations('Success')
  const { code } = await searchParams

  return (
    <div className="relative mx-auto my-12 max-w-2xl px-4 text-center">
      <div className="bg-success/5 absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl" />

      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="bg-success/20 absolute inset-0 animate-ping rounded-full" />
          <div className="bg-success/10 ring-success/30 relative rounded-full p-5 shadow-lg ring-1">
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

      <Card className="border-border/40 bg-card/40 ring-border/50 my-10 overflow-hidden shadow-2xl ring-1 backdrop-blur-md">
        <div className="bg-primary/5 border-border/40 border-b py-3">
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
            {t('trackingCodeLabel')}
          </p>
        </div>
        <CardContent className="py-10">
          <div className="group relative inline-flex items-center gap-4">
            <div className="text-primary font-mono text-4xl font-black tracking-[0.2em] drop-shadow-sm sm:text-6xl">
              {code}
            </div>
          </div>
        </CardContent>
        <div className="bg-muted/30 border-border/40 flex justify-center border-t py-4">
          <p className="text-muted-foreground text-xs">{t('securitySignature')}</p>
        </div>
      </Card>

      <Alert className="border-warning/20 bg-warning/5 mb-10 text-left shadow-sm">
        <AlertTitle className="text-warning mb-2 flex items-center gap-2 font-black">
          {t('actionNecessary')}
        </AlertTitle>
        <AlertDescription className="text-foreground/80 text-sm leading-relaxed font-medium">
          {t('securityWarning')}
        </AlertDescription>
      </Alert>

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
