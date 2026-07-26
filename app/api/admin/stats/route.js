/**
 * Admin Statistics API  –  GET /api/admin/stats
 * ================================================
 * Returns platform-wide analytics for admin users.
 * Uses MongoDB aggregation pipelines for efficient
 * server-side computation.
 *
 * Security: Requires authenticated user with role='admin'.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Resume from '@/lib/models/Resume';
import InterviewSession from '@/lib/models/InterviewSession';

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

    await connectDB();

    // 2. Run all aggregate queries in parallel
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalResumes,
      totalInterviews,
      resumeScoreAgg,
      interviewScoreAgg,
      recentUsers,
      categoryAgg,
      statusBreakdown,
    ] = await Promise.all([
      // Total registered users
      User.countDocuments(),

      // Total resumes uploaded
      Resume.countDocuments(),

      // Total interview sessions
      InterviewSession.countDocuments(),

      // Average resume score (only analyzed resumes)
      Resume.aggregate([
        { $match: { status: 'analyzed', score: { $ne: null } } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' },
          },
        },
      ]),

      // Average interview score (only completed sessions)
      InterviewSession.aggregate([
        { $match: { status: 'completed', overallScore: { $ne: null } } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$overallScore' },
            maxScore: { $max: '$overallScore' },
            minScore: { $min: '$overallScore' },
          },
        },
      ]),

      // Users joined in last 7 days
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // Most popular interview categories
      InterviewSession.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgScore: { $avg: '$overallScore' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            category: '$_id',
            count: 1,
            avgScore: { $round: ['$avgScore', 1] },
            _id: 0,
          },
        },
      ]),

      // Resume status breakdown
      Resume.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    // 3. Compile stats
    const stats = {
      users: {
        total: totalUsers,
        newLast7Days: recentUsers,
      },
      resumes: {
        total: totalResumes,
        averageScore: resumeScoreAgg[0]
          ? Math.round(resumeScoreAgg[0].avgScore * 10) / 10
          : 0,
        maxScore: resumeScoreAgg[0]?.maxScore || 0,
        minScore: resumeScoreAgg[0]?.minScore || 0,
        statusBreakdown: statusBreakdown.reduce((acc, s) => {
          acc[s.status] = s.count;
          return acc;
        }, {}),
      },
      interviews: {
        total: totalInterviews,
        averageScore: interviewScoreAgg[0]
          ? Math.round(interviewScoreAgg[0].avgScore * 10) / 10
          : 0,
        maxScore: interviewScoreAgg[0]?.maxScore || 0,
        minScore: interviewScoreAgg[0]?.minScore || 0,
        popularCategories: categoryAgg,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[API /admin/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin statistics.' },
      { status: 500 }
    );
  }
}
