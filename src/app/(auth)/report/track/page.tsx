import { redirect } from 'next/navigation'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Label } from '@/_components/ui/label'

async function trackReport(formData: FormData) {
  'use server'
  const code = formData.get('code') as string
  if (code) {
    redirect(`/report/${code}`)
  }
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="mx-auto my-12 max-w-md text-center">
      <h1 className="mb-8 text-3xl font-bold">Acompanhar Denúncia</h1>

      <Card>
        <CardHeader>
          <CardTitle>Acesso Seguro</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={trackReport} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="code">Código de Acompanhamento</Label>
              <Input
                type="text"
                name="code"
                id="code"
                placeholder="Ex: RPT-X8Y9Z"
                defaultValue={code}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Acessar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
