/**
 * Universal Authentication Helper for NextAuth v5 (Auth.js beta) & NextAuth v4
 * ==============================================================================
 * Reliably retrieves the authenticated user across:
 *  1. NextAuth v5 `auth()` server function (reads request headers/cookies automatically in Node.js API routes).
 *  2. Universal `getToken()` fallback across ALL development (HTTP) and Vercel production (HTTPS) cookies.
 *
 * Resolves Vercel HTTPS cookie naming issues (__Secure-authjs.session-token vs authjs.session-token)
 * and supports both NEXTAUTH_SECRET and AUTH_SECRET environment variables.
 */

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';

/**
 * Universal token decoder for middleware (proxy.js) and API routes.
 * Works cleanly in both Edge Runtime and Node.js Runtime.
 */
export async function getAuthToken(request) {
  if (!request) return null;

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    console.error('[auth-user] ERROR: Missing NEXTAUTH_SECRET and AUTH_SECRET in environment variables');
  }

  const isSecure =
    process.env.NODE_ENV === 'production' ||
    request?.nextUrl?.protocol === 'https:' ||
    request?.url?.startsWith('https:');

  // Known cookie salts across NextAuth v5 (Auth.js) and NextAuth v4
  const possibleSalts = [
    '__Secure-authjs.session-token',
    'authjs.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
    '__Host-authjs.session-token',
    '__Host-next-auth.session-token',
  ];

  for (const salt of possibleSalts) {
    try {
      const token = await getToken({
        req: request,
        secret,
        secureCookie: salt.startsWith('__Secure-') || salt.startsWith('__Host-') || isSecure,
        salt,
      });
      if (token) return token;
    } catch (err) {
      // continue to next salt
    }
  }

  // Dynamic check: inspect actual request cookies if available
  if (request.cookies) {
    const allCookies =
      typeof request.cookies.getAll === 'function'
        ? request.cookies.getAll()
        : [];

    for (const cookie of allCookies) {
      if (cookie.name && cookie.name.includes('session-token')) {
        try {
          const token = await getToken({
            req: request,
            secret,
            secureCookie:
              cookie.name.startsWith('__Secure-') ||
              cookie.name.startsWith('__Host-') ||
              isSecure,
            salt: cookie.name,
          });
          if (token) return token;
        } catch (err) {
          // ignore
        }
      }
    }
  }

  // Final fallback: default getToken behavior
  try {
    const token = await getToken({
      req: request,
      secret,
      secureCookie: isSecure,
    });
    if (token) return token;
  } catch (err) {
    // ignore
  }

  return null;
}

/**
 * Retrieves authenticated user for API routes (GET, POST, etc.).
 * Returns { id, email, name, role, image } or null if unauthenticated.
 */
export async function getAuthUser(request) {
  // 1. Try NextAuth v5 official auth() server session first (best for Node.js API routes)
  try {
    const session = await auth();
    if (session?.user) {
      return {
        id: session.user.id || session.user.sub,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role || 'user',
        image: session.user.image,
      };
    }
  } catch (err) {
    // Fall back to getAuthToken if auth() is unavailable in context
  }

  // 2. Try universal token decoder fallback
  const token = await getAuthToken(request);
  if (!token) return null;

  return {
    id: token.id || token.sub,
    email: token.email,
    name: token.name,
    role: token.role || 'user',
    image: token.picture || token.image,
  };
}
