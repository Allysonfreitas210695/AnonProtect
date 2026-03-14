import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/_components/ui/card'
import { Shield, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/_components/shared/logo'

export default function Home() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-12 py-10">
      <header className="max-w-3xl space-y-6 px-4 text-center">
        <div className="mb-4 flex justify-center">
          <Logo
            size={80}
            showText={false}
            className="bg-primary/10 ring-primary/20 rounded-2xl p-4 shadow-xl ring-1"
          />
        </div>
        <h1 className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          Canal de Denúncia Anônima
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg lg:text-xl">
          Seu espaço seguro para reportar irregularidades, bullying ou assédio.
          <span className="text-primary mt-2 block text-base font-semibold lg:text-lg">
            Sua identidade é preservada em todos os níveis.
          </span>
        </p>
      </header>

      <div className="flex w-full max-w-md flex-col justify-center gap-4 px-4 sm:max-w-none sm:flex-row">
        <Button
          asChild
          size="lg"
          className="hover:shadow-primary/20 h-14 px-8 text-lg shadow-lg transition-all hover:-translate-y-1"
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
          className="h-14 px-8 text-lg shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <Link href="/report/track">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Acompanhar Status
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-3xl px-4">
        <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-2xl font-bold">
              <Shield className="h-6 w-6" />
              Como funciona?
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Processo simples e seguro em 3 passos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                1
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Faça sua denúncia</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Preencha o formulário de forma anônima, sem necessidade de cadastro ou
                  identificação pessoal.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                2
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Receba seu código</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Você receberá um código de acompanhamento único. Guarde-o em lugar seguro.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-5">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-md transition-transform group-hover:scale-110">
                3
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Acompanhe e interaja</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verifique o progresso da sua denúncia e troque mensagens com a equipe responsável
                  de forma anônima.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
