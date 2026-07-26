/**
 * MongoDB Connection Singleton
 * ============================
 * Establishes and caches a Mongoose connection to MongoDB.
 * In development, the connection is cached on `globalThis` to survive
 * Next.js hot-reloads without leaking connections.
 *
 * Usage:
 *   import connectDB from '@/lib/mongodb';
 *   await connectDB();
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    '⚠️  MONGODB_URI is not defined. Please add it to your .env.local file.\n' +
    'Example: MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillscan-ai'
  );
}

/**
 * Global cache object — persists across hot reloads in dev.
 * In production each cold start gets a fresh connection.
 */
let cached = globalThis._mongooseCache;

if (!cached) {
  cached = globalThis._mongooseCache = { conn: null, promise: null };
}

/**
 * Connect to MongoDB.
 * Returns the cached Mongoose connection if available, otherwise
 * creates a new one and caches it.
 *
 * @returns {Promise<typeof mongoose>} The Mongoose instance
 */
async function connectDB() {
  // Return the existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no pending connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast instead of buffering when disconnected
      maxPoolSize: 10,       // Connection pool size for concurrent operations
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset the cache so the next call retries
        cached.promise = null;
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
      });
  }

  // Await and cache the resolved connection
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
