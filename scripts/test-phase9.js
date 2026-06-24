const fs = require('fs');
const path = require('path');

const ROOT = '/home/z/my-project';
const NEXT_DIR = path.join(ROOT, '.next');
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

async function run() {
  console.log('=== Phase 9 Test: Technical SEO (sitemap.xml, robots.txt, schema validation) ===\n');

  // ============================================
  // Section 1: Source file existence
  // ============================================
  console.log('1. Source file existence');
  assert(fs.existsSync(path.join(ROOT, 'src/app/sitemap.ts')), 'sitemap.ts exists');
  assert(fs.existsSync(path.join(ROOT, 'src/app/robots.ts')), 'robots.ts exists');

  // ============================================
  // Section 2: Sitemap source imports
  // ============================================
  console.log('2. Sitemap source imports');
  const sitemapSource = fs.readFileSync(path.join(ROOT, 'src/app/sitemap.ts'), 'utf8');
  assert(sitemapSource.includes('getAllJobSlugs'), 'sitemap imports getAllJobSlugs');
  assert(sitemapSource.includes('getAllCategorySlugs'), 'sitemap imports getAllCategorySlugs');
  assert(sitemapSource.includes('getAllSubcategorySlugs'), 'sitemap imports getAllSubcategorySlugs');
  assert(sitemapSource.includes('getAllLocationSlugs'), 'sitemap imports getAllLocationSlugs');
  assert(sitemapSource.includes('getAllGovernmentCountySlugs'), 'sitemap imports getAllGovernmentCountySlugs');
  assert(sitemapSource.includes('getAllOpportunitySlugs'), 'sitemap imports getAllOpportunitySlugs');
  assert(sitemapSource.includes('getAllBlogPostSlugs'), 'sitemap imports getAllBlogPostSlugs');
  assert(sitemapSource.includes('MetadataRoute'), 'sitemap uses MetadataRoute type');
  assert(sitemapSource.includes('jobboard.ke'), 'sitemap uses jobboard.ke domain');

  // ============================================
  // Section 3: Sitemap covers all route types
  // ============================================
  console.log('3. Sitemap covers all route types');
  assert(sitemapSource.includes('/jobs/'), 'sitemap includes job detail URLs');
  assert(sitemapSource.includes('/categories/'), 'sitemap includes category URLs');
  assert(sitemapSource.includes('/locations/'), 'sitemap includes location URLs');
  assert(sitemapSource.includes('/government-jobs/'), 'sitemap includes government job county URLs');
  assert(sitemapSource.includes('/opportunities/'), 'sitemap includes opportunity URLs');
  assert(sitemapSource.includes('/blog/'), 'sitemap includes blog URLs');
  assert(sitemapSource.includes('/about'), 'sitemap includes about');
  assert(sitemapSource.includes('/contact'), 'sitemap includes contact');
  assert(sitemapSource.includes('/privacy-policy'), 'sitemap includes privacy policy');
  assert(sitemapSource.includes('/terms-of-service'), 'sitemap includes terms of service');

  // ============================================
  // Section 4: Sitemap priority hierarchy
  // ============================================
  console.log('4. Sitemap priority hierarchy');
  // Homepage should have highest priority
  assert(sitemapSource.includes('priority: 1.0'), 'Homepage has priority 1.0');
  assert(sitemapSource.includes('priority: 0.9'), 'Jobs/gov pages have priority 0.9');
  assert(sitemapSource.includes('priority: 0.8'), 'Content pages have priority 0.8');
  assert(sitemapSource.includes('priority: 0.7'), 'Category/location pages have priority 0.7');
  assert(sitemapSource.includes('priority: 0.6'), 'Subcategory/county pages have priority 0.6');
  assert(sitemapSource.includes('priority: 0.5'), 'Static info pages have priority 0.5');
  assert(sitemapSource.includes('priority: 0.3'), 'Legal pages have priority 0.3');

  // ============================================
  // Section 5: Sitemap changeFrequency
  // ============================================
  console.log('5. Sitemap changeFrequency values');
  assert(sitemapSource.includes("changeFrequency: 'daily'"), 'Daily changeFrequency present');
  assert(sitemapSource.includes("changeFrequency: 'weekly'"), 'Weekly changeFrequency present');
  assert(sitemapSource.includes("changeFrequency: 'monthly'"), 'Monthly changeFrequency present');
  assert(sitemapSource.includes("changeFrequency: 'yearly'"), 'Yearly changeFrequency present');

  // ============================================
  // Section 6: Generated sitemap.xml
  // ============================================
  console.log('6. Generated sitemap.xml');
  const sitemapBody = path.join(NEXT_DIR, 'server', 'app', 'sitemap.xml.body');
  assert(fs.existsSync(sitemapBody), 'sitemap.xml.body was generated');
  
  if (fs.existsSync(sitemapBody)) {
    const sitemapXml = fs.readFileSync(sitemapBody, 'utf8');
    assert(sitemapXml.includes('<?xml version="1.0"'), 'Valid XML declaration');
    assert(sitemapXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'Sitemap namespace present');
    assert(sitemapXml.includes('<urlset'), 'urlset root element');
    assert(sitemapXml.includes('</urlset>'), 'urlset closed');
    assert(sitemapXml.includes('https://jobboard.ke</loc>'), 'Homepage URL in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/jobs/'), 'Job URLs in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/categories/'), 'Category URLs in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/locations/nairobi'), 'Nairobi location in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/blog/'), 'Blog URLs in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/about</loc>'), 'About page in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/contact</loc>'), 'Contact page in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/privacy-policy</loc>'), 'Privacy in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/terms-of-service</loc>'), 'Terms in sitemap');
    assert(sitemapXml.includes('https://jobboard.ke/government-jobs/'), 'Gov jobs in sitemap');
    
    // Count URLs
    const urlCount = (sitemapXml.match(/<url>/g) || []).length;
    assert(urlCount >= 600, `Sitemap has ${urlCount} URLs (>= 600)`);
    
    // Verify all URLs use https
    const httpUrls = (sitemapXml.match(/<loc>http:\/\//g) || []).length;
    assert(httpUrls === 0, `No http:// URLs in sitemap (found ${httpUrls})`);
    
    // Verify lastmod present
    assert(sitemapXml.includes('<lastmod>'), 'lastmod elements present');
    
    // Verify priority present
    assert(sitemapXml.includes('<priority>'), 'priority elements present');
  }

  // ============================================
  // Section 7: Generated robots.txt
  // ============================================
  console.log('7. Generated robots.txt');
  const robotsBody = path.join(NEXT_DIR, 'server', 'app', 'robots.txt.body');
  assert(fs.existsSync(robotsBody), 'robots.txt.body was generated');
  
  if (fs.existsSync(robotsBody)) {
    const robotsTxt = fs.readFileSync(robotsBody, 'utf8');
    assert(robotsTxt.includes('User-Agent: *'), 'Wildcard user agent');
    assert(robotsTxt.includes('Allow: /'), 'Root allowed');
    assert(robotsTxt.includes('Disallow: /api/'), 'API disallowed');
    assert(robotsTxt.includes('Disallow: /admin/'), 'Admin disallowed');
    assert(robotsTxt.includes('Disallow: /_next/'), '_next disallowed');
    assert(robotsTxt.includes('Sitemap: https://jobboard.ke/sitemap.xml'), 'Sitemap reference present');
    
    // Should not have conflicting rules
    const allowCount = (robotsTxt.match(/Allow/g) || []).length;
    const disallowCount = (robotsTxt.match(/Disallow/g) || []).length;
    assert(allowCount >= 1, `At least 1 Allow rule (${allowCount})`);
    assert(disallowCount >= 3, `At least 3 Disallow rules (${disallowCount})`);
  }

  // ============================================
  // Section 8: Robots source file
  // ============================================
  console.log('8. Robots source file');
  const robotsSource = fs.readFileSync(path.join(ROOT, 'src/app/robots.ts'), 'utf8');
  assert(robotsSource.includes('MetadataRoute'), 'robots uses MetadataRoute type');
  assert(robotsSource.includes('jobboard.ke'), 'robots references jobboard.ke');
  assert(robotsSource.includes('sitemap.xml'), 'robots references sitemap.xml');

  // ============================================
  // Section 9: Schema validation across pages
  // ============================================
  console.log('9. Schema validation - JSON-LD across page types');
  const serverAppDir = path.join(NEXT_DIR, 'server', 'app');
  
  // Check a job detail page has JobPosting JSON-LD
  const jobHtmlFiles = fs.readdirSync(serverAppDir).filter(f => f.startsWith('senior-software') || f.startsWith('marketing-manager'));
  if (jobHtmlFiles.length > 0) {
    const jobHtml = fs.readFileSync(path.join(serverAppDir, jobHtmlFiles[0]), 'utf8');
    assert(jobHtml.includes('"@type":"JobPosting"') || jobHtml.includes('"@type": "JobPosting"'), 'Job detail has JobPosting JSON-LD');
    assert(jobHtml.includes('hiringOrganization'), 'JobPosting has hiringOrganization');
  } else {
    // Try nested dir
    const jobDir = path.join(serverAppDir, 'jobs');
    if (fs.existsSync(jobDir)) {
      const jobFiles = fs.readdirSync(jobDir).filter(f => f.endsWith('.html'));
      if (jobFiles.length > 0) {
        const jobHtml = fs.readFileSync(path.join(jobDir, jobFiles[0]), 'utf8');
        assert(jobHtml.includes('"@type":"JobPosting"') || jobHtml.includes('"@type": "JobPosting"'), 'Job detail has JobPosting JSON-LD');
        assert(jobHtml.includes('hiringOrganization'), 'JobPosting has hiringOrganization');
      }
    }
  }

  // Check a category page has CollectionPage JSON-LD
  const catDir = path.join(serverAppDir, 'categories');
  if (fs.existsSync(catDir)) {
    const catFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.html'));
    if (catFiles.length > 0) {
      const catHtml = fs.readFileSync(path.join(catDir, catFiles[0]), 'utf8');
      assert(catHtml.includes('"@type":"CollectionPage"') || catHtml.includes('"@type": "CollectionPage"'), 'Category has CollectionPage JSON-LD');
    }
  }

  // Check a blog post has Article JSON-LD
  const blogDir = path.join(serverAppDir, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
    if (blogFiles.length > 0) {
      const blogHtml = fs.readFileSync(path.join(blogDir, blogFiles[0]), 'utf8');
      assert(blogHtml.includes('"@type":"Article"') || blogHtml.includes('"@type": "Article"'), 'Blog post has Article JSON-LD');
      assert(blogHtml.includes('headline'), 'Article has headline');
      assert(blogHtml.includes('publisher'), 'Article has publisher');
      assert(blogHtml.includes('articleSection'), 'Article has articleSection');
      assert(blogHtml.includes('mainEntityOfPage'), 'Article has mainEntityOfPage');
    }
  }

  // Check static pages have WebPage JSON-LD
  for (const p of ['about', 'contact', 'privacy-policy', 'terms-of-service']) {
    const pHtml = fs.readFileSync(path.join(serverAppDir, `${p}.html`), 'utf8');
    assert(pHtml.includes('"@type":"WebPage"') || pHtml.includes('"@type": "WebPage"'), `${p} has WebPage JSON-LD`);
  }

  // ============================================
  // Section 10: Build output verification
  // ============================================
  console.log('10. Build output includes sitemap and robots');
  const { execSync } = require('child_process');
  // Check the build route listing would show sitemap.xml and robots.txt
  // We verify via the generated files
  assert(fs.existsSync(sitemapBody), 'sitemap.xml.body exists after build');
  assert(fs.existsSync(robotsBody), 'robots.txt.body exists after build');

  // ============================================
  // Section 11: JSON-LD completeness check
  // ============================================
  console.log('11. JSON-LD schema types across all page types');
  // Verify jsonld.ts has all required generators
  const jsonldContent = fs.readFileSync(path.join(ROOT, 'src/lib/jsonld.ts'), 'utf8');
  assert(jsonldContent.includes("generateJobPostingJsonLd"), 'Has JobPosting generator');
  assert(jsonldContent.includes("generateCollectionPageJsonLd"), 'Has CollectionPage generator');
  assert(jsonldContent.includes("generateBreadcrumbJsonLd"), 'Has BreadcrumbList generator');
  assert(jsonldContent.includes("generateOpportunityJsonLd"), 'Has Event/Opportunity generator');
  assert(jsonldContent.includes("generateArticleJsonLd"), 'Has Article generator');
  assert(jsonldContent.includes("generateWebPageJsonLd"), 'Has WebPage generator');
  assert(jsonldContent.includes("SITE_URL"), 'Has SITE_URL constant');

  // ============================================
  // Results
  // ============================================
  console.log(`\n=== Phase 9 Results: ${passed}/${passed + failed} passed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });