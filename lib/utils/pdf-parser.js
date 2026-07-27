/**
 * PDF Parser Utility with Node.js / Serverless DOM Polyfills
 * ============================================================
 * Extracts and normalizes text from PDF buffers.
 * Includes complete polyfills for DOMMatrix, Path2D, ImageData,
 * createImageBitmap, and OffscreenCanvas required by pdfjs-dist
 * when running in Node.js / Vercel Serverless environments.
 *
 * NOTE: Polyfills MUST execute before importing pdf-parse so that
 * pdfjs-dist finds global DOMMatrix and other browser APIs.
 */

// ── 1. Polyfill Browser DOM Objects Required by pdfjs-dist ────────────────
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m21 = 0; this.m22 = 1; this.m41 = 0; this.m42 = 0;
      if (Array.isArray(init)) {
        if (init.length === 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
          this.m11 = this.a; this.m12 = this.b; this.m21 = this.c; this.m22 = this.d; this.m41 = this.e; this.m42 = this.f;
        }
      }
    }
    static fromMatrix(o) {
      const m = new DOMMatrix();
      if (o) {
        m.a = m.m11 = o.a ?? 1; m.b = m.m12 = o.b ?? 0; m.c = m.m21 = o.c ?? 0;
        m.d = m.m22 = o.d ?? 1; m.e = m.m41 = o.e ?? 0; m.f = m.m42 = o.f ?? 0;
      }
      return m;
    }
    static fromFloat32Array(a) { return new DOMMatrix(Array.from(a)); }
    static fromFloat64Array(a) { return new DOMMatrix(Array.from(a)); }
    multiply(other) {
      const result = new DOMMatrix();
      result.a = this.a * other.a + this.c * other.b;
      result.b = this.b * other.a + this.d * other.b;
      result.c = this.a * other.c + this.c * other.d;
      result.d = this.b * other.c + this.d * other.d;
      result.e = this.a * other.e + this.c * other.f + this.e;
      result.f = this.b * other.e + this.d * other.f + this.f;
      return result;
    }
    translate(tx = 0, ty = 0) {
      return this.multiply(new DOMMatrix([1, 0, 0, 1, tx, ty]));
    }
    scale(sx = 1, sy = sx) {
      return this.multiply(new DOMMatrix([sx, 0, 0, sy, 0, 0]));
    }
    rotate(angle = 0) {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return this.multiply(new DOMMatrix([cos, sin, -sin, cos, 0, 0]));
    }
    invertSelf() { return this; }
    transformPoint(p = { x: 0, y: 0 }) {
      return {
        x: p.x * this.a + p.y * this.c + this.e,
        y: p.x * this.b + p.y * this.d + this.f,
      };
    }
    toFloat32Array() { return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]); }
    toFloat64Array() { return new Float64Array([this.a, this.b, this.c, this.d, this.e, this.f]); }
  };
}

if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {
    constructor() {}
    addPath() {} closePath() {} moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {} arc() {} arcTo() {} ellipse() {} rect() {}
  };
}

if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    constructor(width = 1, height = 1) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}

if (typeof globalThis.createImageBitmap === 'undefined') {
  globalThis.createImageBitmap = async function (img) {
    return { width: img?.width || 1, height: img?.height || 1, close() {} };
  };
}

if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return {
        fillRect() {}, clearRect() {}, getImageData() { return new globalThis.ImageData(1, 1); },
        putImageData() {}, createImageData() { return new globalThis.ImageData(1, 1); },
        setTransform() {}, drawImage() {}, save() {}, restore() {}, beginPath() {},
        closePath() {}, moveTo() {}, lineTo() {}, clip() {},
      };
    }
  };
}

// ── 2. Extract Text Function ──────────────────────────────────────────────
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
    // Dynamic import ensures our polyfills above are already loaded
    // before pdf-parse and pdfjs-dist evaluate in Node.js / Vercel Serverless
    const mod = await import('pdf-parse');
    const PDFParse = mod.PDFParse || mod.default?.PDFParse || mod.default;

    if (typeof PDFParse !== 'function') {
      throw new Error('Failed to resolve PDFParse class from module.');
    }

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
    if (parser && typeof parser.destroy === 'function') {
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
