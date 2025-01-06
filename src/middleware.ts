import NextAuth from 'next-auth'
import createIntlMiddleware from 'next-intl/middleware'
import authConfig from './auth.config'
import { routing } from '@/i18n/routing'
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from './routes'

//https://github.com/renanleonel/next-auth-v5-middleware/blob/main/src/middleware.ts
const { auth } = NextAuth(authConfig)

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing)

export default auth(async function middleware(request) {
  const { nextUrl } = request

  // Access auth status from the request object
  const isLoggedIn = !!request.auth
  const isActivated = !!request.auth?.user?.isVerified

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (isActivated) {
    if (!isLoggedIn && !isPublicRoute) {
      let callbackUrl = nextUrl.pathname
      if (nextUrl.search) {
        callbackUrl += nextUrl.search
      }

      const encodedCallbackUrl = encodeURIComponent(callbackUrl)
      return Response.redirect(
        new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      )
    }
  }

  // If no auth redirects, handle internationalization
  return intlMiddleware(request)
})

export const config = {
  matcher: [
    // Auth routes
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
    // Intl routes
    '/(en|fa)/:path*',
  ],
}
