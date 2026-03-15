import { auth } from '@/_lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()
  const isLogged = !!session

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname.startsWith('/report') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)$/.test(pathname)

  if (isPublicRoute) {
    if (isLogged && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/admin', request.nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLogged) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
