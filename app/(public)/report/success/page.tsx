import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="max-w-xl mx-auto my-12 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="h-24 w-24 text-green-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Denúncia Enviada com Sucesso</h1>
      <p className="text-muted-foreground mb-8">
        Sua denúncia foi recebida e será analisada pela administração.
      </p>

      <Card className="mb-8 border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Seu Código de Acompanhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-mono font-bold text-primary tracking-widest">
            {code}
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive" className="mb-8 text-left bg-orange-50 border-orange-200 text-orange-900 [&>svg]:text-orange-900">
        <AlertTitle>IMPORTANTE</AlertTitle>
        <AlertDescription>
          Guarde este código com segurança. Ele é a única forma de acompanhar o status da sua denúncia e responder a solicitações de mais informações, mantendo seu anonimato.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/">
            Voltar ao Início
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/report/track?code=${code}`}>
            Acompanhar Agora
          </Link>
        </Button>
      </div>
    </div>
  )
}
