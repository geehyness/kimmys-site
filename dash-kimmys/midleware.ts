import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isAuth = request.cookies.get('isAuthenticated')?.value === 'true'

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.') || // static files
      isLoginPage) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}