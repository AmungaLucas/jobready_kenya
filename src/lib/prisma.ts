import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In production (Vercel serverless), each function instance is a separate process.
// The global singleton ensures ONE PrismaClient per instance.
// connection_limit is set to 1 via DATABASE_URL to avoid exhausting MySQL
// max_user_connections across concurrent serverless instances.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;