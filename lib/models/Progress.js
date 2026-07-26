/**
 * Progress Model
 * ==============
 * Aggregated progress tracker — one document per user.
 *
 * Stores:
 *  - Skill proficiency levels (name + level + category)
 *  - Historical interview & resume scores for charting
 *  - Weak / strong areas identified by AI
 *  - AI-generated learning roadmap
 *  - Computed totals (totalInterviews, averageScore)
 */

import mongoose from 'mongoose';

// -------------------------------------------------------------------
// Sub-schemas
// -------------------------------------------------------------------

/** Individual skill proficiency */
const SkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      // e.g., 'Frontend', 'Backend', 'DevOps', 'Soft Skills'
    },
  },
  { _id: false }
);

/** Interview score data-point for charts */
const InterviewScoreSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100, required: true },
    role: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/** Resume score data-point for charts */
const ResumeScoreSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100, required: true },
  },
  { _id: false }
);

// -------------------------------------------------------------------
// Main schema
// -------------------------------------------------------------------

const ProgressSchema = new mongoose.Schema(
  {
    // One-to-one relationship with User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },

    // Skill proficiency breakdown
    skills: {
      type: [SkillSchema],
      default: [],
    },

    // AI-identified areas
    weakAreas: {
      type: [String],
      default: [],
    },
    strongAreas: {
      type: [String],
      default: [],
    },

    // Score history for Recharts line/area charts
    interviewScores: {
      type: [InterviewScoreSchema],
      default: [],
    },
    resumeScores: {
      type: [ResumeScoreSchema],
      default: [],
    },

    // AI-generated structured learning roadmap
    roadmap: {
      type: Object,
      default: null,
      // Expected shape:
      // {
      //   title:       String,
      //   description: String,
      //   milestones: [
      //     {
      //       title:     String,
      //       topics:    [String],
      //       resources: [String],
      //       duration:  String,   // e.g., "2 weeks"
      //       completed: Boolean,
      //     },
      //   ],
      // }
    },

    // Aggregate counters
    totalInterviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true, // updatedAt is especially useful here
  }
);

// -------------------------------------------------------------------
// Export guard
// -------------------------------------------------------------------
const Progress =
  mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

export default Progress;
