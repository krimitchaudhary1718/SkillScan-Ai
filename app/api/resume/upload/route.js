/**
 * Resume Upload API  –  POST /api/resume/upload
 * ==============================================
 * Accepts a PDF file via FormData, extracts the text,
 * stores the resume in MongoDB, and returns the resume ID.
 *
 * Security:
 *  - JWT authentication required
 *  - File type validation (PDF only)
 *  - File size validation (max 5 MB)
 *  - Rate limiting on uploads
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-user';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Resume from '@/lib/models/Resume';
import { extractTextFromPDF } from '@/lib/utils/pdf-parser';
import { uploadLimiter } from '@/lib/utils/rate-limiter';

// ── Constants ───────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/x-pdf',
];
const TEXT_PREVIEW_LENGTH = 500; // Characters to return as preview

// ── POST handler ────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // 1. Authenticate
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // 2. Rate limit
    const rateLimitResult = uploadLimiter.check(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Upload rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse FormData
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') || formData.get('resume');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded. Please select a PDF file.' },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF files are accepted.',
          received: file.type,
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
          received: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        },
        { status: 400 }
      );
    }

    // 6. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Extract text from PDF
    let extractedData;
    try {
      extractedData = await extractTextFromPDF(buffer);
    } catch (parseError) {
      return NextResponse.json(
        { error: `PDF parsing failed: ${parseError.message}` },
        { status: 422 }
      );
    }

    // Validate extracted text has meaningful content
    if (!extractedData.text || extractedData.text.trim().length < 20) {
      return NextResponse.json(
        {
          error: 'Could not extract meaningful text from the PDF. ' +
                 'The file may be image-based or corrupted. ' +
                 'Please upload a text-based PDF.',
        },
        { status: 422 }
      );
    }

    // 8. Save to MongoDB
    await connectDB();

    const resume = await Resume.create({
      userId: user.id,
      fileName: file.name || 'resume.pdf',
      fileData: buffer,
      extractedText: extractedData.text,
      status: 'uploaded',
    });

    // 9. Update user's resume count
    await User.findByIdAndUpdate(user.id, {
      $inc: { resumeCount: 1 },
    });

    // 10. Return success with preview
    return NextResponse.json(
      {
        success: true,
        resumeId: resume._id.toString(),
        extractedText: extractedData.text.slice(0, TEXT_PREVIEW_LENGTH),
        metadata: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          numPages: extractedData.numPages,
          wordCount: extractedData.info.wordCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /resume/upload] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
