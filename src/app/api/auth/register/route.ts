import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register
 *
 * Registers a new user and creates a Candidate profile.
 *
 * Body: { email, password, firstName, lastName, phone? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + candidate in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: `${firstName} ${lastName}`,
          phone: phone ?? null,
          role: 'CANDIDATE',
        },
      });

      await tx.candidate.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          email,
          phone: phone ?? null,
          country: 'Kenya',
        },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}