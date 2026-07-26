/**
 * Resume Model
 * ============
 * Stores uploaded resumes and their AI analysis results.
 *
 * Lifecycle:  uploaded → processing → analyzed | error
 *
 * The `analysis` field holds the structured JSON returned by
 * Google Gemini after parsing the resume text.
 */

import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    // Owner reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Original upload metadata
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name too long'],
    },

    // Raw PDF binary — stored directly in the document.
    // For production at scale, consider GridFS or S3 instead.
    fileData: {
      type: Buffer,
    },

    // Text extracted from the PDF via pdf-parse
    extractedText: {
      type: String,
      default: '',
    },

    // Structured AI analysis result
    analysis: {
      type: Object,
      default: null,
      // Expected shape:
      // {
      //   score:         Number (0-100),
      //   skills:        [String],
      //   strengths:     [String],
      //   weaknesses:    [String],
      //   suggestions:   [String],
      //   technologies:  [String],
      //   missingSkills: [String],
      // }
    },

    // Top-level score for quick queries & sorting
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: null,
    },

    // Processing pipeline status
    status: {
      type: String,
      enum: {
        values: ['uploaded', 'processing', 'analyzed', 'error'],
        message: '{VALUE} is not a valid status',
      },
      default: 'uploaded',
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// -------------------------------------------------------------------
// Indexes
// -------------------------------------------------------------------
ResumeSchema.index({ userId: 1, createdAt: -1 }); // User's resumes, newest first
ResumeSchema.index({ status: 1 });                 // Filter by processing stage

// -------------------------------------------------------------------
// Export guard
// -------------------------------------------------------------------
const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

export default Resume;
