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
    // Add query timeout to prevent hanging on Vercel serverless
    ...(process.env.DATABASE_URL?.startsWith('mysql') ? {
      transactionOptions: {
        timeout: 10000, // 10 second timeout for transactions
      },
    } : {}),
  });

  // In Vercel serverless, disconnect when the function is about to freeze
  // to release the MySQL connection back to the pool
  if (process.env.NODE_ENV === 'production') {
    // @ts-expect-error - Node.js runtime global
    const _original = globalThis.process;
    process.on('beforeExit', async () => {
      await client.$disconnect();
    });
  }

  return client;
}

// Singleton: ONE PrismaClient per serverless function instance.
// connection_limit=1 in DATABASE_URL ensures each instance uses exactly 1 MySQL connection.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;