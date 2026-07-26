/**
 * Resume Analyzer – AI-powered resume evaluation
 * ================================================
 * Takes raw extracted resume text and returns a structured
 * analysis including score, skills, strengths, weaknesses,
 * and actionable improvement suggestions.
 */

import { generateResponse } from './gemini';

// ── Prompt template ─────────────────────────────────────────────────
/**
 * Build the analysis prompt.  We ask for strict JSON so the
 * response is machine-parseable without fragile regex extraction.
 */
function buildAnalysisPrompt(extractedText) {
  return `
You are an expert career advisor and senior technical recruiter with 15+ years of experience.
Analyze the following resume text thoroughly and provide a comprehensive evaluation.

=== RESUME TEXT ===
${extractedText}
=== END RESUME TEXT ===

Respond ONLY with a valid JSON object (no markdown, no code fences, no explanation) using this exact structure:

{
  "score": <number 0-100 overall resume quality>,
  "skills": ["skill1", "skill2", ...],
  "technologies": ["tech1", "tech2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingSkills": ["missing1", "missing2", ...],
  "suggestions": [
    "suggestion1",
    "suggestion2",
    "suggestion3",
    "suggestion4",
    "suggestion5"
  ],
  "experience_level": "entry" | "mid" | "senior",
  "career_readiness": <number 0-100>,
  "summary": "A 2-3 sentence summary of the candidate's profile."
}

Scoring guidelines:
- score: Evaluate formatting, content quality, impact statements, quantified achievements, relevance, and completeness.
- skills & technologies: Extract ALL mentioned skills and technologies, even implicit ones.
- strengths: Focus on standout qualities that hiring managers would value.
- weaknesses: Be constructive — identify gaps without being harsh.
- missingSkills: Suggest modern, in-demand skills relevant to their field that are absent.
- suggestions: Provide specific, actionable improvements (not vague advice).
- experience_level: "entry" (0-2 yrs), "mid" (3-6 yrs), "senior" (7+ yrs). Infer from context.
- career_readiness: How prepared they are for their next career step.
- summary: Concise overview that could serve as a recruiter note.
`.trim();
}

// ── Default / fallback result ───────────────────────────────────────
function fallbackAnalysis() {
  return {
    score: 0,
    skills: [],
    technologies: [],
    strengths: [],
    weaknesses: ['Unable to analyze resume — please try again.'],
    missingSkills: [],
    suggestions: ['Re-upload a clearer version of your resume.'],
    experience_level: 'entry',
    career_readiness: 0,
    summary: 'Analysis could not be completed. The resume text may be unreadable or empty.',
  };
}

// ── Main export ─────────────────────────────────────────────────────
/**
 * Analyze resume text and return structured evaluation.
 *
 * @param {string} extractedText – Plain text extracted from the resume PDF
 * @returns {Promise<object>}    – Structured analysis object
 */
export async function analyzeResume(extractedText) {
  // Guard: require meaningful input
  if (!extractedText || extractedText.trim().length < 50) {
    console.warn('[ResumeAnalyzer] Text too short for meaningful analysis.');
    return {
      ...fallbackAnalysis(),
      weaknesses: ['Resume text is too short or empty for analysis.'],
    };
  }

  try {
    const prompt = buildAnalysisPrompt(extractedText);

    // Use a lower temperature for more deterministic scoring
    const rawResponse = await generateResponse(prompt, {
      temperature: 0.4,
      maxOutputTokens: 4096,
    });

    const analysis = parseJSONResponse(rawResponse);

    // Validate & clamp numeric fields
    analysis.score = clamp(analysis.score, 0, 100);
    analysis.career_readiness = clamp(analysis.career_readiness, 0, 100);

    // Ensure arrays are actually arrays
    const arrayFields = [
      'skills', 'technologies', 'strengths',
      'weaknesses', 'missingSkills', 'suggestions',
    ];
    for (const field of arrayFields) {
      if (!Array.isArray(analysis[field])) {
        analysis[field] = [];
      }
    }

    // Ensure experience_level is one of the valid values
    const validLevels = ['entry', 'mid', 'senior'];
    if (!validLevels.includes(analysis.experience_level)) {
      analysis.experience_level = 'entry';
    }

    return analysis;
  } catch (error) {
    console.error('[ResumeAnalyzer] Analysis failed:', error.message);
    return fallbackAnalysis();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Robustly parse JSON from an LLM response.
 * Handles common issues: markdown fences, leading text, trailing commas.
 */
function parseJSONResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try to extract the first JSON object if surrounded by prose
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Remove trailing commas before closing braces / brackets (common LLM mistake)
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    // Last-ditch: try to fix unescaped newlines in strings
    try {
      const fixedNewlines = cleaned.replace(
        /("(?:[^"\\]|\\.)*")|(\n)/g,
        (match, quoted, newline) => (quoted ? quoted : '\\n')
      );
      return JSON.parse(fixedNewlines);
    } catch {
      console.error('[ResumeAnalyzer] JSON parse failed:', firstError.message);
      console.error('[ResumeAnalyzer] Raw response (first 500 chars):', text.slice(0, 500));
      throw new Error('Failed to parse AI response as JSON.');
    }
  }
}

/** Clamp a number between min and max. */
function clamp(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}
