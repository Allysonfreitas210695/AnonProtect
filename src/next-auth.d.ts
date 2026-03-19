import { UserRole } from '@/_generated/prisma'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role: UserRole
    country?: string | null
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      country?: string | null
    } & import('next-auth').DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    country?: string | null
  }
}
