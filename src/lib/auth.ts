import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On sign-in, attach user role and look up candidateId
      if (user) {
        token.userId = user.id;
        token.role = 'CANDIDATE';
        token.email = user.email;
        token.name = user.name;

        // Look up the candidate record linked to this user
        try {
          const candidate = await prisma.candidate.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          token.candidateId = candidate?.id ?? null;
        } catch {
          // DB might not be available during build; candidateId stays null
          token.candidateId = null;
        }
      }

      // Handle session update (e.g., after profile edit)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.userId;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).candidateId = token.candidateId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};