/**
 * Phase 5 Test Script — Government Jobs + Canonical URL Fix Validation
 * 
 * Tests:
 * 1. Government jobs service layer (DB queries)
 * 2. Canonical URLs are fully qualified across ALL pages
 * 3. Breadcrumb ordering on /government-jobs
 * 4. GovernmentJobs component county filter
 * 5. JSON-LD structure (CollectionPage + BreadcrumbList)
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const BUILD_DIR = path.join(__dirname, '..', '.next', 'server', 'app');

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

// Helper to read a pre-rendered HTML file
function readHtml(route) {
  const p = path.join(BUILD_DIR, route, 'page');
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');
  // Try with .html
  const pH = path.join(BUILD_DIR, route + '.html');
  if (fs.existsSync(pH)) return fs.readFileSync(pH, 'utf-8');
  return null;
}

async function run() {
  console.log('\n═══ Phase 5 Test Suite ═══\n');

  // ── 1. Government Jobs Service Layer ──
  console.log('── 1. Government Jobs Service Layer ──');

  // Count government organizations
  const govOrgs = await prisma.organization.findMany({
    where: { orgType: { in: ['NATIONAL_GOVERNMENT', 'COUNTY_GOVERNMENT', 'STATE_CORPORATION', 'REGULATORY_AUTHORITY'] } },
    select: { orgType: true },
  });
  const govOrgCounts = {};
  govOrgs.forEach(o => { govOrgCounts[o.orgType] = (govOrgCounts[o.orgType] || 0) + 1; });
  console.log(`  ℹ️  Government orgs by type: ${JSON.stringify(govOrgCounts)}`);

  // Count government jobs
  const govJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      organization: { orgType: { in: ['NATIONAL_GOVERNMENT', 'COUNTY_GOVERNMENT', 'STATE_CORPORATION', 'REGULATORY_AUTHORITY'] } },
    },
    select: { id: true, organization: { select: { orgType: true, orgName: true } } },
  });
  const govJobByType = {};
  govJobs.forEach(j => { const t = j.organization?.orgType || 'UNKNOWN'; govJobByType[t] = (govJobByType[t] || 0) + 1; });
  console.log(`  ℹ️  Government jobs by type: ${JSON.stringify(govJobByType)}`);
  assert(govJobs.length > 0, 'Government jobs exist in DB');

  // Verify county government filter works correctly
  const countyGovJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      organization: { orgType: 'COUNTY_GOVERNMENT' },
    },
    select: { id: true, organization: { select: { orgType: true } } },
  });
  assert(countyGovJobs.every(j => j.organization?.orgType === 'COUNTY_GOVERNMENT'), 'County gov filter only returns COUNTY_GOVERNMENT org type');

  // Verify old broken filter would return different results
  const brokenFilter = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      locationCounty: { not: 'Nairobi' },
    },
    select: { id: true },
  });
  // These should be different (the fix matters)
  if (countyGovJobs.length !== brokenFilter.length) {
    console.log(`  ℹ️  Fixed filter (${countyGovJobs.length}) vs broken filter (${brokenFilter.length}) — counts differ as expected`);
  }

  // ── 2. Canonical URLs Fully Qualified (Pre-rendered pages) ──
  console.log('\n── 2. Canonical URLs Are Fully Qualified ──');

  // Test a job detail page
  const jobHtml = readHtml('jobs/project-coordinator-unicef-nairobi');
  if (jobHtml) {
    assert(jobHtml.includes('https://jobboard.ke/jobs/project-coordinator-unicef-nairobi'), 'Job detail canonical URL is fully qualified');
  } else {
    console.log('  ⚠️  Job detail HTML not found (skipping)');
  }

  // Test a category page
  const catHtml = readHtml('categories/technology');
  if (catHtml) {
    assert(catHtml.includes('https://jobboard.ke/categories/technology'), 'Category canonical URL is fully qualified');
  } else {
    console.log('  ⚠️  Category HTML not found (skipping)');
  }

  // Test a subcategory page
  const subcatHtml = readHtml('categories/technology/software-engineering');
  if (subcatHtml) {
    assert(subcatHtml.includes('https://jobboard.ke/categories/technology/software-engineering'), 'Subcategory canonical URL is fully qualified');
  } else {
    console.log('  ⚠️  Subcategory HTML not found (skipping)');
  }

  // Test a location page
  const locHtml = readHtml('locations/nairobi');
  if (locHtml) {
    assert(locHtml.includes('https://jobboard.ke/locations/nairobi'), 'Location canonical URL is fully qualified');
  } else {
    console.log('  ⚠️  Location HTML not found (skipping)');
  }

  // ── 3. No Relative Canonical URLs ──
  console.log('\n── 3. No Relative Canonical URLs in Pre-rendered Pages ──');

  // Check that no page has a relative canonical (starting with "/" but not "https://")
  const pagesToCheck = [
    'jobs/project-coordinator-unicef-nairobi',
    'categories/technology',
    'categories/technology/software-engineering',
    'locations/nairobi',
  ];

  let foundRelativeCanonical = false;
  for (const route of pagesToCheck) {
    const html = readHtml(route);
    if (!html) continue;
    // Look for rel="canonical" followed by a relative href (starts with /)
    const canonicalMatch = html.match(/rel="canonical"[^>]*href="([^"]+)"/g);
    if (canonicalMatch) {
      for (const m of canonicalMatch) {
        if (m.includes('href="/') && !m.includes('href="https://')) {
          console.log(`  ❌ Relative canonical found in ${route}: ${m}`);
          foundRelativeCanonical = true;
          failed++;
        }
      }
    }
  }
  if (!foundRelativeCanonical) {
    assert(true, 'No relative canonical URLs found in any pre-rendered page');
  }

  // ── 4. Breadcrumb Ordering Check (via source code) ──
  console.log('\n── 4. Breadcrumb Ordering on /government-jobs ──');

  const govPageSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'government-jobs', 'page.tsx'), 'utf-8');
  
  // Check that "Government Jobs" comes BEFORE the type filter in breadcrumb
  const govJobsBcIndex = govPageSource.indexOf("{ name: 'Government Jobs', url: '/government-jobs' }");
  const typePushIndex = govPageSource.indexOf('breadcrumbItems.push({ name: typeLabel');
  assert(govJobsBcIndex > 0 && typePushIndex > 0, 'Breadcrumb has both Government Jobs and type filter entries');
  assert(govJobsBcIndex < typePushIndex, '"Government Jobs" breadcrumb comes before type filter (correct order)');

  // ── 5. JSON-LD in Pre-rendered Pages ──
  console.log('\n── 5. JSON-LD Structure Validation ──');

  // Job detail page should have JobPosting JSON-LD
  if (jobHtml) {
    assert(jobHtml.includes('JobPosting'), 'Job detail has JobPosting JSON-LD');
    assert(jobHtml.includes('BreadcrumbList'), 'Job detail has BreadcrumbList JSON-LD');
    assert(jobHtml.includes('jobboard.ke'), 'Job detail JSON-LD uses jobboard.ke domain');
  }

  // Category page should have CollectionPage + BreadcrumbList
  if (catHtml) {
    assert(catHtml.includes('CollectionPage'), 'Category page has CollectionPage JSON-LD');
    assert(catHtml.includes('BreadcrumbList'), 'Category page has BreadcrumbList JSON-LD');
  }

  // Location page should have CollectionPage + BreadcrumbList
  if (locHtml) {
    assert(locHtml.includes('CollectionPage'), 'Location page has CollectionPage JSON-LD');
    assert(locHtml.includes('BreadcrumbList'), 'Location page has BreadcrumbList JSON-LD');
  }

  // Subcategory page should have CollectionPage + BreadcrumbList
  if (subcatHtml) {
    assert(subcatHtml.includes('CollectionPage'), 'Subcategory page has CollectionPage JSON-LD');
    assert(subcatHtml.includes('BreadcrumbList'), 'Subcategory page has BreadcrumbList JSON-LD');
  }

  // ── 6. OG URLs in Pre-rendered Pages ──
  console.log('\n── 6. OpenGraph URLs Are Fully Qualified ──');

  if (jobHtml) {
    assert(jobHtml.includes('https://jobboard.ke/jobs/') && !jobHtml.includes('og:url" content="/jobs/'), 'Job detail OG URL is fully qualified');
  }
  if (catHtml) {
    assert(catHtml.includes('https://jobboard.ke/categories/') && !catHtml.includes('og:url" content="/categories/'), 'Category OG URL is fully qualified');
  }
  if (locHtml) {
    assert(locHtml.includes('https://jobboard.ke/locations/') && !locHtml.includes('og:url" content="/locations/'), 'Location OG URL is fully qualified');
  }

  // ── 7. Government Jobs Component Source Verification ──
  console.log('\n── 7. GovernmentJobs Component County Filter Fix ──');

  const compSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'jobboard', 'GovernmentJobs.tsx'), 'utf-8');
  assert(compSource.includes("orgType: 'COUNTY_GOVERNMENT'"), 'County jobs use orgType filter (not locationCounty)');
  assert(!compSource.includes("locationCounty: { not: 'Nairobi' }"), 'Old broken county filter is removed');

  // ── 8. SITE_URL Export ──
  console.log('\n── 8. SITE_URL Exported from jsonld.ts ──');

  const jsonldSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'jsonld.ts'), 'utf-8');
  assert(jsonldSource.includes("export const SITE_URL = 'https://jobboard.ke'"), 'SITE_URL is exported from jsonld.ts');

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