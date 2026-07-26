/**
 * Roadmap Generator – Personalized learning paths
 * ==================================================
 * Creates a phased, actionable study roadmap tailored to
 * the candidate's strengths, weaknesses, target role,
 * and interview performance history.
 */

import { generateResponse } from './gemini';

// ── Prompt builder ──────────────────────────────────────────────────
function buildRoadmapPrompt({ skills, weakAreas, strongAreas, role, interviewScores }) {
  const skillsList = skills?.length
    ? `Current Skills: ${skills.join(', ')}`
    : 'Current Skills: Not specified';

  const weakList = weakAreas?.length
    ? `Weak Areas: ${weakAreas.join(', ')}`
    : 'Weak Areas: Not identified yet';

  const strongList = strongAreas?.length
    ? `Strong Areas: ${strongAreas.join(', ')}`
    : 'Strong Areas: Not identified yet';

  const scoresInfo = interviewScores?.length
    ? `Recent Interview Scores: ${interviewScores.map((s) => `${s.category}: ${s.score}/100`).join(', ')}`
    : 'Interview History: No interviews completed yet';

  return `
You are a senior career coach and technical mentor specializing in software engineering interview preparation.
Create a personalized, actionable learning roadmap for the following candidate:

=== CANDIDATE PROFILE ===
Target Role: ${role || 'Software Engineer'}
${skillsList}
${strongList}
${weakList}
${scoresInfo}

=== INSTRUCTIONS ===
Design a comprehensive roadmap that:
1. Prioritizes weak areas while reinforcing strengths
2. Follows a progressive learning curve (fundamentals → advanced)
3. Includes practical project recommendations
4. Provides specific, high-quality resource suggestions
5. Is realistic and achievable with dedicated daily practice

Respond ONLY with a valid JSON object (no markdown, no code fences):

{
  "overview": "A 2-3 sentence summary of the roadmap strategy",
  "phases": [
    {
      "title": "Phase title (e.g., 'Foundation Building')",
      "duration": "e.g., '2 weeks'",
      "description": "What this phase covers and why",
      "topics": [
        {
          "name": "Topic name",
          "priority": "high" | "medium" | "low",
          "resources": [
            "Specific resource 1 (book, course, or website)",
            "Specific resource 2"
          ]
        }
      ],
      "projects": [
        "Practical project idea 1",
        "Practical project idea 2"
      ]
    }
  ],
  "prioritySkills": [
    "Skill 1 (most critical)",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5"
  ],
  "dailyPractice": [
    "Daily practice suggestion 1",
    "Daily practice suggestion 2",
    "Daily practice suggestion 3"
  ],
  "estimatedReadiness": <number of weeks to interview readiness>
}

Generate 3-4 phases. Each phase should have 3-5 topics and 2-3 project ideas.
`.trim();
}

// ── Main export ─────────────────────────────────────────────────────
/**
 * Generate a personalized learning roadmap.
 *
 * @param {object} params
 * @param {string[]} params.skills           – Candidate's current skills
 * @param {string[]} params.weakAreas        – Areas needing improvement
 * @param {string[]} params.strongAreas      – Areas of strength
 * @param {string}   params.role             – Target job role
 * @param {Array}    params.interviewScores  – Past interview performance
 * @returns {Promise<object>} Structured roadmap
 */
export async function generateRoadmap({
  skills = [],
  weakAreas = [],
  strongAreas = [],
  role = 'Software Engineer',
  interviewScores = [],
} = {}) {
  try {
    const prompt = buildRoadmapPrompt({
      skills,
      weakAreas,
      strongAreas,
      role,
      interviewScores,
    });

    const rawResponse = await generateResponse(prompt, {
      temperature: 0.5,
      maxOutputTokens: 6144,
    });

    const roadmap = parseRoadmapResponse(rawResponse);
    return normalizeRoadmap(roadmap);
  } catch (error) {
    console.error('[RoadmapGenerator] Generation failed:', error.message);
    throw new Error('Failed to generate learning roadmap. Please try again.');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Parse JSON from the LLM response. */
function parseRoadmapResponse(text) {
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
      console.error('[RoadmapGenerator] JSON parse failed:', firstError.message);
      throw new Error('Failed to parse roadmap response.');
    }
  }
}

/** Validate and normalize the roadmap object. */
function normalizeRoadmap(roadmap) {
  return {
    overview: roadmap.overview || 'Your personalized learning roadmap.',

    phases: Array.isArray(roadmap.phases)
      ? roadmap.phases.map((phase, i) => ({
          title: phase.title || `Phase ${i + 1}`,
          duration: phase.duration || '2 weeks',
          description: phase.description || '',
          topics: Array.isArray(phase.topics)
            ? phase.topics.map((t) => ({
                name: t.name || 'Topic',
                priority: ['high', 'medium', 'low'].includes(t.priority)
                  ? t.priority
                  : 'medium',
                resources: Array.isArray(t.resources) ? t.resources : [],
              }))
            : [],
          projects: Array.isArray(phase.projects) ? phase.projects : [],
        }))
      : [],

    prioritySkills: Array.isArray(roadmap.prioritySkills)
      ? roadmap.prioritySkills.slice(0, 5)
      : [],

    dailyPractice: Array.isArray(roadmap.dailyPractice)
      ? roadmap.dailyPractice
      : [],

    estimatedReadiness: (() => {
      const n = Number(roadmap.estimatedReadiness);
      return isNaN(n) ? 8 : Math.max(1, Math.min(52, n));
    })(),
  };
}
