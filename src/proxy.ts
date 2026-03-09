import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLogged = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = req.nextUrl.pathname === '/login'

  if (isAdminRoute && !isLogged) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoginRoute && isLogged) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
