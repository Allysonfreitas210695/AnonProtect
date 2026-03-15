import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n/request'
import { auth } from '@/_lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'pt-BR',
})

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes check (including locale prefix)
  const isInternal =
    pathname.startsWith('/_next') || pathname.includes('/api/') || pathname.includes('/favicon')

  if (isInternal) return NextResponse.next()

  // Handle i18n routing first
  const response = intlMiddleware(request)

  // If the i18n middleware wants to redirect (e.g., from / to /pt-BR), return it immediately
  if (response.status !== 200 || response.headers.get('x-middleware-rewrite')) {
    return response
  }

  // Auth logic (integration with proxy logic)
  const session = await auth()
  const isLogged = !!session

  // Stripped pathname for easier matching
  const localeMatch = pathname.match(/^\/(pt-BR|en)(\/|$)/)
  const strippedPathname = localeMatch ? pathname.replace(/^\/(pt-BR|en)/, '') || '/' : pathname

  const isPublicRoute =
    strippedPathname === '/' ||
    strippedPathname.startsWith('/login') ||
    strippedPathname.startsWith('/register') ||
    strippedPathname.startsWith('/forgot-password') ||
    strippedPathname.startsWith('/reset-password') ||
    strippedPathname.startsWith('/report')

  if (isPublicRoute) {
    if (
      isLogged &&
      (strippedPathname.startsWith('/login') || strippedPathname.startsWith('/register'))
    ) {
      const locale = localeMatch ? localeMatch[1] : 'pt-BR'
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.nextUrl))
    }
    return response
  }

  if (!isLogged) {
    const locale = localeMatch ? localeMatch[1] : 'pt-BR'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
  }

  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
