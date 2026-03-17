import { headers } from 'next/headers'
import { checkRateLimit } from '@/_lib/ratelimit'
import { RateLimitError } from './rate-limit-error'
import { ReactNode } from 'react'

interface RateLimitGuardProps {
  children: ReactNode
}

export async function RateLimitGuard({ children }: RateLimitGuardProps) {
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
  const { success } = await checkRateLimit(ip)

  if (!success) {
    return <RateLimitError />
  }
  return <>{children}</>
}
