/**
 * Interview Question Generator
 * ==============================
 * Generates tailored technical interview questions
 * based on the target role, category, difficulty level,
 * and (optionally) the candidate's resume context.
 */

import { generateResponse } from './gemini';

// ── Prompt builder ──────────────────────────────────────────────────
function buildQuestionsPrompt({ role, category, difficulty, skills, resumeText, count }) {
  const skillsContext = skills?.length
    ? `The candidate is proficient in: ${skills.join(', ')}.`
    : '';

  const resumeContext = resumeText
    ? `\n=== CANDIDATE RESUME (use for context) ===\n${resumeText.slice(0, 3000)}\n=== END RESUME ===`
    : '';

  return `
You are an expert technical interviewer at a top-tier tech company.
Generate exactly ${count} interview questions for the following position:

Role: ${role || 'Software Engineer'}
Category: ${category || 'General Technical'}
Difficulty Level: ${difficulty || 'medium'}
${skillsContext}
${resumeContext}

Guidelines:
- Match the difficulty level precisely:
  • "easy"   → Fundamental concepts, definitions, basic problem solving
  • "medium" → Applied knowledge, scenario-based, moderate complexity
  • "hard"   → System design, trade-off analysis, edge cases, deep expertise
- Questions should be realistic and asked in real interviews.
- Cover a variety of topics within the category.
- If resume context is provided, tailor some questions to the candidate's experience.
- Include a mix of conceptual, practical, and scenario-based questions.

Respond ONLY with a valid JSON array (no markdown, no code fences, no extra text).
Each element must follow this exact structure:

{
  "question": "The interview question text",
  "difficulty": "easy" | "medium" | "hard",
  "topic": "Specific topic this question covers",
  "expectedKeyPoints": [
    "Key point 1 expected in a strong answer",
    "Key point 2",
    "Key point 3"
  ],
  "timeEstimate": <number of minutes to answer (1-10)>
}
`.trim();
}

// ── Main export ─────────────────────────────────────────────────────
/**
 * Generate interview questions.
 *
 * @param {object} params
 * @param {string} params.role       – Target job role
 * @param {string} params.category   – Question category (e.g. "React", "System Design")
 * @param {string} params.difficulty – "easy" | "medium" | "hard"
 * @param {string[]} [params.skills] – Candidate's known skills (from resume)
 * @param {string}  [params.resumeText] – Raw resume text for context
 * @param {number}  [params.count=5] – Number of questions to generate
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuestions({
  role,
  category,
  difficulty,
  skills = [],
  resumeText = '',
  count = 5,
} = {}) {
  // Validate count
  const safeCount = Math.max(1, Math.min(count, 20));

  try {
    const prompt = buildQuestionsPrompt({
      role,
      category,
      difficulty,
      skills,
      resumeText,
      count: safeCount,
    });

    const rawResponse = await generateResponse(prompt, {
      temperature: 0.6,
      maxOutputTokens: 4096,
    });

    const questions = parseQuestionsResponse(rawResponse);

    // Post-process: ensure every question has required fields
    return questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      difficulty: validateDifficulty(q.difficulty, difficulty),
      topic: q.topic || category || 'General',
      expectedKeyPoints: Array.isArray(q.expectedKeyPoints)
        ? q.expectedKeyPoints
        : [],
      timeEstimate: clampTime(q.timeEstimate),
    }));
  } catch (error) {
    console.error('[InterviewGenerator] Generation failed:', error.message);
    throw new Error('Failed to generate interview questions. Please try again.');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Parse the LLM response into a JSON array of questions.
 */
function parseQuestionsResponse(text) {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Extract the JSON array
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  // Remove trailing commas
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array.');
    }
    return parsed;
  } catch (firstError) {
    // Try to fix common issues
    try {
      const fixedNewlines = cleaned.replace(
        /("(?:[^"\\]|\\.)*")|(\n)/g,
        (match, quoted, newline) => (quoted ? quoted : '\\n')
      );
      const parsed = JSON.parse(fixedNewlines);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      console.error('[InterviewGenerator] JSON parse failed:', firstError.message);
      throw new Error('Failed to parse generated questions.');
    }
  }
}

/** Validate difficulty falls within allowed values. */
function validateDifficulty(value, fallback = 'medium') {
  const valid = ['easy', 'medium', 'hard'];
  return valid.includes(value) ? value : fallback || 'medium';
}

/** Clamp time estimate to a reasonable range. */
function clampTime(value) {
  const num = Number(value);
  if (isNaN(num)) return 3;
  return Math.max(1, Math.min(10, num));
}
