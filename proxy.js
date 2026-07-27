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
 * Uses universal getAuthToken helper from lib/auth-user to support
 * Vercel production HTTPS (__Secure-authjs.session-token) and HTTP dev.
 */

import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth-user';

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
