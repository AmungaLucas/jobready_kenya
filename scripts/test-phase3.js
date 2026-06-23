/**
 * Phase 3 Validation: Category & Subcategory Pages
 * Tests: generateStaticParams, slug resolution, subcategory URL construction,
 *        5-layer fallback, SEO metadata, JSON-LD
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
  console.log('=== Phase 3: Category/Subcategory Validation ===\n');

  // ── Test 1: Category count ──
  console.log('1. Category count');
  const catCount = await p.jobCategory.count();
  assert(catCount === 43, `43 categories in DB (got ${catCount})`);

  // ── Test 2: Subcategory count ──
  console.log('2. Subcategory count');
  const subCount = await p.jobSubcategory.count();
  assert(subCount === 468, `468 subcategories in DB (got ${subCount})`);

  // ── Test 3: Category slug lookup ──
  console.log('3. Category slug lookup');
  const tech = await p.jobCategory.findUnique({ where: { slug: 'technology' }, select: { label: true, slug: true } });
  assert(tech?.slug === 'technology', 'technology category found');
  assert(tech?.label === 'Technology & IT', `label is "${tech?.label}"`);

  // ── Test 4: Subcategory slug resolution (full slug = categorySlug + "-" + subSlug) ──
  console.log('4. Subcategory slug resolution');
  const techCat = await p.jobCategory.findUnique({ where: { slug: 'technology' }, select: { id: true } });
  const swEng = await p.jobSubcategory.findFirst({
    where: { categoryId: techCat.id, slug: 'technology-software-engineering' },
    select: { slug: true, label: true },
  });
  assert(swEng?.slug === 'technology-software-engineering', `full slug resolved: ${swEng?.slug}`);
  assert(swEng?.label === 'Software Engineering', `label: ${swEng?.label}`);

  // ── Test 5: URL slug stripping (category prefix removal) ──
  console.log('5. URL slug stripping');
  const prefix = 'technology-';
  const urlSlug = swEng.slug.startsWith(prefix) ? swEng.slug.slice(prefix.length) : swEng.slug;
  assert(urlSlug === 'software-engineering', `URL slug: ${urlSlug}`);

  // ── Test 6: Pre-rendered category HTML files ──
  console.log('6. Pre-rendered category pages');
  const catsDir = path.join(__dirname, '../.next/server/app/categories');
  const catHtmlFiles = fs.readdirSync(catsDir).filter(f => f.endsWith('.html') && !f.includes('/'));
  assert(catHtmlFiles.length === 43, `${catHtmlFiles.length} category HTML files (expected 43)`);

  // ── Test 7: Pre-rendered subcategory HTML files ──
  console.log('7. Pre-rendered subcategory pages');
  let subHtmlCount = 0;
  const subDirs = fs.readdirSync(catsDir).filter(f => {
    const fullPath = path.join(catsDir, f);
    return fs.statSync(fullPath).isDirectory() && f !== '[slug]' && f !== '[category]';
  });
  for (const dir of subDirs) {
    const subFiles = fs.readdirSync(path.join(catsDir, dir)).filter(f => f.endsWith('.html'));
    subHtmlCount += subFiles.length;
  }
  assert(subHtmlCount === 468, `${subHtmlCount} subcategory HTML files (expected 468)`);

  // ── Test 8: Category page has JSON-LD ──
  console.log('8. Category page JSON-LD (technology)');
  const techHtml = fs.readFileSync(path.join(catsDir, 'technology.html'), 'utf8');
  assert(techHtml.includes('CollectionPage'), 'Contains CollectionPage JSON-LD');
  assert(techHtml.includes('BreadcrumbList'), 'Contains BreadcrumbList JSON-LD');
  assert(techHtml.includes('Technology'), 'Contains category name in HTML');

  // ── Test 9: 5-layer fallback on 0-job category (construction) ──
  console.log('9. 5-layer empty fallback (construction - 0 jobs)');
  const constructionHtml = fs.readFileSync(path.join(catsDir, 'construction.html'), 'utf8');
  assert(constructionHtml.includes('Browse by Specialization'), 'Layer 2: subcategory grid');
  assert(constructionHtml.includes('Browse') && constructionHtml.includes('County'), 'Layer 4: county links');
  assert(constructionHtml.includes('Explore Other Categories'), 'Layer 5: explore + CTA');
  assert(constructionHtml.includes('Get Alerts'), 'Layer 5: job alert signup');
  assert(!constructionHtml.includes('Latest Construction'), 'No job listings section (0 jobs)');

  // ── Test 10: Category with jobs shows job cards ──
  console.log('10. Category with jobs (technology - 4 jobs)');
  assert(techHtml.includes('job-card'), 'Contains job card elements');
  assert(techHtml.includes('Latest') && techHtml.includes('Vacancies'), 'Shows job listings header (Latest ... Vacancies)');

  // ── Test 11: Subcategory page SEO ──
  console.log('11. Subcategory page SEO (technology/software-engineering)');
  const swEngHtml = fs.readFileSync(path.join(catsDir, 'technology/software-engineering.html'), 'utf8');
  assert(swEngHtml.includes('<title>'), 'Has <title> tag');
  assert(swEngHtml.includes('Software Engineering'), 'Title contains subcategory name');
  assert(swEngHtml.includes('CollectionPage'), 'Has CollectionPage JSON-LD');
  assert(swEngHtml.includes('BreadcrumbList'), 'Has BreadcrumbList JSON-LD');
  assert(swEngHtml.includes('canonical'), 'Has canonical link');

  // ── Test 12: Empty subcategory has fallback ──
  console.log('12. Empty subcategory fallback');
  const constructionSubs = fs.readdirSync(path.join(catsDir, 'construction')).filter(f => f.endsWith('.html'));
  if (constructionSubs.length > 0) {
    const emptySubHtml = fs.readFileSync(path.join(catsDir, 'construction', constructionSubs[0]), 'utf8');
    assert(emptySubHtml.includes('Specializations') || emptySubHtml.includes('Explore') || emptySubHtml.includes('County'), 'Empty subcategory has fallback content');
  } else {
    assert(false, 'No subcategory HTML files for construction');
  }

  // ── Test 13: Breadcrumb links correct ──
  console.log('13. Breadcrumb link structure');
  assert(techHtml.includes('href="/categories/technology"'), 'Category page links to itself');
  assert(swEngHtml.includes('href="/categories/technology"'), 'Subcategory links back to parent');

  // ── Test 14: Subcategory URL paths don\'t double-prefix ──
  console.log('14. No URL double-prefixing');
  assert(!techHtml.includes('technology/technology-'), 'No /technology/technology- double prefix in category page');
  assert(!swEngHtml.includes('technology/technology-'), 'No /technology/technology- double prefix in subcategory page');

  // ── Test 15: ISR revalidate is 60s ──
  console.log('15. ISR revalidate setting');
  const catPageSource = fs.readFileSync(path.join(__dirname, '../src/app/categories/[slug]/page.tsx'), 'utf8');
  assert(catPageSource.includes("revalidate = 60"), 'Category page has revalidate = 60');
  const subPageSource = fs.readFileSync(path.join(__dirname, '../src/app/categories/[category]/[slug]/page.tsx'), 'utf8');
  assert(subPageSource.includes("revalidate = 60"), 'Subcategory page has revalidate = 60');

  // ── Summary ──
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${failed === 0 ? '🎉 All Phase 3 tests passed!' : '⚠️  Some tests failed.'}`);

  await p.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
})();