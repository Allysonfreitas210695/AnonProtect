import { getSystemStatus } from '@/_lib/system-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Activity,
  Server,
  Database,
  Brain,
  Shield,
  Mail,
  Box,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatusPage() {
  const statuses = await getSystemStatus()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case 'unavailable':
        return <XCircle className="text-destructive h-5 w-5" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'not_configured':
        return <HelpCircle className="text-muted-foreground h-5 w-5" />
      default:
        return <AlertCircle className="text-muted-foreground h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
            Saudável
          </Badge>
        )
      case 'unavailable':
        return <Badge variant="destructive">Indisponível</Badge>
      case 'degraded':
        return (
          <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
            Instável
          </Badge>
        )
      case 'not_configured':
        return <Badge variant="secondary">Não Configurado</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getServiceIcon = (name: string) => {
    if (name.includes('Database')) return <Database className="h-5 w-5" />
    if (name.includes('AI')) return <Brain className="h-5 w-5" />
    if (name.includes('Rate')) return <Activity className="h-5 w-5" />
    if (name.includes('Storage')) return <Box className="h-5 w-5" />
    if (name.includes('Email')) return <Mail className="h-5 w-5" />
    if (name.includes('Protection')) return <Shield className="h-5 w-5" />
    return <Server className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Status do Sistema</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real dos serviços externos e infraestrutura.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((service) => (
          <Card
            key={service.name}
            className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md"
          >
            <CardHeader className="bg-muted/30 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-background text-primary rounded-lg p-2 shadow-xs">
                  {getServiceIcon(service.name)}
                </div>
                <CardTitle className="text-sm font-bold tracking-wider uppercase opacity-80">
                  {service.name.split(' (')[0]}
                </CardTitle>
              </div>
              {getStatusIcon(service.status)}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    Status
                  </span>
                  {getStatusBadge(service.status)}
                </div>

                {service.latency !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                      Latência
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-500">
                      {service.latency}ms
                    </span>
                  </div>
                )}

                <div className="text-muted-foreground bg-muted/20 border-border/40 mt-2 rounded-md border p-2 text-xs leading-relaxed italic">
                  {service.message || 'Sem informações adicionais.'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="from-primary/5 border-none bg-linear-to-br to-transparent shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Informações Adicionais</CardTitle>
          <CardDescription>
            Este painel verifica a conectividade básica com as APIs externas configuradas no arquivo
            de ambiente (`.env`).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-bold">
                <Shield className="text-primary h-4 w-4" /> Segurança
              </h4>
              <p className="text-muted-foreground text-xs">
                Turnstile e Rate Limiting são críticos para prevenir abusos no formulário de
                denúncia.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-bold">
                <Brain className="text-primary h-4 w-4" /> Inteligência Artifical
              </h4>
              <p className="text-muted-foreground text-xs">
                O Gemini é opcional; se indisponível, as denúncias serão processadas sem
                categorização automática.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
