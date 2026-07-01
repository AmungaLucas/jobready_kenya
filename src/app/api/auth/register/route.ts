import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, firstName, and lastName are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const candidate = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: `${firstName} ${lastName}`,
          phone: phone || null,
          role: "CANDIDATE",
          candidate: {
            create: {
              firstName,
              lastName,
              email,
              phone: phone || null,
              onboardingStatus: "STARTED",
              profile: {
                create: {
                  extractionStatus: "PENDING",
                },
              },
              preferences: {
                create: {},
              },
            },
          },
        },
        include: {
          candidate: true,
        },
      });

      return user.candidate;
    });

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}