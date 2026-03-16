import { getPublicStats } from '@/_data-access/public/transparency.query'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Shield, BarChart3, CheckCircle2 } from 'lucide-react'
import {
  PublicStatusChart,
  PublicCategoryChart,
  PublicTimelineChart,
} from './_components/transparency-charts'
import { Link } from '@/i18n/navigation'
import { Button } from '@/_components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache por 1 hora

export default async function TransparencyPage() {
  const stats = await getPublicStats()

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 lg:py-20">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          Transparência
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg lg:text-xl">
          O compromisso da AnonProtect com a ética e a abertura. Acompanhe o impacto e o volume de
          denúncias processadas pelo nosso sistema.
        </p>
        <div className="flex justify-center pt-4">
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-border/50 bg-primary/5 ring-primary/20 shadow-2xl ring-1 transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-primary text-sm font-bold tracking-wider uppercase">
              Total de Denúncias
            </CardTitle>
            <BarChart3 className="text-primary h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{stats.totalReports}</div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Relatos recebidos anonimamente desde o início
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-success/5 ring-success/20 shadow-2xl ring-1 transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-success text-sm font-bold tracking-wider uppercase">
              Casos Resolvidos
            </CardTitle>
            <CheckCircle2 className="text-success h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{stats.resolvedReports}</div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Denúncias que foram concluídas e verificadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-10 md:grid-cols-2">
        <PublicStatusChart data={stats.statusStats} />
        <PublicCategoryChart data={stats.categoryStats} />
      </div>

      <PublicTimelineChart data={stats.timelineStats} />

      {/* Privacy Notice */}
      <Card className="bg-muted/30 border-none shadow-inner">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
            <Shield className="text-primary h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Privacidade Total</h3>
            <p className="text-muted-foreground text-sm">
              Neste portal, apenas dados agregados e anônimos são exibidos. Nenhuma informação
              individual, relato ou anexo é jamais exposto publicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
