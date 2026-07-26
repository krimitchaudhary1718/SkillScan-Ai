/**
 * Middleware — Route Protection
 * =============================
 * Runs on every matched request BEFORE the page renders.
 *
 * Rules:
 *  1. /dashboard/* → Requires authentication (any valid JWT).
 *  2. /admin/*     → Requires authentication AND role === 'admin'.
 *  3. All other routes are public.
 *
 * Uses next-auth/jwt `getToken()` to decode the session JWT
 * directly from the request cookies — no database call needed.
 */

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Decode JWT from cookie (uses NEXTAUTH_SECRET automatically)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Protected: /dashboard/* ─────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      // Preserve the original URL so we can redirect back after sign-in
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
      // Authenticated but not an admin → send to dashboard
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
