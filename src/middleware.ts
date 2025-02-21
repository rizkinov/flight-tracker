import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login']
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(pathname)

  // If there's no auth cookie and the path is not public, redirect to login
  if (!authCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If there's an auth cookie and the user is trying to access a public path
  if (authCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/flights/:path*']
} 