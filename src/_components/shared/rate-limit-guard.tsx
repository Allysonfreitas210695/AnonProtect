import { headers } from 'next/headers'
import { checkRateLimit } from '@/_shared/lib/ratelimit'
import { getClientIp } from '@/_shared/lib/get-client-ip'
import { RateLimitError } from './rate-limit-error'
import { ReactNode } from 'react'

interface RateLimitGuardProps {
  children: ReactNode
}

export async function RateLimitGuard({ children }: RateLimitGuardProps) {
  const ip = getClientIp(await headers())
  const { success } = await checkRateLimit(ip)

  if (!success) {
    return <RateLimitError />
  }
  return <>{children}</>
}
