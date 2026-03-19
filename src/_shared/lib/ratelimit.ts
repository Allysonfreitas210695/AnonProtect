import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

/**
 * Limitador de taxa para submissão de denúncias.
 * Configurado para 10 denúncias por IP por hora, conforme o roadmap.
 */
export const reportRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'anonprotect_ratelimit',
    })
  : null

/**
 * Verifica se a requisição deve ser limitada.
 *
 * @param {string} identifier - Geralmente o endereço IP do usuário.
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkRateLimit(identifier: string) {
  if (!reportRateLimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  return await reportRateLimit.limit(identifier)
}
