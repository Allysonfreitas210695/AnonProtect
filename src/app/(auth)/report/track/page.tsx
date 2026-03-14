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
    <div className="mx-auto px-4 py-12 max-w-md text-center">
      <h1 className="mb-8 text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Acompanhar Denúncia
      </h1>

      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Acesso Seguro</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={trackReport} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="code" className="text-sm font-medium">Código de Acompanhamento</Label>
              <Input
                type="text"
                name="code"
                id="code"
                placeholder="Ex: RPT-X8Y9Z"
                defaultValue={code}
                required
                className="h-11 font-mono uppercase"
              />
              <p className="text-[10px] text-muted-foreground">
                Informe o código de 8 caracteres que você recebeu ao enviar a denúncia.
              </p>
            </div>
            <Button type="submit" className="w-full h-11 text-base shadow-sm">
              Acessar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
