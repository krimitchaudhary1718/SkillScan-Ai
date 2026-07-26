/**
 * Answer Evaluator – AI-powered interview answer grading
 * ========================================================
 * Evaluates a candidate's answer against expected key points,
 * providing granular scoring across multiple dimensions and
 * actionable feedback for improvement.
 */

import { generateResponse } from './gemini';

// ── Prompt builder ──────────────────────────────────────────────────
function buildEvaluationPrompt({ question, answer, expectedKeyPoints }) {
  const keyPointsList = expectedKeyPoints?.length
    ? expectedKeyPoints.map((kp, i) => `  ${i + 1}. ${kp}`).join('\n')
    : '  (No specific key points provided — evaluate on general quality.)';

  return `
You are a senior technical interviewer evaluating a candidate's answer.
Be fair, thorough, and constructive.

=== QUESTION ===
${question}

=== EXPECTED KEY POINTS ===
${keyPointsList}

=== CANDIDATE'S ANSWER ===
${answer}

=== EVALUATION INSTRUCTIONS ===
Evaluate the answer on these dimensions:
1. **Accuracy** – Is the information correct?
2. **Depth** – Does the answer demonstrate deep understanding?
3. **Clarity** – Is the answer well-structured and easy to follow?

Respond ONLY with a valid JSON object (no markdown, no code fences):

{
  "score": <overall score 0-100>,
  "accuracy": <0-100>,
  "depth": <0-100>,
  "clarity": <0-100>,
  "feedback": "Detailed feedback explaining the evaluation (2-4 sentences)",
  "correctApproach": "How the answer should ideally be structured (2-3 sentences)",
  "keyPointsCovered": ["key point that was addressed", ...],
  "keyPointsMissed": ["key point that was missed", ...],
  "areasToImprove": ["specific area 1", "specific area 2", ...],
  "grade": "A" | "B" | "C" | "D" | "F"
}

Grading scale:
- A (90-100): Exceptional — covers all key points with depth
- B (75-89):  Strong — covers most key points with good understanding
- C (60-74):  Adequate — covers basics but lacks depth
- D (40-59):  Below average — missing key concepts
- F (0-39):   Insufficient — major gaps in understanding
`.trim();
}

// ── Main export ─────────────────────────────────────────────────────
/**
 * Evaluate a candidate's answer to an interview question.
 *
 * @param {object} params
 * @param {string} params.question           – The interview question
 * @param {string} params.answer             – The candidate's answer
 * @param {string[]} params.expectedKeyPoints – Key points expected in a good answer
 * @returns {Promise<object>} Structured evaluation result
 */
export async function evaluateAnswer({ question, answer, expectedKeyPoints = [] }) {
  // Guard: reject empty answers
  if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      accuracy: 0,
      depth: 0,
      clarity: 0,
      feedback: 'No meaningful answer was provided.',
      correctApproach: 'Please provide a substantive response to the question.',
      keyPointsCovered: [],
      keyPointsMissed: expectedKeyPoints,
      areasToImprove: ['Provide a complete answer'],
      grade: 'F',
    };
  }

  try {
    const prompt = buildEvaluationPrompt({ question, answer, expectedKeyPoints });

    const rawResponse = await generateResponse(prompt, {
      temperature: 0.3,   // Low temp for consistent, fair grading
      maxOutputTokens: 2048,
    });

    const evaluation = parseEvaluationResponse(rawResponse);

    // Validate & normalize the evaluation object
    return normalizeEvaluation(evaluation, expectedKeyPoints);
  } catch (error) {
    console.error('[AnswerEvaluator] Evaluation failed:', error.message);
    throw new Error('Failed to evaluate answer. Please try again.');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Parse JSON from the LLM response. */
function parseEvaluationResponse(text) {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      const fixed = cleaned.replace(
        /("(?:[^"\\]|\\.)*")|(\n)/g,
        (match, quoted, newline) => (quoted ? quoted : '\\n')
      );
      return JSON.parse(fixed);
    } catch {
      console.error('[AnswerEvaluator] JSON parse failed:', firstError.message);
      throw new Error('Failed to parse evaluation response.');
    }
  }
}

/** Normalize and validate the evaluation object. */
function normalizeEvaluation(eval_, expectedKeyPoints) {
  const clamp = (v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
  };

  const score = clamp(eval_.score);

  // Determine grade from score if the LLM grade doesn't match
  const validGrades = ['A', 'B', 'C', 'D', 'F'];
  let grade = validGrades.includes(eval_.grade)
    ? eval_.grade
    : scoreToGrade(score);

  return {
    score,
    accuracy: clamp(eval_.accuracy),
    depth: clamp(eval_.depth),
    clarity: clamp(eval_.clarity),
    feedback: eval_.feedback || 'Evaluation complete.',
    correctApproach: eval_.correctApproach || '',
    keyPointsCovered: Array.isArray(eval_.keyPointsCovered)
      ? eval_.keyPointsCovered
      : [],
    keyPointsMissed: Array.isArray(eval_.keyPointsMissed)
      ? eval_.keyPointsMissed
      : [],
    areasToImprove: Array.isArray(eval_.areasToImprove)
      ? eval_.areasToImprove
      : [],
    grade,
  };
}

/** Map a numeric score to a letter grade. */
function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}
