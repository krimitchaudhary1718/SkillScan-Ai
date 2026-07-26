/**
 * Resume Analysis API  –  POST /api/resume/analyze
 * ==================================================
 * Triggers AI analysis of a previously uploaded resume.
 * Updates the resume document with structured analysis results
 * and syncs skill data to the user's Progress document.
 *
 * Flow:
 *  1. Validate auth & input
 *  2. Mark resume status → 'processing'
 *  3. Run AI analysis via Gemini
 *  4. Store results, mark status → 'analyzed'
 *  5. Sync skills to Progress model
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Resume from '@/lib/models/Resume';
import Progress from '@/lib/models/Progress';
import { analyzeResume } from '@/lib/ai/resume-analyzer';
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
  let resume = null; // Track for error recovery

  try {
    // 1. Authenticate
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    // 2. Rate limit AI calls
    const rateLimitResult = aiLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'AI rate limit exceeded. Please wait before analyzing again.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'resumeId is required.' },
        { status: 400 }
      );
    }

    // 4. Find resume & verify ownership
    await connectDB();
    resume = await Resume.findById(resumeId);

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found.' },
        { status: 404 }
      );
    }

    if (resume.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. This resume belongs to another user.' },
        { status: 403 }
      );
    }

    // 5. Check if already analyzed
    if (resume.status === 'analyzed' && resume.analysis) {
      return NextResponse.json({
        success: true,
        cached: true,
        analysis: resume.analysis,
        score: resume.score,
      });
    }

    // Prevent concurrent processing
    if (resume.status === 'processing') {
      return NextResponse.json(
        { error: 'This resume is already being analyzed. Please wait.' },
        { status: 409 }
      );
    }

    // 6. Verify extracted text exists
    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short for meaningful analysis.' },
        { status: 422 }
      );
    }

    // 7. Mark as processing
    resume.status = 'processing';
    await resume.save();

    // 8. Run AI analysis
    const analysis = await analyzeResume(resume.extractedText);

    // 9. Update resume with results
    resume.analysis = analysis;
    resume.score = analysis.score;
    resume.status = 'analyzed';
    await resume.save();

    // 10. Sync skills to user's Progress document
    await syncProgressSkills(user.id, analysis);

    return NextResponse.json({
      success: true,
      cached: false,
      analysis,
      score: analysis.score,
    });
  } catch (error) {
    console.error('[API /resume/analyze] Error:', error);

    // Mark resume as errored if we had a reference
    if (resume && resume.status === 'processing') {
      try {
        resume.status = 'error';
        await resume.save();
      } catch (saveError) {
        console.error('[API /resume/analyze] Failed to mark error status:', saveError);
      }
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}

// ── Helper: Sync skills to Progress ─────────────────────────────────
/**
 * Upsert the user's Progress document with skills from
 * the latest resume analysis.
 */
async function syncProgressSkills(userId, analysis) {
  try {
    // Build skills array from analysis data
    const skills = [
      ...(analysis.skills || []).map((name) => ({
        name,
        level: 60, // Default level for detected skills
        category: 'Technical',
      })),
      ...(analysis.technologies || []).map((name) => ({
        name,
        level: 50, // Slightly lower for general tech mentions
        category: 'Technology',
      })),
    ];

    // Upsert the Progress document
    await Progress.findOneAndUpdate(
      { userId },
      {
        $set: {
          skills,
          weakAreas: analysis.weaknesses || [],
          strongAreas: analysis.strengths || [],
        },
        $push: {
          resumeScores: {
            date: new Date(),
            score: analysis.score || 0,
          },
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    // Non-critical — log but don't fail the main request
    console.error('[API /resume/analyze] Failed to sync progress:', error);
  }
}
