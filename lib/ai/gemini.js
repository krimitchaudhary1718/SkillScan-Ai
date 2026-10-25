/**
 * Google Gemini API Client Wrapper
 * ================================
 * Centralized AI client for SkillScan AI platform.
 * Provides a reusable interface to Google's Generative AI
 * with built-in retry logic and error handling.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Singleton client ────────────────────────────────────────────────
// Lazily initialized so the module can be imported without
// immediately requiring the API key (useful in tests / build steps).
let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[SkillScan AI] GEMINI_API_KEY is not set. ' +
        'Add it to your .env.local file.'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// ── Model factory ───────────────────────────────────────────────────
/**
 * Returns a Gemini GenerativeModel instance.
 * Defaults to 'gemini-3.5-flash' with support for override options.
 *
 * @param {object} [options]
 * @param {string} [options.model]            – Model identifier
 * @param {number} [options.temperature=0.7]  – Sampling temperature
 * @param {number} [options.maxOutputTokens=8192] – Max response tokens
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
export function getModel(options = {}) {
  const {
    model = process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    temperature = 0.7,
    maxOutputTokens = 8192,
  } = options;

  return getClient().getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  });
}

// ── Core generation function ────────────────────────────────────────
/**
 * Generate a text response from Gemini with automatic candidate model failover and retry.
 *
 * @param {string} prompt                – The prompt to send
 * @param {object} [options]
 * @param {number} [options.temperature] – Override default temperature
 * @param {number} [options.maxOutputTokens] – Override max tokens
 * @param {number} [options.maxRetries=2]    – Retry attempts per model
 * @param {number} [options.retryDelay=1000] – Base delay between retries (ms)
 * @returns {Promise<string>} The generated text
 */
export async function generateResponse(prompt, options = {}) {
  const {
    temperature,
    maxOutputTokens,
    maxRetries = 2,
    retryDelay = 1000,
  } = options;

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
  ].filter(Boolean);

  let lastError;

  for (const modelName of candidateModels) {
    const model = getModel({ model: modelName, temperature, maxOutputTokens });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('Gemini returned an empty response.');
        }

        return text;
      } catch (error) {
        lastError = error;

        // If it's 404 (deprecated/unsupported) or 503 (high demand), try the next candidate model
        const status = error?.status || error?.httpStatusCode;
        if (status === 404 || status === 503) {
          console.warn(
            `[Gemini] Model ${modelName} returned status ${status}. Switching to fallback model...`
          );
          break; // Exit retry loop for this model; next model in candidateModels will run
        }

        // Non-retryable errors (e.g. invalid auth key 400/403)
        if (status === 400 || status === 403) {
          console.error(
            `[Gemini] Non-retryable error (${status}):`,
            error.message
          );
          throw error;
        }

        // Retryable error with backoff
        console.warn(
          `[Gemini] Model ${modelName} attempt ${attempt}/${maxRetries} failed:`,
          error.message
        );

        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  // All candidate models failed
  console.error('[Gemini] All candidate models exhausted:', lastError?.message);
  throw new Error(
    `Gemini API call failed after trying models [${candidateModels.join(', ')}]: ${lastError?.message}`
  );
}
