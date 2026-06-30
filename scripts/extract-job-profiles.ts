/**
 * Batch job profile extraction script.
 *
 * Connects to the production MySQL database and extracts structured
 * profiles (skills, qualifications, categories, etc.) from all active
 * job descriptions that don't yet have a JobProfile.
 *
 * Usage:
 *   bun run scripts/extract-job-profiles.ts [--limit N] [--offset N] [--delay Ms]
 *
 * Examples:
 *   bun run scripts/extract-job-profiles.ts              # Extract first 50 pending jobs
 *   bun run scripts/extract-job-profiles.ts --limit 200  # Extract up to 200 jobs
 *   bun run scripts/extract-job-profiles.ts --limit 10 --delay 2000  # Slow mode
 */

import { PrismaClient } from '@prisma/client';
import { extractJobsBatch } from '../src/lib/extraction/job-extractor';

// Use production MySQL connection
const DATABASE_URL =
  process.env.DATABASE_URL ??
  'mysql://jobready_kenya_db_admin:Admincyber@d7.my-control-panel.com:3306/jobready_kenya_db?connection_limit=1&pool_timeout=60';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

async function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  let limit = 50;
  let offset = 0;
  let delayMs = 500;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1], 10);
    if (args[i] === '--offset' && args[i + 1]) offset = parseInt(args[i + 1], 10);
    if (args[i] === '--delay' && args[i + 1]) delayMs = parseInt(args[i + 1], 10);
  }

  console.log('=== Job Profile Batch Extraction ===');
  console.log(`Limit: ${limit}, Offset: ${offset}, Delay: ${delayMs}ms\n`);

  const result = await extractJobsBatch({ limit, offset, delayMs });

  console.log(`\n=== Final Results ===`);
  console.log(`Processed: ${result.processed}`);
  console.log(`Succeeded: ${result.succeeded}`);
  console.log(`Failed:    ${result.failed}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  process.exit(1);
});