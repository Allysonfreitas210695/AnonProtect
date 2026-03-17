import { headers } from 'next/headers'
import { checkRateLimit } from '@/_lib/ratelimit'
import { RateLimitError } from '@/_components/shared/rate-limit-error'
import { LoginClient } from './login-client'

export default async function LoginPage() {
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
  const { success } = await checkRateLimit(ip)

  if (!success) {
    return <RateLimitError />
  }

  return <LoginClient />
}
