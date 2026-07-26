/**
 * User Model
 * ==========
 * Core user document for SkillScan AI.
 * Supports both OAuth (Google) and credentials-based sign-in.
 * Password is optional — OAuth users won't have one.
 *
 * Fields:
 *  - name, email, password (hashed), image
 *  - role:           'user' | 'admin'
 *  - resumeCount:    total resumes analyzed
 *  - interviewCount: total mock interviews taken
 *  - totalScore:     cumulative score for quick averages
 */

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },

    // Hashed password — null/undefined for OAuth-only users
    password: {
      type: String,
      select: false, // Never returned in queries by default
    },

    image: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },

    // Usage counters
    resumeCount: { type: Number, default: 0, min: 0 },
    interviewCount: { type: Number, default: 0, min: 0 },
    totalScore: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// -------------------------------------------------------------------
// Indexes
// -------------------------------------------------------------------
// Email is already unique, but an explicit index helps query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// -------------------------------------------------------------------
// Export guard — prevents model recompilation on Next.js hot reloads
// -------------------------------------------------------------------
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
