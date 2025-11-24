import { redirect } from 'next/navigation'
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Label } from "@/app/_components/ui/label"

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
    <div className="max-w-md mx-auto my-12 text-center">
      <h1 className="text-3xl font-bold mb-8">Acompanhar Denúncia</h1>
      
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
