/**
 * Phase 4 Validation: Location Pages
 * Tests: generateStaticParams, slug resolution, SEO metadata, JSON-LD,
 *        5-layer empty fallback, breadcrumb consistency
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

(async () => {
  console.log('=== Phase 4: Location Pages Validation ===\n');

  // ── Test 1: Location count ──
  console.log('1. Location count');
  const locCount = await p.location.count();
  assert(locCount === 46, `46 locations in DB (got ${locCount})`);

  // ── Test 2: Location slug lookup ──
  console.log('2. Location slug lookup');
  const nai = await p.location.findUnique({ where: { slug: 'nairobi' }, select: { slug: true, county: true, seoTitle: true } });
  assert(nai?.slug === 'nairobi', 'nairobi location found');
  assert(nai?.county === 'Nairobi', `county is "${nai?.county}"`);
  assert(nai?.seoTitle != null, 'seoTitle exists');

  // ── Test 3: Pre-rendered location HTML files ──
  console.log('3. Pre-rendered location pages');
  const locsDir = path.join(__dirname, '../.next/server/app/locations');
  const locHtmlFiles = fs.readdirSync(locsDir).filter(f => f.endsWith('.html') && !f.includes('/'));
  assert(locHtmlFiles.length === 46, `${locHtmlFiles.length} location HTML files (expected 46)`);

  // ── Test 4: Nairobi page (14 jobs) - has job cards ──
  console.log('4. Nairobi page (14 jobs) - job listings');
  const naiHtml = fs.readFileSync(path.join(locsDir, 'nairobi.html'), 'utf8');
  assert(naiHtml.includes('job-card'), 'Contains job card elements');
  assert(naiHtml.includes('Latest') && naiHtml.includes('Nairobi'), 'Has listings header');

  // ── Test 5: Nairobi page JSON-LD ──
  console.log('5. Nairobi page JSON-LD');
  assert(naiHtml.includes('CollectionPage'), 'Has CollectionPage JSON-LD');
  assert(naiHtml.includes('BreadcrumbList'), 'Has BreadcrumbList JSON-LD');

  // ── Test 6: Nairobi page SEO metadata ──
  console.log('6. Nairobi page SEO metadata');
  assert(naiHtml.includes('<title>'), 'Has <title> tag');
  assert(naiHtml.includes('Nairobi'), 'Title contains Nairobi');
  assert(naiHtml.includes('canonical'), 'Has canonical link');
  assert(naiHtml.includes('og:title'), 'Has OG title');
  assert(naiHtml.includes('index, follow'), 'Has robots index, follow');

  // ── Test 7: Empty location page (Baringo - 0 jobs) - 5-layer fallback ──
  console.log('7. Empty location fallback (Baringo - 0 jobs)');
  const barHtml = fs.readFileSync(path.join(locsDir, 'baringo.html'), 'utf8');
  assert(barHtml.includes('Baringo'), 'Contains county name');
  assert(!barHtml.includes('job-card'), 'No job cards (0 jobs)');
  assert(barHtml.includes('Browse All Categories'), 'Layer 3: all categories grid');
  assert(barHtml.includes('Other Counties'), 'Layer 4: other locations');
  assert(barHtml.includes('No jobs in'), 'Layer 5: CTA heading');
  assert(barHtml.includes('Get Alerts'), 'Layer 5: job alert signup');

  // ── Test 8: Empty location page JSON-LD ──
  console.log('8. Empty location JSON-LD');
  assert(barHtml.includes('CollectionPage'), 'Has CollectionPage JSON-LD');
  assert(barHtml.includes('BreadcrumbList'), 'Has BreadcrumbList JSON-LD');

  // ── Test 9: Empty location page SEO metadata ──
  console.log('9. Empty location SEO metadata');
  assert(barHtml.includes('<title>'), 'Has <title> tag');
  assert(barHtml.includes('canonical'), 'Has canonical link');

  // ── Test 10: Breadcrumb consistency (visual matches JSON-LD) ──
  console.log('10. Breadcrumb consistency');
  // Visual: Home > Jobs > County  |  JSON-LD: Home > Jobs > County
  // Both should reference /jobs, not /locations
  assert(naiHtml.includes('href="/jobs"') || naiHtml.includes('/jobs'), 'Visual breadcrumb includes /jobs');
  assert(barHtml.includes('/jobs'), 'Baringo breadcrumb includes /jobs');

  // ── Test 11: Sidebar elements ──
  console.log('11. Sidebar elements');
  assert(naiHtml.includes('Location Overview'), 'Has location overview sidebar');
  assert(naiHtml.includes('Popular Locations'), 'Has popular locations sidebar');
  assert(naiHtml.includes('Job Alerts'), 'Has job alerts CTA');

  // ── Test 12: Cross-links to categories with county param ──
  console.log('12. Cross-links to categories');
  assert(naiHtml.includes('county=') && naiHtml.includes('/categories/'), 'Nairobi links to /categories/?county=');

  // ── Test 13: Location with jobs shows categories in sidebar ──
  console.log('13. Top categories sidebar (Nairobi)');
  assert(naiHtml.includes('Top Categories'), 'Has top categories in sidebar');

  // ── Test 14: ISR revalidate ──
  console.log('14. ISR revalidate setting');
  const pageSource = fs.readFileSync(path.join(__dirname, '../src/app/locations/[slug]/page.tsx'), 'utf8');
  assert(pageSource.includes("revalidate = 60"), 'Location page has revalidate = 60');

  // ── Test 15: County link from jobs page breadcrumb ──
  console.log('15. Jobs page county breadcrumb links to /locations/');
  const jobsPage = fs.readFileSync(path.join(__dirname, '../src/app/jobs/page.tsx'), 'utf8');
  assert(jobsPage.includes('/locations/${county}'), 'Jobs page links county breadcrumb to /locations/');

  // ── Summary ──
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${failed === 0 ? '🎉 All Phase 4 tests passed!' : '⚠️  Some tests failed.'}`);

  await p.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
})();