/**
 * Roadmap Generation API  –  POST /api/roadmap/generate
 * =======================================================
 * Generates a personalized learning roadmap based on the
 * user's skills, interview performance, and target role.
 * Stores the roadmap in the user's Progress document.
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-user';
import connectDB from '@/lib/mongodb';
import Progress from '@/lib/models/Progress';
import { generateRoadmap } from '@/lib/ai/roadmap-generator';
import { aiLimiter } from '@/lib/utils/rate-limiter';

// ── POST handler ────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // 1. Authenticate
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    // 2. Rate limit
    const rateLimitResult = aiLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before generating another roadmap.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { role = 'Software Engineer' } = body;

    // 4. Fetch user's progress data for context
    await connectDB();
    const progress = await Progress.findOne({ userId: user.id });

    // Build AI input from existing progress data
    const skills = progress?.skills?.map((s) => s.name) || [];
    const weakAreas = progress?.weakAreas || [];
    const strongAreas = progress?.strongAreas || [];
    const interviewScores = progress?.interviewScores?.map((s) => ({
      category: s.role || 'General',
      score: s.score,
    })) || [];

    // 5. Generate roadmap via AI
    const roadmap = await generateRoadmap({
      skills,
      weakAreas,
      strongAreas,
      role: role.trim(),
      interviewScores,
    });

    // 6. Store roadmap in Progress document
    await Progress.findOneAndUpdate(
      { userId: user.id },
      {
        $set: { roadmap },
      },
      { upsert: true, new: true }
    );

    // 7. Return roadmap
    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('[API /roadmap/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap. Please try again.' },
      { status: 500 }
    );
  }
}
