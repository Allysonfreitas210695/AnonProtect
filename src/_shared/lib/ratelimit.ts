import { createHmac, randomBytes } from 'node:crypto'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import { logger } from '@/_shared/lib/logger'
import { isStrictSecurityMode, reportSecurityDegraded } from '@/_shared/lib/security-mode'

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

let cachedKey: Buffer | null = null

function getRateLimitKey(): Buffer {
  if (cachedKey) return cachedKey

  const secret = process.env.RATE_LIMIT_SECRET
  if (secret && secret.length >= 64 && secret.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(secret)) {
    cachedKey = Buffer.from(secret, 'hex')
    return cachedKey
  }

  if (process.env.AUTH_SECRET) {
    // Separação de domínio: a chave nunca é o AUTH_SECRET cru
    cachedKey = createHmac('sha256', process.env.AUTH_SECRET)
      .update('anonprotect-ratelimit-v1')
      .digest()
    logger.warn('RATE_LIMIT_SECRET ausente ou inválido; derivando chave de AUTH_SECRET')
  } else {
    cachedKey = randomBytes(32)
    logger.warn(
      'RATE_LIMIT_SECRET e AUTH_SECRET ausentes; usando chave aleatória por processo no rate limit'
    )
  }
  return cachedKey
}

/** Transforma o identificador (IP) em HMAC-SHA256 hex antes de sair do processo. */
export function hashIdentifier(identifier: string): string {
  return createHmac('sha256', getRateLimitKey()).update(identifier).digest('hex')
}

type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number }

/**
 * Comportamento quando o Redis não está configurado ou não responde.
 *
 * - 'open': libera a requisição. Usado onde bloquear também causa dano: o canal
 *   de denúncias não pode sair do ar porque o Redis caiu.
 * - 'closed': recusa a requisição. Usado nos alvos de força bruta (login dos
 *   gestores e consulta pelo código de protocolo), em que liberar tentativas
 *   ilimitadas é pior do que deixar o usuário esperar.
 *
 * Nos dois casos a degradação gera o evento `security.degraded` no log, para que
 * a implantação configure um alerta sobre ele (ver security-mode.ts).
 */
type FailMode = 'open' | 'closed'

const OPEN: RateLimitResult = { success: true, limit: 0, remaining: 0, reset: 0 }
const CLOSED: RateLimitResult = { success: false, limit: 0, remaining: 0, reset: 0 }

function createLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string
): Ratelimit | null {
  return redis ? new Ratelimit({ redis, limiter, analytics: false, prefix }) : null
}

async function check(
  name: string,
  limiter: Ratelimit | null,
  failMode: FailMode,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    // Em desenvolvimento, rodar sem Redis é normal. Em produção, é uma falha de
    // configuração e não pode passar em silêncio.
    if (!isStrictSecurityMode()) return OPEN
    reportSecurityDegraded('ratelimit', 'Redis não configurado', { limiter: name, failMode })
    return failMode === 'open' ? OPEN : CLOSED
  }

  try {
    return await limiter.limit(hashIdentifier(identifier))
  } catch (err) {
    reportSecurityDegraded('ratelimit', 'Redis indisponível', { limiter: name, failMode, err })
    return failMode === 'open' ? OPEN : CLOSED
  }
}

/** Envio de denúncias: 10 por IP por hora. Fail-open, para não derrubar o canal. */
export const reportRateLimit = createLimiter(
  Ratelimit.slidingWindow(10, '1 h'),
  'anonprotect_ratelimit'
)

/** @param identifier IP do cliente; é transformado em HMAC antes de sair do processo. */
export async function checkRateLimit(identifier: string) {
  return check('report', reportRateLimit, 'open', identifier)
}

/** Mensagens no chat: 10 por IP por minuto. Fail-open. */
export const messageRateLimit = createLimiter(
  Ratelimit.slidingWindow(10, '1 m'),
  'anonprotect_message_ratelimit'
)

/** @param identifier IP do cliente; é transformado em HMAC antes de sair do processo. */
export async function checkMessageRateLimit(identifier: string) {
  return check('message', messageRateLimit, 'open', identifier)
}

/** URLs de upload: 20 por IP por hora. Fail-open, para não impedir anexos. */
export const uploadRateLimit = createLimiter(
  Ratelimit.slidingWindow(20, '1 h'),
  'anonprotect_upload_ratelimit'
)

/** @param identifier IP do cliente; é transformado em HMAC antes de sair do processo. */
export async function checkUploadRateLimit(identifier: string) {
  return check('upload', uploadRateLimit, 'open', identifier)
}

/**
 * Login dos gestores: 10 tentativas por IP a cada 15 minutos.
 * Fail-closed: sem o limitador, o painel ficaria aberto a força bruta.
 */
export const loginRateLimit = createLimiter(
  Ratelimit.slidingWindow(10, '15 m'),
  'anonprotect_login_ratelimit'
)

/** @param identifier IP do cliente; é transformado em HMAC antes de sair do processo. */
export async function checkLoginRateLimit(identifier: string) {
  return check('login', loginRateLimit, 'closed', identifier)
}

/**
 * Consulta pelo código de protocolo: 20 por IP a cada 10 minutos.
 * Fail-closed: sem o limitador, o código poderia ser procurado por tentativa.
 */
export const trackingRateLimit = createLimiter(
  Ratelimit.slidingWindow(20, '10 m'),
  'anonprotect_tracking_ratelimit'
)

/** @param identifier IP do cliente; é transformado em HMAC antes de sair do processo. */
export async function checkTrackingRateLimit(identifier: string) {
  return check('tracking', trackingRateLimit, 'closed', identifier)
}

/** Usado pela página de status: confirma que o Redis responde, não só que está configurado. */
export async function pingRateLimitStore(): Promise<boolean> {
  if (!redis) return false
  try {
    return (await redis.ping()) === 'PONG'
  } catch {
    return false
  }
}
