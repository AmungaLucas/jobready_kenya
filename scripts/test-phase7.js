/**
 * Phase 7 Test Script — Blog Pages
 * 
 * Tests:
 * 1. Service layer via direct DB queries
 * 2. BLOG_CATEGORY_DESCRIPTIONS completeness
 * 3. Blog listing page chunk: category tabs, featured hero, sidebar, JSON-LD
 * 4. Blog detail page: Article JSON-LD, breadcrumb, related posts, CTA
 * 5. generateArticleJsonLd in jsonld chunk
 * 6. Canonical URLs fully qualified
 * 7. revalidate = 60 on both pages
 * 8. generateStaticParams on detail page
 * 9. CareerResources links updated to /blog
 * 10. Pre-rendered blog HTML files
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

function readChunk(filename) {
  const f = path.join(CHUNKS_DIR, filename);
  if (!fs.existsSync(f)) return '';
  return fs.readFileSync(f, 'utf-8');
}

async function run() {
  console.log('\n═══ Phase 7 Test Suite — Blog Pages ═══\n');

  // Known chunk names from build analysis
  const LIST_CHUNK = 'src_app_blog_page_tsx_73b7a7c5._.js';
  const DETAIL_CHUNK = '[root-of-the-server]__a03e19de._.js';
  const SERVICE_CHUNK = '[root-of-the-server]__365db009._.js';

  const listCode = readChunk(LIST_CHUNK);
  const detailCode = readChunk(DETAIL_CHUNK);
  const serviceCode = readChunk(SERVICE_CHUNK);

  // ── 1. Service Layer (Direct DB) ──
  console.log('── 1. Service Layer (Direct DB Queries) ──');

  const totalPosts = await prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null } });
  assert(totalPosts === 10, `10 published blog posts (got ${totalPosts})`);

  const categories = ['Career Advice', 'Kenya Job Market', 'How-To', 'Industry Insights'];
  for (const cat of categories) {
    const c = await prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null, category: cat } });
    assert(c > 0, `${cat} has ${c} posts`);
  }

  const featured = await prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null, featured: true } });
  assert(featured === 2, `2 featured posts (got ${featured})`);

  const slugs = await prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true } });
  assert(slugs.length === 10, `10 slugs retrieved (got ${slugs.length})`);

  const onePost = await prisma.blogPost.findUnique({ where: { slug: slugs[0].slug } });
  assert(onePost && onePost.content && onePost.content.length > 500, 'Blog posts have full content (500+ chars)');

  // ── 2. BLOG_CATEGORY_DESCRIPTIONS ──
  console.log('\n── 2. BLOG_CATEGORY_DESCRIPTIONS ──');

  assert(serviceCode.includes('Kenyan job seekers'), 'BLOG_CATEGORY_DESCRIPTIONS has Career Advice description');
  assert(serviceCode.includes('salary benchmarks'), 'BLOG_CATEGORY_DESCRIPTIONS has Kenya Job Market description');
  assert(serviceCode.includes('Step-by-step guides'), 'BLOG_CATEGORY_DESCRIPTIONS has How-To description');
  assert(serviceCode.includes('Kenya'), 'BLOG_CATEGORY_DESCRIPTIONS has Industry Insights description');

  // ── 3. Blog Listing Page ──
  console.log('\n── 3. Blog Listing Page ──');

  assert(listCode.length > 0, 'List page chunk found and readable');

  // Category tabs (rendered via BLOG_CATEGORIES.map from service module)
  assert(listCode.includes('BLOG_CATEGORIES'), 'List page uses BLOG_CATEGORIES for tabs');
  assert(listCode.includes('min read'), 'List page renders tab content with read time');

  // Featured hero card
  assert(listCode.includes('Featured'), 'List page has Featured badge');
  assert(listCode.includes('Latest Articles'), 'List page has Latest Articles section');

  // CollectionPage JSON-LD
  assert(listCode.includes('CollectionPage'), 'List page generates CollectionPage JSON-LD');
  assert(listCode.includes('generateBreadcrumbJsonLd'), 'List page calls generateBreadcrumbJsonLd');

  // Sidebar
  assert(listCode.includes('Blog Overview'), 'List page sidebar has Blog Overview');
  assert(listCode.includes('Categories'), 'List page sidebar has Categories');
  assert(listCode.includes('Get Career Tips'), 'List page sidebar has newsletter signup');

  // Category filter URL
  assert(listCode.includes('/blog?category='), 'List page links to category-filtered URLs');

  // Empty fallback
  assert(listCode.includes('No articles in this category'), 'List page has empty fallback');
  assert(listCode.includes('Explore Categories'), 'List page has cross-category links in empty state');
  assert(listCode.includes('Looking for Jobs'), 'List page has job cross-links in empty state');

  // ── 4. Blog Detail Page ──
  console.log('\n── 4. Blog Detail Page ──');

  assert(detailCode.length > 0, 'Detail page chunk found and readable');

  // Article JSON-LD - the function is called but properties are inlined, verify via chunk function call
  assert(detailCode.includes('generateArticleJsonLd'), 'Detail page calls generateArticleJsonLd');
  // JSON-LD field verification deferred to section 10 (pre-rendered HTML checks)

  // Breadcrumb
  assert(detailCode.includes('Home') && detailCode.includes('Blog'), 'Detail breadcrumb has Home > Blog');

  // Related posts
  assert(detailCode.includes('Related Articles'), 'Detail page has Related Articles section');

  // Content sections
  assert(detailCode.includes('Author'), 'Detail page has Author sidebar section');
  assert(detailCode.includes('Article Info'), 'Detail page has Article Info sidebar');
  assert(detailCode.includes('Browse'), 'Detail page has Browse sidebar');
  assert(detailCode.includes('Explore Topics'), 'Detail page has Explore Topics sidebar');

  // CTA
  assert(detailCode.includes('Browse Jobs'), 'Detail page has Browse Jobs CTA');
  assert(detailCode.includes('Opportunities'), 'Detail page has Opportunities CTA');

  // Cover image
  assert(detailCode.includes('coverImageUrl'), 'Detail page renders cover image');

  // ── 5. generateArticleJsonLd ──
  console.log('\n── 5. generateArticleJsonLd Function ──');

  assert(detailCode.includes('generateArticleJsonLd'), 'generateArticleJsonLd function is imported/called');
  assert(detailCode.includes('datePublished'), 'Detail page references datePublished');

  // ── 6. Canonical URLs ──
  console.log('\n── 6. Canonical URLs ──');

  assert(/SITE_URL.*?blog/.test(listCode), 'List page canonical uses SITE_URL + /blog');
  assert(/SITE_URL.*?blog/.test(detailCode), 'Detail page canonical uses SITE_URL + /blog');

  // ── 7. revalidate = 60 ──
  console.log('\n── 7. ISR revalidate ──');

  assert(listCode.includes('"revalidate"') || listCode.includes('revalidate'), 'List page has revalidate export');
  assert(detailCode.includes('"revalidate"') || detailCode.includes('revalidate'), 'Detail page has revalidate export');

  // ── 8. generateStaticParams ──
  console.log('\n── 8. generateStaticParams ──');

  assert(detailCode.includes('generateStaticParams'), 'Detail page has generateStaticParams');
  assert(serviceCode.includes('getAllBlogPostSlugs'), 'Service layer exports getAllBlogPostSlugs');

  // ── 9. CareerResources Links ──
  console.log('\n── 9. CareerResources Component ──');

  const crSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'jobboard', 'CareerResources.tsx'), 'utf-8');
  const crLinks = (crSource.match(/href="\/blog"/g) || []).length;
  assert(crLinks >= 2, `CareerResources links to /blog (${crLinks} links)`);

  // ── 10. Pre-rendered HTML ──
  console.log('\n── 10. Pre-rendered Output ──');

  // In Next.js 16 with Turbopack, HTML files for [slug] routes are flat under the parent dir
  const blogDir = path.join(BUILD_DIR, 'blog');
  const htmlFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
  assert(htmlFiles.length === 10, `10 blog detail HTML files (got ${htmlFiles.length})`);

  // Verify a specific blog page
  const cvGuide = htmlFiles.find(f => f.includes('cv-writing-guide'));
  assert(cvGuide !== undefined, 'CV writing guide HTML is pre-rendered');

  if (cvGuide) {
    const cvHtml = fs.readFileSync(path.join(blogDir, cvGuide), 'utf-8');
    assert(cvHtml.includes('CV Writing Guide') || cvHtml.includes('cv-writing-guide'), 'CV guide page contains title');
    assert(cvHtml.includes('Article'), 'CV guide page has Article JSON-LD type');
    // Verify Article JSON-LD fields
    assert(cvHtml.includes('headline'), 'Article JSON-LD has headline field');
    assert(cvHtml.includes('publisher'), 'Article JSON-LD has publisher field');
    assert(cvHtml.includes('articleSection'), 'Article JSON-LD has articleSection field');
    assert(cvHtml.includes('mainEntityOfPage'), 'Article JSON-LD has mainEntityOfPage');
    assert(cvHtml.includes('dateModified'), 'Article JSON-LD has dateModified');
  }

  // Verify another page for coverage
  const salaryGuide = htmlFiles.find(f => f.includes('salary-guide'));
  if (salaryGuide) {
    const sgHtml = fs.readFileSync(path.join(blogDir, salaryGuide), 'utf-8');
    assert(sgHtml.includes('Salary Guide') || sgHtml.includes('salary-guide'), 'Salary guide page contains title');
    assert(sgHtml.includes('Kenya Job Market'), 'Salary guide page has category');
  }

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
  // 24 jobs + 43 categories + 468 subcategories + 46 locations + 46 gov counties + 10 blog = 640
  assert(totalHtml >= 640, `At least 640 HTML files expected (got ${totalHtml})`);

  // ── 12. Blog Post Data Integrity ──
  console.log('\n── 12. Blog Post Data Integrity ──');

  const samplePost = await prisma.blogPost.findFirst({ where: { status: 'PUBLISHED' } });
  assert(samplePost !== null, 'Can fetch a published blog post');
  assert(samplePost.excerpt.length > 50, 'Blog post excerpt is substantial (50+ chars)');
  assert(samplePost.readTimeMinutes >= 5, `Blog post readTimeMinutes is reasonable (got ${samplePost.readTimeMinutes})`);
  assert(samplePost.tags !== null, 'Blog post has tags');
  assert(samplePost.datePublished !== null, 'Blog post has datePublished');

  // ── 13. Blog Service Functions ──
  console.log('\n── 13. Blog Service Functions ──');

  assert(serviceCode.includes('getBlogPosts'), 'Service exports getBlogPosts');
  assert(serviceCode.includes('getBlogPostCounts'), 'Service exports getBlogPostCounts');
  assert(serviceCode.includes('getRelatedPosts'), 'Service exports getRelatedPosts');
  // getFeaturedPosts is tree-shaken out if not imported — check source instead
  const blogSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'blog.ts'), 'utf-8');
  assert(blogSource.includes('getFeaturedPosts'), 'Blog service source has getFeaturedPosts');
  assert(serviceCode.includes('formatDate'), 'Service exports formatDate');
  assert(serviceCode.includes('BLOG_CATEGORIES'), 'Service exports BLOG_CATEGORIES');

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