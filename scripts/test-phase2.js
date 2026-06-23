const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const errors = [];
  const passes = [];

  // ========== TEST 1: Job slug lookup (the 404) ==========
  try {
    const job = await prisma.job.findFirst({
      where: { slug: 'temporary-admin-assistant-world-vision-nakuru', status: 'ACTIVE', deletedAt: null },
      include: {
        organization: { select: { orgName: true, orgSlug: true, orgLogoUrl: true, orgWebsite: true, orgDescription: true, orgIndustry: true, orgType: true, headquarters: true } },
        category: { select: { label: true, slug: true, value: true } },
        subcategory: { select: { label: true, slug: true } },
      },
    });
    if (job) {
      passes.push('TEST 1: Job slug lookup - FOUND');
    } else {
      errors.push('TEST 1: Job slug lookup - NOT FOUND (404 would occur)');
    }
  } catch (e) {
    errors.push(`TEST 1: Job slug lookup - ERROR: ${e.message}`);
  }

  // ========== TEST 2: Location filter (the Prisma error) ==========
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        locationCity: { contains: 'nairobi' },
      },
      select: { title: true, slug: true },
      take: 5,
    });
    passes.push(`TEST 2: Location filter (no mode:insensitive) - ${jobs.length} jobs found`);
  } catch (e) {
    errors.push(`TEST 2: Location filter - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 3: County filter with slug resolution ==========
  try {
    const locationRecord = await prisma.location.findUnique({ where: { slug: 'nairobi' }, select: { county: true } });
    let countyName = 'Nairobi';
    if (locationRecord) countyName = locationRecord.county;

    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        locationCounty: countyName,
      },
      select: { title: true, slug: true },
      take: 5,
    });
    passes.push(`TEST 3: County filter (slug "nairobi" -> "${countyName}") - ${jobs.length} jobs found`);
  } catch (e) {
    errors.push(`TEST 3: County filter - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 4: Base jobs query ==========
  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { title: true, slug: true },
        orderBy: { datePosted: 'desc' },
        skip: 0,
        take: 20,
      }),
      prisma.job.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    ]);
    passes.push(`TEST 4: Base listing query - ${jobs.length} of ${total} total jobs`);
  } catch (e) {
    errors.push(`TEST 4: Base listing - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 5: Similar jobs query (uses categoryId) ==========
  try {
    const job = await prisma.job.findFirst({
      where: { slug: 'senior-software-engineer-safaricom-nairobi' },
      select: { id: true, categoryId: true, locationCounty: true },
    });
    if (job && job.categoryId) {
      const similar = await prisma.job.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          id: { not: job.id },
          categoryId: job.categoryId,
        },
        select: { title: true, slug: true },
        take: 3,
      });
      passes.push(`TEST 5: Similar jobs (categoryId) - ${similar.length} similar found`);
    } else {
      errors.push(`TEST 5: Similar jobs - job has no categoryId`);
    }
  } catch (e) {
    errors.push(`TEST 5: Similar jobs - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 6: Employment type filter ==========
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        employmentType: 'INTERNSHIP',
      },
      select: { title: true, slug: true },
    });
    passes.push(`TEST 6: Employment type filter (INTERNSHIP) - ${jobs.length} jobs found`);
  } catch (e) {
    errors.push(`TEST 6: Employment type filter - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 7: Category filter ==========
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        OR: [
          { category: { slug: 'technology' } },
          { category: { value: 'TECHNOLOGY' } },
          { subcategory: { slug: 'technology' } },
        ],
      },
      select: { title: true, slug: true },
    });
    passes.push(`TEST 7: Category filter (technology) - ${jobs.length} jobs found`);
  } catch (e) {
    errors.push(`TEST 7: Category filter - ERROR: ${e.message.substring(0, 200)}`);
  }

  // ========== TEST 8: generateStaticParams ==========
  try {
    const slugs = await prisma.job.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { slug: true },
    });
    passes.push(`TEST 8: generateStaticParams - ${slugs.length} slugs for ISR`);
  } catch (e) {
    errors.push(`TEST 8: generateStaticParams - ERROR: ${e.message.substring(0, 200)}`);
  }

  // Print results
  console.log('\n=============================');
  console.log('  TEST RESULTS');
  console.log('=============================\n');
  passes.forEach(p => console.log('  \x1b[32mPASS\x1b[0m  ' + p));
  if (errors.length) {
    console.log('');
    errors.forEach(e => console.log('  \x1b[31mFAIL\x1b[0m  ' + e));
  }
  console.log('\n=============================');
  console.log(`  ${passes.length} passed, ${errors.length} failed`);
  console.log('=============================\n');

  await prisma.$disconnect();
}

test().catch(e => { console.error(e); process.exit(1); });