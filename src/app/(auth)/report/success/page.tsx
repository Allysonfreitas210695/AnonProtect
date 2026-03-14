import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/_components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>
}) {
  const { code } = await searchParams

  return (
    <div className="mx-auto my-12 max-w-xl text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-success/10 p-4 ring-1 ring-success/20">
          <CheckCircle2 className="h-16 w-16 text-success" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Denúncia Enviada!
      </h1>
      <p className="text-muted-foreground mx-auto max-w-md text-base sm:text-lg">
        Sua ocorrência foi registrada com sucesso e nossa equipe já foi notificada.
      </p>

      <Card className="border-border/50 bg-card/50 my-8 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Seu Código de Acompanhamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-primary font-mono text-4xl font-bold tracking-[0.3em] lg:text-5xl">
            {code}
          </div>
        </CardContent>
      </Card>

      <Alert
        className="mb-8 border-warning/20 bg-warning/10 text-left text-foreground/90"
      >
        <AlertTitle className="flex items-center gap-2 font-bold text-warning">
          IMPORTANTE
        </AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          Guarde este código em um local seguro. Ele é a sua **única identidade** para 
          acompanhar o progresso e responder mensagens anonimamente.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/">Voltar ao Início</Link>
        </Button>
        <Button asChild>
          <Link href={`/report/track?code=${code}`}>Acompanhar Agora</Link>
        </Button>
      </div>
    </div>
  )
}
