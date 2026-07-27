/**
 * Answer Evaluation API  –  POST /api/interview/evaluate
 * ========================================================
 * Evaluates a user's answer to a specific interview question
 * using AI. Stores the evaluation in the InterviewSession
 * and calculates the overall score when all questions are
 * answered.
 *
 * Request body:
 *  { sessionId, questionIndex, answer }
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-user';
import connectDB from '@/lib/mongodb';
import InterviewSession from '@/lib/models/InterviewSession';
import Progress from '@/lib/models/Progress';
import { evaluateAnswer } from '@/lib/ai/answer-evaluator';
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
          error: 'Rate limit exceeded. Please wait before submitting another answer.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse & validate body
    const body = await request.json();
    const { sessionId, questionIndex, answer } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required.' },
        { status: 400 }
      );
    }

    if (questionIndex === undefined || questionIndex === null) {
      return NextResponse.json(
        { error: 'questionIndex is required.' },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json(
        { error: 'A non-empty answer is required.' },
        { status: 400 }
      );
    }

    // 4. Find session & verify ownership
    await connectDB();
    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found.' },
        { status: 404 }
      );
    }

    if (session.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. This session belongs to another user.' },
        { status: 403 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'This session is already completed.' },
        { status: 400 }
      );
    }

    // 5. Validate question index
    const qIndex = Number(questionIndex);
    if (isNaN(qIndex) || qIndex < 0 || qIndex >= session.questions.length) {
      return NextResponse.json(
        {
          error: `Invalid questionIndex. Must be between 0 and ${session.questions.length - 1}.`,
        },
        { status: 400 }
      );
    }

    // Check if this question was already answered
    const alreadyAnswered = session.answers.find(
      (a) => a.questionIndex === qIndex
    );
    if (alreadyAnswered) {
      return NextResponse.json(
        { error: 'This question has already been answered.' },
        { status: 409 }
      );
    }

    // 6. Get question details
    const questionObj = session.questions[qIndex];

    // We need to reconstruct expectedKeyPoints.
    // Since they're not stored in the QuestionSchema (lightweight),
    // we pass an empty array — the AI evaluator will assess independently.
    // For a more robust solution, store expectedKeyPoints in the session.
    const expectedKeyPoints = [];

    // 7. Evaluate the answer via AI
    const evaluation = await evaluateAnswer({
      question: questionObj.question,
      answer: answer.trim(),
      expectedKeyPoints,
    });

    // 8. Store the answer + evaluation in the session
    session.answers.push({
      questionIndex: qIndex,
      answer: answer.trim(),
      evaluation: {
        correctness: evaluation.accuracy,
        completeness: evaluation.depth,
        clarity: evaluation.clarity,
        feedback: evaluation.feedback,
        keyPoints: evaluation.keyPointsCovered,
        improvements: evaluation.areasToImprove,
        grade: evaluation.grade,
        correctApproach: evaluation.correctApproach,
      },
      score: evaluation.score,
    });

    // 9. Check if all questions have been answered
    const allAnswered = session.answers.length >= session.questions.length;

    if (allAnswered) {
      // Calculate overall score (average of all answer scores)
      const totalScore = session.answers.reduce(
        (sum, a) => sum + (a.score || 0),
        0
      );
      session.overallScore = Math.round(
        totalScore / session.answers.length
      );

      // Generate summary feedback
      session.feedback = generateSessionFeedback(
        session.overallScore,
        session.answers
      );

      session.status = 'completed';

      // Update user's progress
      await updateProgress(user.id, session);
    }

    await session.save();

    // 10. Build response
    const response = {
      success: true,
      evaluation: {
        score: evaluation.score,
        accuracy: evaluation.accuracy,
        depth: evaluation.depth,
        clarity: evaluation.clarity,
        feedback: evaluation.feedback,
        correctApproach: evaluation.correctApproach,
        keyPointsCovered: evaluation.keyPointsCovered,
        keyPointsMissed: evaluation.keyPointsMissed,
        areasToImprove: evaluation.areasToImprove,
        grade: evaluation.grade,
      },
      progress: {
        answered: session.answers.length,
        total: session.questions.length,
        isComplete: allAnswered,
      },
    };

    // Include overall results if session is complete
    if (allAnswered) {
      response.sessionResult = {
        overallScore: session.overallScore,
        feedback: session.feedback,
        status: 'completed',
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /interview/evaluate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer. Please try again.' },
      { status: 500 }
    );
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Generate a summary feedback string for the completed session. */
function generateSessionFeedback(overallScore, answers) {
  const gradeDistribution = {};
  for (const a of answers) {
    const grade = a.evaluation?.grade || 'N/A';
    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
  }

  let feedback = `Overall Score: ${overallScore}/100. `;

  if (overallScore >= 90) {
    feedback += 'Excellent performance! You demonstrated strong command of the topics.';
  } else if (overallScore >= 75) {
    feedback += 'Good performance with room for improvement in specific areas.';
  } else if (overallScore >= 60) {
    feedback += 'Decent effort but several areas need deeper understanding.';
  } else if (overallScore >= 40) {
    feedback += 'Below expectations. Focus on strengthening fundamental concepts.';
  } else {
    feedback += 'Significant improvement needed. Consider reviewing core materials.';
  }

  return feedback;
}

/** Update the user's Progress document after completing an interview. */
async function updateProgress(userId, session) {
  try {
    await Progress.findOneAndUpdate(
      { userId },
      {
        $push: {
          interviewScores: {
            date: new Date(),
            score: session.overallScore,
            role: session.role,
          },
        },
        $inc: { totalInterviews: 1 },
      },
      { upsert: true, new: true }
    );

    // Recalculate average score
    const progress = await Progress.findOne({ userId });
    if (progress && progress.interviewScores.length > 0) {
      const totalScores = progress.interviewScores.reduce(
        (sum, s) => sum + s.score,
        0
      );
      progress.averageScore = Math.round(
        totalScores / progress.interviewScores.length
      );
      await progress.save();
    }
  } catch (error) {
    console.error('[API /interview/evaluate] Failed to update progress:', error);
  }
}
