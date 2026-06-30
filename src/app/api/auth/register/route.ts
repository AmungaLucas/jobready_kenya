import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 },
      );
    }

    // Validate password strength (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Parse full name into first/last
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create User + Candidate in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'CANDIDATE',
        },
      });

      await tx.candidate.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          onboardingStatus: 'STARTED',
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[register] Failed:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}