/**
 * Interview Generation API  –  POST /api/interview/generate
 * ===========================================================
 * Generates a set of AI interview questions for a given role,
 * category, and difficulty level. Optionally uses the user's
 * resume for personalized question context.
 *
 * Creates an InterviewSession document and returns
 * the sessionId + questions to the client.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Resume from '@/lib/models/Resume';
import InterviewSession from '@/lib/models/InterviewSession';
import { generateQuestions } from '@/lib/ai/interview-generator';
import { aiLimiter } from '@/lib/utils/rate-limiter';

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

// ── POST handler ────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // 1. Authenticate
    const user = await getUser(request);
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
          error: 'Rate limit exceeded. Please wait before generating more questions.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse & validate request body
    const body = await request.json();
    const {
      role,
      category,
      difficulty = 'medium',
      resumeId,
      count = 5,
    } = body;

    if (!role || role.trim().length === 0) {
      return NextResponse.json(
        { error: 'Role is required (e.g., "Frontend Developer").' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate count
    const questionCount = Math.max(1, Math.min(Number(count) || 5, 15));

    await connectDB();

    // 4. Optionally fetch resume for context
    let resumeText = '';
    let skills = [];

    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume && resume.userId.toString() === user.id) {
        resumeText = resume.extractedText || '';
        // Pull skills from analysis if available
        if (resume.analysis?.skills) {
          skills = resume.analysis.skills;
        }
      }
      // Silently ignore if resume not found or doesn't belong to user
    }

    // 5. Generate questions via AI
    const questions = await generateQuestions({
      role: role.trim(),
      category: category?.trim() || 'General Technical',
      difficulty,
      skills,
      resumeText,
      count: questionCount,
    });

    // 6. Create InterviewSession in MongoDB
    const session = await InterviewSession.create({
      userId: user.id,
      role: role.trim(),
      category: category?.trim() || 'General',
      difficulty,
      questions: questions.map((q) => ({
        question: q.question,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
      status: 'in-progress',
    });

    // 7. Increment user's interview count
    await User.findByIdAndUpdate(user.id, {
      $inc: { interviewCount: 1 },
    });

    // 8. Return session & questions
    // Include expectedKeyPoints for the client (used during evaluation)
    return NextResponse.json(
      {
        success: true,
        sessionId: session._id.toString(),
        questions: questions.map((q, index) => ({
          index,
          question: q.question,
          difficulty: q.difficulty,
          topic: q.topic,
          timeEstimate: q.timeEstimate,
          // Keep expectedKeyPoints server-side in the session
          // but we store them for the evaluate endpoint
          _expectedKeyPoints: q.expectedKeyPoints,
        })),
        totalQuestions: questions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /interview/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions. Please try again.' },
      { status: 500 }
    );
  }
}
