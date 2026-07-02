import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    ...(process.env.DATABASE_URL?.startsWith('mysql') ? {
      transactionOptions: {
        timeout: 10000, // 10 second timeout for transactions
      },
    } : {}),
  });

  // Graceful shutdown in production PM2 / long-lived processes
  if (process.env.NODE_ENV === 'production') {
    const cleanup = async () => {
      await client.$disconnect();
      process.exit(0);
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  return client;
}

// Singleton: ONE PrismaClient per process.
// For PM2 cluster, each worker gets its own connection pool.
// Set connection_limit=10 in DATABASE_URL for PM2 (not connection_limit=1 which is for Vercel serverless).
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;