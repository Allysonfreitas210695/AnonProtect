import { logger } from '@/_shared/lib/logger'

/**
 * Modo estrito: build de produção, a menos que ALLOW_DEGRADED_SECURITY=true.
 *
 * Em desenvolvimento e nos testes E2E (next dev) é normal rodar sem Redis ou
 * sem Turnstile. Em produção, a falta desses serviços é uma falha de
 * configuração e passa a ser tratada como erro. ALLOW_DEGRADED_SECURITY existe
 * apenas para rodar o build de produção localmente.
 */
export function isStrictSecurityMode(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.ALLOW_DEGRADED_SECURITY !== 'true'
}

export type DegradedComponent = 'ratelimit' | 'turnstile'

/**
 * Registra a degradação de um controle de segurança com um evento de nome fixo.
 * A implantação deve configurar um alerta sobre `event = "security.degraded"`
 * no serviço de logs (Vercel Log Drains, Datadog, CloudWatch etc.); o log
 * sozinho não avisa ninguém.
 */
export function reportSecurityDegraded(
  component: DegradedComponent,
  reason: string,
  context: Record<string, unknown> = {}
): void {
  logger.error({ event: 'security.degraded', component, ...context }, reason)
}
