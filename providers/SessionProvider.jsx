/**
 * Auth Session Provider
 * =====================
 * Client component that wraps the app with NextAuth's SessionProvider.
 * This enables `useSession()` hooks in any client component.
 *
 * Usage in layout.js:
 *   import AuthProvider from '@/providers/SessionProvider';
 *   <AuthProvider>{children}</AuthProvider>
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
