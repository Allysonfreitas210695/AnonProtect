import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { TrackForm } from './_components/track-form'

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const t = await getTranslations('Track')
  const { code } = await searchParams

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="from-primary to-primary/60 mb-8 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent">
        {t('title')}
      </h1>

      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{t('accessSecure')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackForm initialCode={code} />
        </CardContent>
      </Card>
    </div>
  )
}
