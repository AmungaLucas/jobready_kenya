import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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

// Connection pool is configured via DATABASE_URL parameters:
//   ?connection_limit=3&pool_timeout=60
// The global singleton pattern above ensures a single PrismaClient instance
// per process, reusing connections across all requests.

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;