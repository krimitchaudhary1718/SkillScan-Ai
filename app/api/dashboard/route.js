/**
 * Dashboard Data API  –  GET /api/dashboard
 * ============================================
 * Aggregates and returns all data needed to render
 * the user's dashboard in a single request.
 *
 * Returns:
 *  - resumeScore & skills
 *  - recentInterviews (last 5)
 *  - weakAreas / strongAreas
 *  - totalInterviews, averageScore
 *  - roadmap summary
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-user';
import connectDB from '@/lib/mongodb';
import Resume from '@/lib/models/Resume';
import InterviewSession from '@/lib/models/InterviewSession';
import Progress from '@/lib/models/Progress';

// ── GET handler ─────────────────────────────────────────────────────
export async function GET(request) {
  try {
    // 1. Authenticate
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Run all queries in parallel for performance
    const [
      latestResume,
      recentSessions,
      progress,
    ] = await Promise.all([
      // Latest analyzed resume (exclude the heavy fileData field)
      Resume.findOne(
        { userId: user.id, status: 'analyzed' },
        { fileData: 0 }
      ).sort({ createdAt: -1 }),

      // Last 5 interview sessions
      InterviewSession.find(
        { userId: user.id },
        {
          role: 1,
          category: 1,
          difficulty: 1,
          overallScore: 1,
          status: 1,
          createdAt: 1,
          'questions.question': 1,
          'questions.topic': 1,
          'answers.score': 1,
        }
      )
        .sort({ createdAt: -1 })
        .limit(5),

      // User's progress document
      Progress.findOne({ userId: user.id }),
    ]);

    // 3. Build flat response — keys must match what the frontend destructures
    const resumeScore   = latestResume?.score ?? null;
    const averageScore  = progress?.averageScore ?? 0;

    return NextResponse.json({
      // ── Stats (used by dashboard/page.js StatsCards) ──────────────
      resumeScore,
      // Use average interview score as a readiness proxy (0 if no interviews yet)
      interviewReadiness: averageScore,
      totalInterviews:    progress?.totalInterviews ?? 0,
      averageScore,

      // ── Skills chart ───────────────────────────────────────────────
      skills: (progress?.skills ?? []).map((s) => ({
        name:     s.name,
        level:    s.level,
        category: s.category,
      })),

      // ── Recent activity (component reads .role, .category, .overallScore,
      //    .status, .createdAt, ._id) ──────────────────────────────────
      recentActivity: recentSessions.map((session) => ({
        _id:          session._id.toString(),
        role:         session.role,
        category:     session.category,
        difficulty:   session.difficulty,
        overallScore: session.overallScore,
        status:       session.status,
        createdAt:    session.createdAt,
      })),

      // ── AI suggestions (from latest resume analysis) ──────────────
      suggestions: latestResume?.analysis?.suggestions ?? [],

      // ── Weak topics (from progress document) ─────────────────────
      weakTopics: progress?.weakAreas ?? [],

      // ── Resume section (used by dashboard/resume/page.js) ─────────
      resume: latestResume
        ? {
            resumeId:   latestResume._id.toString(),
            score:      latestResume.score,
            fileName:   latestResume.fileName,
            analyzedAt: latestResume.updatedAt,
            analysis:   latestResume.analysis
              ? {
                  summary:          latestResume.analysis.summary,
                  experience_level: latestResume.analysis.experience_level,
                  career_readiness: latestResume.analysis.career_readiness,
                  strengths:        latestResume.analysis.strengths,
                  weaknesses:       latestResume.analysis.weaknesses,
                  suggestions:      latestResume.analysis.suggestions,
                  missingSkills:    latestResume.analysis.missingSkills,
                }
              : null,
          }
        : null,
    });
  } catch (error) {
    console.error('[API /dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data.' },
      { status: 500 }
    );
  }
}
