const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/home/z/my-project';
const NEXT_DIR = path.join(ROOT, '.next');
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

async function run() {
  console.log('=== Phase 10 Test: Optimization & Performance ===\n');

  // ============================================
  // Section 1: Root layout metadata
  // ============================================
  console.log('1. Root layout metadata');
  const layoutContent = fs.readFileSync(path.join(ROOT, 'src/app/layout.tsx'), 'utf8');
  assert(layoutContent.includes('metadataBase'), 'Layout has metadataBase');
  assert(layoutContent.includes('https://jobboard.ke'), 'Layout metadataBase is jobboard.ke');
  assert(layoutContent.includes('template:'), 'Layout has title template');
  assert(layoutContent.includes("'%s | JobBoard Kenya'") || layoutContent.includes('"%s | JobBoard Kenya"'), 'Title template uses %s | JobBoard Kenya');
  assert(layoutContent.includes("default: 'JobBoard Kenya"), 'Layout has default title');
  assert(layoutContent.includes('locale:'), 'Layout has OG locale');
  assert(layoutContent.includes('en_KE'), 'OG locale is en_KE');
  assert(layoutContent.includes('googleBot'), 'Layout has googleBot directives');
  assert(layoutContent.includes('max-image-preview'), 'Layout has max-image-preview');
  assert(layoutContent.includes('max-snippet'), 'Layout has max-snippet');
  assert(layoutContent.includes('max-video-preview'), 'Layout has max-video-preview');
  assert(layoutContent.includes('verification'), 'Layout has verification config');
  assert(layoutContent.includes('siteName'), 'Layout has siteName in OG');
  assert(layoutContent.includes('robots'), 'Layout has robots config');

  // ============================================
  // Section 2: Global WebSite JSON-LD
  // ============================================
  console.log('2. Global WebSite JSON-LD in layout');
  assert(layoutContent.includes("'@type': 'WebSite'") || layoutContent.includes('"@type":"WebSite"'), 'Layout has WebSite JSON-LD');
  assert(layoutContent.includes('SearchAction'), 'Layout has SearchAction in JSON-LD');
  assert(layoutContent.includes('jobboard.ke/jobs?search='), 'SearchAction target includes jobs search URL');
  assert(layoutContent.includes('Organization'), 'Layout has Organization in JSON-LD');
  assert(layoutContent.includes('publisher'), 'Layout has publisher in JSON-LD');
  assert(layoutContent.includes('application/ld+json'), 'Layout injects JSON-LD script');

  // ============================================
  // Section 3: Not Found page
  // ============================================
  console.log('3. Not Found page');
  assert(fs.existsSync(path.join(ROOT, 'src/app/not-found.tsx')), 'not-found.tsx exists');
  const notFoundContent = fs.readFileSync(path.join(ROOT, 'src/app/not-found.tsx'), 'utf8');
  assert(notFoundContent.includes('404'), '404 text present');
  assert(notFoundContent.includes('Page Not Found'), 'Page Not Found heading');
  assert(notFoundContent.includes('robots'), 'Not-found has metadata');
  assert(notFoundContent.includes('index: false'), 'Not-found is noindex');
  assert(notFoundContent.includes('href="/"'), 'Links to homepage');
  assert(notFoundContent.includes('href="/jobs"'), 'Links to jobs');
  assert(notFoundContent.includes('href="/blog"'), 'Links to blog');
  assert(notFoundContent.includes('href="/categories'), 'Links to categories');
  assert(notFoundContent.includes('href="/government-jobs"'), 'Links to government jobs');

  // ============================================
  // Section 4: Loading page
  // ============================================
  console.log('4. Loading skeleton');
  assert(fs.existsSync(path.join(ROOT, 'src/app/loading.tsx')), 'loading.tsx exists');
  const loadingContent = fs.readFileSync(path.join(ROOT, 'src/app/loading.tsx'), 'utf8');
  assert(loadingContent.includes('animate-spin'), 'Loading has spinner animation');
  assert(loadingContent.includes('Loading'), 'Loading has loading text');
  assert(loadingContent.length < 800, 'Loading component is lightweight');

  // ============================================
  // Section 5: next.config.ts performance settings
  // ============================================
  console.log('5. Next.js config performance settings');
  const configContent = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
  assert(configContent.includes('compress: true'), 'Compression enabled');
  assert(configContent.includes('poweredByHeader: false'), 'X-Powered-By header removed');
  assert(configContent.includes('reactProductionProfiling: false'), 'Production profiling disabled');
  assert(configContent.includes('output: "standalone"'), 'Standalone output mode');
  assert(configContent.includes('headers()'), 'Custom headers function exists');

  // ============================================
  // Section 6: Security headers
  // ============================================
  console.log('6. Security headers');
  assert(configContent.includes('X-Frame-Options'), 'X-Frame-Options header');
  assert(configContent.includes('DENY'), 'X-Frame-Options is DENY');
  assert(configContent.includes('X-Content-Type-Options'), 'X-Content-Type-Options header');
  assert(configContent.includes('nosniff'), 'nosniff value present');
  assert(configContent.includes('Referrer-Policy'), 'Referrer-Policy header');
  assert(configContent.includes('strict-origin-when-cross-origin'), 'Referrer-Policy is strict-origin-when-cross-origin');
  assert(configContent.includes('X-DNS-Prefetch-Control'), 'X-DNS-Prefetch-Control header');

  // ============================================
  // Section 7: Cache headers for sitemap/robots
  // ============================================
  console.log('7. Cache headers for static assets');
  assert(configContent.includes('/sitemap.xml'), 'Sitemap has custom headers');
  assert(configContent.includes('/robots.txt'), 'Robots has custom headers');
  assert(configContent.includes('s-maxage'), 's-maxage cache directive present');
  assert(configContent.includes('max-age'), 'max-age cache directive present');

  // ============================================
  // Section 8: Pre-rendered 404 page
  // ============================================
  console.log('8. Pre-rendered 404 page');
  const notFoundHtml = path.join(NEXT_DIR, 'server', 'app', '_not-found.html');
  assert(fs.existsSync(notFoundHtml), '404 HTML page pre-rendered');
  if (fs.existsSync(notFoundHtml)) {
    const nfHtml = fs.readFileSync(notFoundHtml, 'utf8');
    assert(nfHtml.includes('404'), '404 in rendered HTML');
    assert(nfHtml.includes('Page Not Found'), 'Page Not Found in rendered HTML');
  }

  // ============================================
  // Section 9: Homepage has title from template
  // ============================================
  console.log('9. Homepage metadata');
  const indexHtml = path.join(NEXT_DIR, 'server', 'app', 'index.html');
  if (fs.existsSync(indexHtml)) {
    const homeHtml = fs.readFileSync(indexHtml, 'utf8');
    assert(homeHtml.includes('JobBoard Kenya'), 'Homepage has brand name');
    // Check for WebSite JSON-LD on homepage (inherited from layout)
    assert(homeHtml.includes('WebSite'), 'Homepage has WebSite JSON-LD from layout');
    assert(homeHtml.includes('SearchAction'), 'Homepage has SearchAction from layout');
  }

  // ============================================
  // Section 10: All pages inherit WebSite JSON-LD
  // ============================================
  console.log('10. WebSite JSON-LD on multiple pages');
  const pagesToCheck = ['about.html', 'contact.html', 'privacy-policy.html', 'terms-of-service.html'];
  const serverAppDir = path.join(NEXT_DIR, 'server', 'app');
  for (const p of pagesToCheck) {
    const htmlPath = path.join(serverAppDir, p);
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      assert(html.includes('WebSite'), `${p} has global WebSite JSON-LD`);
    }
  }

  // ============================================
  // Section 11: Build performance metrics
  // ============================================
  console.log('11. Build metrics');
  const htmlCount = parseInt(execSync(`find "${serverAppDir}" -name "*.html" | wc -l`).toString().trim());
  assert(htmlCount >= 640, `Total pre-rendered HTML >= 640 (actual: ${htmlCount})`);
  
  // Check build didn't create .next/cache unnecessarily
  const standaloneDir = path.join(NEXT_DIR, 'standalone');
  assert(fs.existsSync(standaloneDir), 'Standalone output exists');

  // ============================================
  // Section 12: Total route count
  // ============================================
  console.log('12. Route count verification');
  // 651 routes expected (from build output)
  assert(htmlCount >= 640, `Page count consistent (HTML: ${htmlCount})`);

  // ============================================
  // Results
  // ============================================
  console.log(`\n=== Phase 10 Results: ${passed}/${passed + failed} passed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });