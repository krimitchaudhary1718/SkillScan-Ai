/**
 * Admin Users List API  –  GET /api/admin/users
 * ================================================
 * Returns a paginated, searchable list of all platform users
 * along with their usage stats.
 *
 * Query params:
 *  - page   (default: 1)
 *  - limit  (default: 20, max: 100)
 *  - search (optional — searches name and email)
 *
 * Security: Requires authenticated user with role='admin'.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// ── Auth helper ─────────────────────────────────────────────────────
async function getUser(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) return null;
  return {
    id: token.id || token.sub,
    email: token.email,
    role: token.role || 'user',
  };
}

// ── GET handler ─────────────────────────────────────────────────────
export async function GET(request) {
  try {
    // 1. Authenticate & authorize admin
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );
    const search = searchParams.get('search')?.trim() || '';

    await connectDB();

    // 3. Build query filter
    const filter = {};
    if (search) {
      // Escape special regex characters in the search term
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // 4. Execute paginated query & count in parallel
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password') // Never expose passwords
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() returns plain JS objects for better performance

      User.countDocuments(filter),
    ]);

    // 5. Enrich users with computed stats
    const enrichedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      resumeCount: u.resumeCount || 0,
      interviewCount: u.interviewCount || 0,
      totalScore: u.totalScore || 0,
      averageScore:
        u.interviewCount > 0
          ? Math.round((u.totalScore / u.interviewCount) * 10) / 10
          : 0,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    // 6. Return paginated response
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('[API /admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users.' },
      { status: 500 }
    );
  }
}
