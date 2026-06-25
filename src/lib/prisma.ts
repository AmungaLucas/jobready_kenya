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

// Connection pool limits for 10K+ req/s handling
// Prisma uses connection pooling via the connection URL parameters
// e.g., ?connection_limit=20&pool_timeout=30
// These are set in DATABASE_URL env var. The client itself reuses connections
// via the global singleton pattern above.

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;