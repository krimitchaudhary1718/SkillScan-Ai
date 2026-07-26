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
 * Returns the Gemini 1.5 Flash model instance.
 * Flash is optimized for speed while retaining strong reasoning —
 * ideal for the latency-sensitive interview & resume flows.
 *
 * @param {object} [options]
 * @param {number} [options.temperature=0.7]  – Sampling temperature
 * @param {number} [options.maxOutputTokens=8192] – Max response tokens
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
export function getModel(options = {}) {
  const {
    temperature = 0.7,
    maxOutputTokens = 8192,
  } = options;

  return getClient().getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  });
}

// ── Core generation function ────────────────────────────────────────
/**
 * Generate a text response from Gemini with automatic retry.
 *
 * @param {string} prompt                – The prompt to send
 * @param {object} [options]
 * @param {number} [options.temperature] – Override default temperature
 * @param {number} [options.maxOutputTokens] – Override max tokens
 * @param {number} [options.maxRetries=3]    – Retry attempts on transient errors
 * @param {number} [options.retryDelay=1000] – Base delay between retries (ms)
 * @returns {Promise<string>} The generated text
 */
export async function generateResponse(prompt, options = {}) {
  const {
    temperature,
    maxOutputTokens,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const model = getModel({ temperature, maxOutputTokens });

  let lastError;

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

      // Non-retryable errors – bail immediately
      const status = error?.status || error?.httpStatusCode;
      if (status === 400 || status === 403) {
        console.error(
          `[Gemini] Non-retryable error (${status}):`,
          error.message
        );
        throw error;
      }

      // Retryable – log & wait with exponential back-off + jitter
      console.warn(
        `[Gemini] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );

      if (attempt < maxRetries) {
        const jitter = Math.random() * 500;
        const delay = retryDelay * Math.pow(2, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  console.error('[Gemini] All retries exhausted:', lastError?.message);
  throw new Error(
    `Gemini API call failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}
