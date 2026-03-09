import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'
import { Shield, MessageSquare, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-12">
      <header className="max-w-3xl space-y-6 px-4 text-center">
        <div className="mb-4 flex justify-center">
          <Shield className="text-primary h-20 w-20" />
        </div>
        <h1 className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Canal de Denúncia Anônima
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Seu espaço seguro para reportar irregularidades, bullying ou assédio.
          <span className="text-primary mt-2 block font-semibold">
            Sua identidade é preservada.
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="h-14 px-8 text-lg shadow-lg transition-shadow hover:shadow-xl"
        >
          <Link href="/report/new">
            <MessageSquare className="mr-2 h-5 w-5" />
            Nova Denúncia
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg shadow-md transition-shadow hover:shadow-lg"
        >
          <Link href="/report/track">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Acompanhar Denúncia
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-3xl px-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6" />
              Como funciona?
            </CardTitle>
            <CardDescription className="text-base">
              Processo simples e seguro em 3 passos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                1
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Faça sua denúncia</h3>
                <p className="text-muted-foreground">
                  Preencha o formulário de forma anônima, sem necessidade de cadastro ou
                  identificação.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                2
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Receba seu código</h3>
                <p className="text-muted-foreground">
                  Você receberá um código único e seguro para acompanhar sua denúncia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                3
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Acompanhe e interaja</h3>
                <p className="text-muted-foreground">
                  Veja o status da investigação e converse com a administração mantendo seu
                  anonimato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
