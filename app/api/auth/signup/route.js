/**
 * Signup API Route
 * ================
 * POST /api/auth/signup
 *
 * Accepts { name, email, password } and creates a new user
 * with a bcrypt-hashed password.
 *
 * Validations:
 *  - All fields required
 *  - Email format check
 *  - Password minimum 8 characters
 *  - Duplicate email check
 *
 * Returns 201 on success, 400/409/500 on error.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Number of bcrypt salt rounds — 12 is a strong default
const SALT_ROUNDS = 12;

export async function POST(request) {
  try {
    // ── Parse body ─────────────────────────────────────────────
    const body = await request.json();
    const { name, email, password } = body;

    // ── Input validation ───────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Trim and normalize
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // ── Database operations ────────────────────────────────────
    await connectDB();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user document
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    // ── Success response (never expose the password hash) ──────
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Mongoose duplicate key error (race condition fallback)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
