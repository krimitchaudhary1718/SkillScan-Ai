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
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Resume from '@/lib/models/Resume';
import InterviewSession from '@/lib/models/InterviewSession';
import Progress from '@/lib/models/Progress';

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
    name: token.name,
    role: token.role || 'user',
  };
}

// ── GET handler ─────────────────────────────────────────────────────
export async function GET(request) {
  try {
    // 1. Authenticate
    const user = await getUser(request);
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

    // 3. Compile dashboard data
    const dashboard = {
      user: {
        name: user.name,
        email: user.email,
      },

      // Resume section
      resume: latestResume
        ? {
            resumeId: latestResume._id.toString(),
            score: latestResume.score,
            fileName: latestResume.fileName,
            analyzedAt: latestResume.updatedAt,
            analysis: latestResume.analysis
              ? {
                  summary: latestResume.analysis.summary,
                  experience_level: latestResume.analysis.experience_level,
                  career_readiness: latestResume.analysis.career_readiness,
                  strengths: latestResume.analysis.strengths,
                  weaknesses: latestResume.analysis.weaknesses,
                  suggestions: latestResume.analysis.suggestions,
                  missingSkills: latestResume.analysis.missingSkills,
                }
              : null,
          }
        : null,

      // Skills with levels
      skills: progress?.skills?.map((s) => ({
        name: s.name,
        level: s.level,
        category: s.category,
      })) || [],

      // Recent interviews
      recentInterviews: recentSessions.map((session) => ({
        sessionId: session._id.toString(),
        role: session.role,
        category: session.category,
        difficulty: session.difficulty,
        score: session.overallScore,
        status: session.status,
        questionCount: session.questions?.length || 0,
        answeredCount: session.answers?.length || 0,
        date: session.createdAt,
      })),

      // Performance areas
      weakAreas: progress?.weakAreas || [],
      strongAreas: progress?.strongAreas || [],

      // Statistics
      stats: {
        totalInterviews: progress?.totalInterviews || 0,
        averageScore: progress?.averageScore || 0,
        resumeScore: latestResume?.score || null,
        interviewScoreHistory: progress?.interviewScores?.slice(-10) || [],
        resumeScoreHistory: progress?.resumeScores?.slice(-10) || [],
      },

      // Roadmap summary (if generated)
      roadmap: progress?.roadmap
        ? {
            overview: progress.roadmap.overview,
            estimatedReadiness: progress.roadmap.estimatedReadiness,
            prioritySkills: progress.roadmap.prioritySkills,
            phaseCount: progress.roadmap.phases?.length || 0,
            phases: progress.roadmap.phases?.map((p) => ({
              title: p.title,
              duration: p.duration,
              topicCount: p.topics?.length || 0,
            })) || [],
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('[API /dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data.' },
      { status: 500 }
    );
  }
}
