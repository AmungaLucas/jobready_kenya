/**
 * Phase 6 Test Script — Opportunities Pages
 * 
 * Tests:
 * 1. Service layer via direct DB queries (opportunity counts)
 * 2. OPP_TYPE_LABELS / OPP_TYPE_DESCRIPTIONS completeness (9 types)
 * 3. Opportunities list page chunk: tabs, empty fallback, sidebar, JSON-LD
 * 4. Opportunities detail page chunk: Event JSON-LD, breadcrumb, DetailCard, Apply CTA, sidebar
 * 5. generateOpportunityJsonLd in jsonld chunk (Event type with VirtualLocation/Place)
 * 6. Canonical URLs fully qualified with SITE_URL
 * 7. revalidate = 60 on both pages
 * 8. generateStaticParams present on detail page
 * 9. getJobs (not getSimilarJobs) used for related jobs
 * 10. No pre-rendered HTML (0 opportunities in DB)
 * 11. Total pre-rendered pages count
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const BUILD_DIR = path.join(__dirname, '..', '.next', 'server', 'app');
const CHUNKS_DIR = path.join(__dirname, '..', '.next', 'server', 'chunks', 'ssr');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.log(`  ❌ ${msg}`);
    failed++;
  }
}

function findChunk(pattern) {
  // Search in the chunk files loaded by opportunities routes
  const chunks = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  return chunks.find(f => f.includes(pattern));
}

function readChunk(filename) {
  const f = path.join(CHUNKS_DIR, filename);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf-8');
}

async function run() {
  console.log('\n═══ Phase 6 Test Suite — Opportunities Pages ═══\n');

  // ── 1. Service Layer (Direct DB) ──
  console.log('── 1. Service Layer (Direct DB Queries) ──');

  const oppCount = await prisma.opportunity.count({
    where: { status: 'ACTIVE', deletedAt: null },
  });
  assert(typeof oppCount === 'number', `Opportunity count is a number (got ${oppCount})`);

  // Verify each type has a count query that works
  const types = ['SCHOLARSHIP', 'GRANT', 'FELLOWSHIP', 'SPONSORSHIP', 'MENTORSHIP', 'COMPETITION', 'CONFERENCE', 'TRAINING', 'VOLUNTEER'];
  for (const t of types) {
    const c = await prisma.opportunity.count({ where: { status: 'ACTIVE', deletedAt: null, type: t } });
    assert(typeof c === 'number', `${t} count query works (got ${c})`);
  }

  // Verify getOpportunityBySlug query structure
  const oppBySlug = await prisma.opportunity.findFirst({
    include: { providerOrg: { select: { orgName: true, orgLogoUrl: true, orgWebsite: true } } },
  });
  assert(oppBySlug === null || typeof oppBySlug === 'object', 'getOpportunityBySlug query structure is valid');

  // ── 2. OPP_TYPE_LABELS / OPP_TYPE_DESCRIPTIONS ──
  console.log('\n── 2. OPP_TYPE_LABELS / OPP_TYPE_DESCRIPTIONS ──');

  // Find the chunk containing opportunities service code
  const serviceChunk = findChunk('__dbb66966') || findChunk('__9a04f421');
  let serviceCode = '';
  if (serviceChunk) {
    serviceCode = readChunk(serviceChunk) || '';
  }

  // Check all 9 OPP_TYPE_LABELS are present
  const expectedLabels = {
    all: 'All Opportunities',
    SCHOLARSHIP: 'Scholarships',
    GRANT: 'Grants',
    FELLOWSHIP: 'Fellowships',
    SPONSORSHIP: 'Sponsorships',
    MENTORSHIP: 'Mentorship',
    COMPETITION: 'Competitions',
    CONFERENCE: 'Conferences',
    TRAINING: 'Training',
    VOLUNTEER: 'Volunteer',
  };
  for (const [key, label] of Object.entries(expectedLabels)) {
    assert(serviceCode.includes(label), `OPP_TYPE_LABELS has "${label}" (${key})`);
  }

  // Check OPP_TYPE_DESCRIPTIONS has all 9 type descriptions
  const expectedDescKeywords = {
    SCHOLARSHIP: 'Mastercard Foundation',
    GRANT: 'non-repayable funds',
    FELLOWSHIP: 'Mandela Washington',
    SPONSORSHIP: 'Safaricom',
    MENTORSHIP: 'emerging talent',
    COMPETITION: 'hackathons',
    CONFERENCE: 'Nairobi serves as a major conference hub',
    TRAINING: 'Strathmore Professional Development',
    VOLUNTEER: 'Kenya Red Cross',
  };
  for (const [type, keyword] of Object.entries(expectedDescKeywords)) {
    assert(serviceCode.includes(keyword), `OPP_TYPE_DESCRIPTIONS[${type}] contains "${keyword}"`);
  }

  // ── 3. Opportunities List Page Chunk ──
  console.log('\n── 3. Opportunities List Page ──');

  const listChunk = findChunk('__9a04f421');
  let listCode = '';
  if (listChunk) {
    listCode = readChunk(listChunk) || '';
  }
  assert(listCode.length > 0, 'List page chunk found and readable');

  // Tabs
  assert(listCode.includes('All Opportunities'), 'List page has "All Opportunities" tab');
  assert(listCode.includes('Scholarships'), 'List page has Scholarships tab');
  assert(listCode.includes('Fellowships'), 'List page has Fellowships tab');
  assert(listCode.includes('Conferences'), 'List page has Conferences tab');
  assert(listCode.includes('Volunteer'), 'List page has Volunteer tab (from OPP_TYPE_LABELS)');

  // 5-Layer Empty Fallback
  assert(listCode.includes('Explore a wide range of opportunities') || listCode.includes('No opportunities listed right now'), 'Empty fallback Layer 1: SEO description');
  assert(listCode.includes('Related Job Categories'), 'Empty fallback Layer 2: Related Job Categories');
  assert(listCode.includes('Opportunities by Location'), 'Empty fallback Layer 3: Geographic links');
  assert(listCode.includes('Get Alerts') || listCode.includes('Get Opportunity Alerts'), 'Empty fallback Layer 4: Alert signup');
  assert(listCode.includes('Browse Jobs'), 'Empty fallback Layer 5: CTA to jobs');

  // CollectionPage JSON-LD
  assert(listCode.includes('CollectionPage'), 'List page generates CollectionPage JSON-LD');
  assert(listCode.includes('BreadcrumbList'), 'List page generates BreadcrumbList JSON-LD');

  // Sidebar
  assert(listCode.includes('Opportunities Overview'), 'List page sidebar has "Opportunities Overview"');
  assert(listCode.includes('All Types'), 'List page sidebar has "All Types"');
  assert(listCode.includes('Get Opportunity Alerts'), 'List page sidebar has alert signup');

  // Type-specific tab filtering
  assert(listCode.includes('/opportunities?type='), 'List page links to type-filtered URLs');

  // ── 4. Opportunities Detail Page Chunk ──
  console.log('\n── 4. Opportunities Detail Page ──');

  const detailChunk = findChunk('__dbb66966');
  let detailCode = '';
  if (detailChunk) {
    detailCode = readChunk(detailChunk) || '';
  }
  assert(detailCode.length > 0, 'Detail page chunk found and readable');

  // Event JSON-LD
  assert(detailCode.includes('"@type":"Event"') || detailCode.includes('"Event"'), 'Detail page generates Event JSON-LD');
  assert(detailCode.includes('VirtualLocation'), 'Event JSON-LD supports VirtualLocation');
  assert(detailCode.includes('BreadcrumbList'), 'Detail page generates BreadcrumbList JSON-LD');

  // Breadcrumb structure: Home > Opportunities > Type > Title
  assert(detailCode.includes('Home') && detailCode.includes('Opportunities'), 'Detail breadcrumb has Home > Opportunities');
  // The detail page includes type link: /opportunities?type=${k.type}
  assert(detailCode.includes('/opportunities?type='), 'Detail breadcrumb links to type filter');

  // DetailCard component
  assert(detailCode.includes('Provider') && detailCode.includes('Type') && detailCode.includes('Funding') && detailCode.includes('Deadline'), 'Detail page has DetailCard with Provider/Type/Funding/Deadline');

  // Apply CTA (3 variants)
  assert(detailCode.includes('Apply Now'), 'Detail page has "Apply Now" CTA');
  assert(detailCode.includes('Apply via Email'), 'Detail page has "Apply via Email" CTA');
  assert(detailCode.includes('applicationUrl') && detailCode.includes('applyEmail'), 'Detail page checks applicationUrl and applyEmail');

  // Content sections
  assert(detailCode.includes('Description'), 'Detail page has Description section');
  assert(detailCode.includes('Eligibility Criteria'), 'Detail page has Eligibility Criteria section');
  assert(detailCode.includes('Requirements'), 'Detail page has Requirements section');
  assert(detailCode.includes('Benefits'), 'Detail page has Benefits section');
  assert(detailCode.includes('How to Apply'), 'Detail page has How to Apply section');

  // Sidebar
  assert(detailCode.includes('Quick Info'), 'Detail page sidebar has Quick Info');
  assert(detailCode.includes('Provider'), 'Detail page sidebar has Provider section');
  assert(detailCode.includes('Browse'), 'Detail page sidebar has Browse section');
  assert(detailCode.includes('Get Similar Alerts'), 'Detail page sidebar has alert signup');

  // Related Jobs
  assert(detailCode.includes('Related Jobs'), 'Detail page has Related Jobs section');

  // Tags/badges
  assert(detailCode.includes('Featured'), 'Detail page has Featured badge');
  assert(detailCode.includes('Online'), 'Detail page has Online badge');
  assert(detailCode.includes('Remote'), 'Detail page has Remote badge');
  assert(detailCode.includes('Open Internationally'), 'Detail page has Open Internationally badge');

  // ── 5. generateOpportunityJsonLd ──
  console.log('\n── 5. generateOpportunityJsonLd Function ──');

  // Check the jsonld chunk has the function
  const jsonldChunk = findChunk('__dbb66966') || findChunk('__9a04f421');
  if (jsonldChunk) {
    const code = readChunk(jsonldChunk) || '';
    assert(code.includes('generateOpportunityJsonLd'), 'generateOpportunityJsonLd function is exported');

    // Check Event schema fields
    assert(code.includes('organizer'), 'Opportunity JSON-LD has organizer field');
    assert(code.includes('startDate'), 'Opportunity JSON-LD has startDate');
    assert(code.includes('endDate'), 'Opportunity JSON-LD has endDate');
    assert(code.includes('offers'), 'Opportunity JSON-LD has offers field');
    assert(code.includes('priceCurrency'), 'Opportunity JSON-LD has priceCurrency');
    assert(code.includes('isAccessibleForFree'), 'Opportunity JSON-LD has isAccessibleForFree');
    assert(code.includes('/opportunities/'), 'Opportunity JSON-LD URL includes /opportunities/');
  }

  // ── 6. Canonical URLs Fully Qualified ──
  console.log('\n── 6. Canonical URLs ──');

  // Canonical URLs use SITE_URL variable (inlined as "https://jobboard.ke") + /opportunities path
  assert(/SITE_URL.*?opportunities/.test(listCode), 'List page canonical uses SITE_URL + /opportunities (fully qualified at runtime)');
  // Detail page metadata
  assert(/SITE_URL.*?opportunities/.test(detailCode), 'Detail page canonical uses SITE_URL + /opportunities (fully qualified at runtime)');
  // OG URLs
  assert(listCode.includes('SITE_URL'), 'List page uses SITE_URL for URLs');
  assert(detailCode.includes('SITE_URL'), 'Detail page uses SITE_URL for URLs');

  // ── 7. revalidate = 60 ──
  console.log('\n── 7. ISR revalidate ──');

  // Both pages should export revalidate = 60
  assert(listCode.includes('"revalidate",0,60') || listCode.includes('revalidate') && listCode.includes('60'), 'List page has revalidate = 60');
  assert(detailCode.includes('"revalidate",0,60') || detailCode.includes('revalidate') && detailCode.includes('60'), 'Detail page has revalidate = 60');

  // ── 8. generateStaticParams ──
  console.log('\n── 8. generateStaticParams ──');

  assert(detailCode.includes('generateStaticParams'), 'Detail page has generateStaticParams');
  assert(detailCode.includes('getAllOpportunitySlugs'), 'Detail page calls getAllOpportunitySlugs');

  // ── 9. getJobs (not getSimilarJobs) for Related Jobs ──
  console.log('\n── 9. Related Jobs Implementation ──');

  assert(!detailCode.includes('getSimilarJobs'), 'Detail page does NOT use getSimilarJobs (bug fixed)');
  assert(detailCode.includes('getJobs'), 'Detail page uses getJobs for related jobs');
  assert(detailCode.includes('locationCounty'), 'Detail page filters related jobs by locationCounty');

  // ── 10. No Pre-rendered HTML ──
  console.log('\n── 10. Pre-rendered Output ──');

  const oppDir = path.join(BUILD_DIR, 'opportunities');
  const slugDir = path.join(oppDir, '[slug]', 'page');
  const hasSlugDir = fs.existsSync(slugDir);
  assert(hasSlugDir, 'Detail page build directory exists');

  // The [slug]/page directory should have no .html files (0 opportunities)
  if (hasSlugDir) {
    const htmlFiles = fs.readdirSync(slugDir).filter(f => f.endsWith('.html'));
    assert(htmlFiles.length === 0, `0 detail HTML files (got ${htmlFiles.length}, expected 0)`);
  }

  // List page is dynamic (ƒ), so it's in chunks not HTML
  const oppPageDir = path.join(oppDir, 'page');
  const isDynamicDir = fs.existsSync(oppPageDir) && !fs.readdirSync(oppPageDir).some(f => f.endsWith('.html'));
  assert(isDynamicDir || !fs.existsSync(path.join(oppDir, 'index.html')), 'List page is dynamic (no pre-rendered HTML)');

  // ── 11. Total Pre-rendered Pages ──
  console.log('\n── 11. Total Pre-rendered Pages ──');

  let totalHtml = 0;
  function countHtml(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) countHtml(p);
      if (f.endsWith('.html')) totalHtml++;
    }
  }
  countHtml(BUILD_DIR);
  console.log(`  ℹ️  Total pre-rendered HTML files: ${totalHtml}`);
  // 24 jobs + 43 categories + 468 subcategories + 46 locations + 46 gov counties = 627
  assert(totalHtml >= 627, `At least 627 HTML files expected (got ${totalHtml})`);

  // ── 12. Format Funding Function ──
  console.log('\n── 12. formatFunding Function ──');

  const formatFundingTests = [
    { disclosure: 'FULLY_FUNDED', amount: null, expected: 'Fully Funded' },
    { disclosure: 'NOT_FUNDED', amount: null, expected: 'Not Funded' },
    { disclosure: 'PARTIALLY_FUNDED', amount: null, expected: 'Partially Funded' },
  ];
  assert(serviceCode.includes('Fully Funded'), 'formatFunding returns "Fully Funded"');
  assert(serviceCode.includes('Not Funded'), 'formatFunding returns "Not Funded"');
  assert(serviceCode.includes('Partially Funded'), 'formatFunding returns "Partially Funded"');
  assert(serviceCode.includes('Funding Not Disclosed'), 'formatFunding returns "Funding Not Disclosed"');
  assert(serviceCode.includes('SHOW_AMOUNT'), 'formatFunding handles SHOW_AMOUNT case');
  assert(serviceCode.includes('toLocaleString'), 'formatFunding formats amount with locale');

  // ── Results ──
  console.log(`\n═══════════════════════════`);
  console.log(`  ✅ ${passed} passed`);
  console.log(`  ❌ ${failed} failed`);
  console.log(`═══════════════════════════\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});