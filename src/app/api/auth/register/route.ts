import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

const registerSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long")
    .transform((v) => v.trim()),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]{7,20}$/, "Please enter a valid phone number")
    .optional()
    .nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

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