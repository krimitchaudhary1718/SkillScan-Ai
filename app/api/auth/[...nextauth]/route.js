/**
 * NextAuth.js v5 (Auth.js) Configuration
 * =======================================
 * Handles authentication for SkillScan AI with:
 *   1. Google OAuth provider
 *   2. Credentials provider (email + bcrypt-hashed password)
 *
 * Session strategy: JWT (stateless, no database sessions)
 *
 * Callbacks:
 *   - signIn:  Creates / updates the user document in MongoDB
 *   - jwt:     Attaches user.id and user.role to the JWT token
 *   - session: Exposes id and role on session.user for client access
 *
 * Environment variables required:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 *   NEXTAUTH_SECRET, MONGODB_URI
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// -------------------------------------------------------------------
// Auth configuration
// -------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ── Providers ──────────────────────────────────────────────────
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Email + Password
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Guard: both fields are required
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();

          // Explicitly select the password field (excluded by default)
          const user = await User.findOne({ email: credentials.email }).select(
            '+password'
          );

          if (!user) {
            throw new Error('No account found with this email');
          }

          // OAuth-only accounts have no password
          if (!user.password) {
            throw new Error(
              'This account uses Google sign-in. Please use Google to log in.'
            );
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Return a plain object (Mongoose docs can't be serialized directly)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          // Re-throw auth errors so NextAuth can surface them
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],

  // ── Session ────────────────────────────────────────────────────
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── JWT ────────────────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,

  // ── Pages ──────────────────────────────────────────────────────
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect errors to sign-in page
  },

  // ── Callbacks ──────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn — Fires for every sign-in attempt.
     * For OAuth providers, upsert the user document in MongoDB.
     */
    async signIn({ user, account }) {
      // Credentials users are already handled in `authorize()`
      if (account?.provider === 'google') {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // Update profile picture if it changed
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }
          } else {
            // First-time Google user — create a document
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'user',
            });
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false; // Block sign-in on DB errors
        }
      }

      return true; // Allow sign-in
    },

    /**
     * jwt — Enrich the token on sign-in with the MongoDB user id & role.
     * On subsequent requests the token already has these fields.
     */
    async jwt({ token, trigger }) {
      if (trigger === 'signIn' || trigger === 'signUp') {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error in JWT callback:', error);
        }
      }

      return token;
    },

    /**
     * session — Copy token fields to the client-visible session object.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});

// -------------------------------------------------------------------
// Export HTTP handlers for the App Router catch-all route
// -------------------------------------------------------------------
export const { GET, POST } = handlers;
