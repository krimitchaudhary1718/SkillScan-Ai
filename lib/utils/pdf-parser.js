/**
 * PDF Parser Utility
 * ===================
 * Extracts and normalizes text from PDF buffers.
 * Used by the resume upload flow to prepare text
 * for AI analysis.
 */

/**
 * Extract text content from a PDF buffer.
 *
 * @param {Buffer} buffer – Raw PDF file data
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
export async function extractTextFromPDF(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty or undefined.');
  }

  let parser;
  try {
    const { PDFParse } = require('pdf-parse');
    parser = new PDFParse({ data: buffer });
    
    // Get text and metadata
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();
    
    // Clean up the extracted text
    const cleanedText = cleanText(textResult.text);

    return {
      text: cleanedText,
      numPages: textResult.total || 0,
      info: {
        title: infoResult?.info?.Title || null,
        author: infoResult?.info?.Author || null,
        creator: infoResult?.info?.Creator || null,
        producer: infoResult?.info?.Producer || null,
        creationDate: infoResult?.info?.CreationDate || null,
        pageCount: textResult.total || 0,
        // Approximate word count for validation
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error) {
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF.');
    }
    if (error.message?.includes('password') || error.name === 'PasswordException') {
      throw new Error('The PDF is password-protected. Please upload an unprotected version.');
    }
    
    console.error('[PDFParser] Extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  } finally {
    if (parser) {
      await parser.destroy().catch(e => console.error('Failed to destroy parser:', e));
    }
  }
}

// ── Text cleanup helpers ────────────────────────────────────────────

/**
 * Clean extracted PDF text for AI consumption.
 * Normalizes whitespace, removes control characters,
 * and fixes common extraction artifacts.
 */
function cleanText(rawText) {
  if (!rawText) return '';

  return rawText
    // Remove null bytes and non-printable control characters
    // but preserve common whitespace (tab, newline, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Normalize various Unicode whitespace to regular spaces
    .replace(/[\u00A0\u2000-\u200B\u2028\u2029\u3000]/g, ' ')

    // Fix hyphenation at line breaks (e.g., "soft-\nware" → "software")
    .replace(/(\w)-\n(\w)/g, '$1$2')

    // Collapse multiple spaces into one
    .replace(/ {2,}/g, ' ')

    // Collapse 3+ newlines into 2 (preserve paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')

    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')

    // Final overall trim
    .trim();
}
