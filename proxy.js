/**
 * Middleware — Route Protection (Auth.js v5 / NextAuth v5)
 * =========================================================
 * Runs on every matched request BEFORE the page renders.
 *
 * Rules:
 *  1. /dashboard/* → Requires authentication (any valid JWT).
 *  2. /admin/*     → Requires authentication AND role === 'admin'.
 *  3. All other routes are public.
 *
 * Handles both development (HTTP) and Vercel production (HTTPS) cookie naming:
 *  - __Secure-authjs.session-token (Auth.js v5 HTTPS)
 *  - authjs.session-token (Auth.js v5 HTTP)
 *  - __Secure-next-auth.session-token (legacy HTTPS)
 *  - next-auth.session-token (legacy HTTP)
 */

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

async function getAuthToken(request) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = process.env.NEXTAUTH_SECRET;

  // 1. Try Auth.js v5 production/dev salt and cookie names
  let token = await getToken({
    req: request,
    secret,
    secureCookie: isProduction,
    salt: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
  });

  // 2. Fallback: default getToken behavior
  if (!token) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: isProduction,
    });
  }

  // 3. Fallback: check non-secure salt even in production (in case of proxy SSL termination)
  if (!token) {
    token = await getToken({
      req: request,
      secret,
      salt: 'authjs.session-token',
    });
  }

  // 4. Fallback: legacy NextAuth v4 cookie names
  if (!token) {
    token = await getToken({
      req: request,
      secret,
      salt: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    });
  }

  return token;
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = await getAuthToken(request);

  // ── Protected: /dashboard/* ─────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ── Protected: /admin/* (admin role required) ────────────────
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // All checks passed — continue
  return NextResponse.next();
}

// -------------------------------------------------------------------
// Matcher — only run middleware on these paths (skip API, static, etc.)
// -------------------------------------------------------------------
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
