import { createHmac, randomBytes } from 'node:crypto'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import { logger } from '@/_shared/lib/logger'

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

/**
 * Limitador de taxa para submissão de denúncias.
 * Configurado para 10 denúncias por IP por hora, conforme o roadmap.
 */
export const reportRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: false,
      prefix: 'anonprotect_ratelimit',
    })
  : null

/**
 * Verifica se a requisição deve ser limitada.
 *
 * @param {string} identifier - IP do cliente; é transformado em HMAC antes de sair do processo.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkRateLimit(identifier: string) {
  if (!reportRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    return await reportRateLimit.limit(hashIdentifier(identifier))
  } catch (err) {
    logger.error({ err }, 'Rate limit check failed, failing open')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

/**
 * Limitador de taxa dedicado para envio de mensagens no chat.
 * Configurado para 10 mensagens por IP por minuto — generoso para
 * conversas humanas, mas suficiente para barrar flood automatizado.
 */
export const messageRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: false,
      prefix: 'anonprotect_message_ratelimit',
    })
  : null

/**
 * Verifica se o envio de mensagem deve ser limitado.
 *
 * @param {string} identifier - IP do cliente; é transformado em HMAC antes de sair do processo.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkMessageRateLimit(identifier: string) {
  if (!messageRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    return await messageRateLimit.limit(hashIdentifier(identifier))
  } catch (err) {
    logger.error({ err }, 'Rate limit check failed, failing open')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

/**
 * Limitador de taxa dedicado para geração de URLs de upload (presigned URLs).
 * Configurado para 20 uploads por IP por hora — generoso para o envio de
 * múltiplos anexos em uma denúncia, mas suficiente para barrar abuso
 * automatizado de preenchimento do bucket S3.
 */
export const uploadRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: false,
      prefix: 'anonprotect_upload_ratelimit',
    })
  : null

/**
 * Verifica se a geração de URL de upload deve ser limitada.
 *
 * @param {string} identifier - IP do cliente; é transformado em HMAC antes de sair do processo.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkUploadRateLimit(identifier: string) {
  if (!uploadRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    return await uploadRateLimit.limit(hashIdentifier(identifier))
  } catch (err) {
    logger.error({ err }, 'Rate limit check failed, failing open')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

/**
 * Limitador de taxa dedicado para tentativas de login com credenciais.
 * Configurado para 10 tentativas por IP a cada 15 minutos — suficiente
 * para barrar ataques de força bruta contra o provedor Credentials.
 */
export const loginRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      analytics: false,
      prefix: 'anonprotect_login_ratelimit',
    })
  : null

/**
 * Verifica se a tentativa de login deve ser limitada.
 *
 * @param {string} identifier - IP do cliente; é transformado em HMAC antes de sair do processo.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkLoginRateLimit(identifier: string) {
  if (!loginRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    return await loginRateLimit.limit(hashIdentifier(identifier))
  } catch (err) {
    logger.error({ err }, 'Rate limit check failed, failing open')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

/**
 * Limitador de taxa dedicado para consulta pelo código de rastreamento.
 * Configurado para 20 consultas por IP a cada 10 minutos — fecha o
 * oráculo de enumeração sem Redis configurado (analytics desligado
 * para não registrar o código em claro em nenhum painel externo).
 */
export const trackingRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, '10 m'),
      analytics: false,
      prefix: 'anonprotect_tracking_ratelimit',
    })
  : null

/**
 * Verifica se a consulta pelo código de rastreamento deve ser limitada.
 *
 * @param {string} identifier - IP do cliente; é transformado em HMAC antes de sair do processo.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkTrackingRateLimit(identifier: string) {
  if (!trackingRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    return await trackingRateLimit.limit(hashIdentifier(identifier))
  } catch (err) {
    logger.error({ err }, 'Rate limit check failed, failing open')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}
