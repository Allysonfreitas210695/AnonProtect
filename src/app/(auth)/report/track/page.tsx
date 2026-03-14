import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { TrackForm } from './_components/track-form'

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="mx-auto px-4 py-12 max-w-md text-center">
      <h1 className="mb-8 text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Acompanhar Denúncia
      </h1>

      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Acesso Seguro</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackForm initialCode={code} />
        </CardContent>
      </Card>
    </div>
  )
}
