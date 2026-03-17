import { RateLimitGuard } from '@/_components/shared/rate-limit-guard'
import { LoginClient } from './login-client'

export default async function LoginPage() {
  return (
    <RateLimitGuard>
      <LoginClient />
    </RateLimitGuard>
  )
}
