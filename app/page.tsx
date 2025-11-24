import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, MessageSquare, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-12">
      <header className="max-w-3xl space-y-6 text-center px-4">
        <div className="flex justify-center mb-4">
          <Shield className="h-20 w-20 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent sm:text-6xl">
          Canal de Denúncia Anônima
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Seu espaço seguro para reportar irregularidades, bullying ou assédio.
          <span className="block mt-2 font-semibold text-primary">Sua identidade é preservada.</span>
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 px-4">
        <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/report/new">
            <MessageSquare className="mr-2 h-5 w-5" />
            Nova Denúncia
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 shadow-md hover:shadow-lg transition-shadow">
          <Link href="/report/track">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Acompanhar Denúncia
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-3xl px-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Como funciona?
            </CardTitle>
            <CardDescription className="text-base">
              Processo simples e seguro em 3 passos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Faça sua denúncia</h3>
                <p className="text-muted-foreground">
                  Preencha o formulário de forma anônima, sem necessidade de cadastro ou identificação.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Receba seu código</h3>
                <p className="text-muted-foreground">
                  Você receberá um código único e seguro para acompanhar sua denúncia.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Acompanhe e interaja</h3>
                <p className="text-muted-foreground">
                  Veja o status da investigação e converse com a administração mantendo seu anonimato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
