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
  console.log('=== Phase 8 Test: Static Pages (About, Contact, Privacy Policy, Terms of Service) ===\n');

  // ============================================
  // Section 1: Source files exist
  // ============================================
  console.log('1. Source file existence');
  const pages = ['about', 'contact', 'privacy-policy', 'terms-of-service'];
  for (const p of pages) {
    const filePath = path.join(ROOT, `src/app/${p}/page.tsx`);
    assert(fs.existsSync(filePath), `${p}/page.tsx exists`);
  }

  // ============================================
  // Section 2: Footer links updated
  // ============================================
  console.log('2. Footer links');
  const footerContent = fs.readFileSync(path.join(ROOT, 'src/components/jobboard/Footer.tsx'), 'utf8');
  assert(footerContent.includes('href="/privacy-policy"'), 'Footer has Privacy Policy link');
  assert(footerContent.includes('href="/terms-of-service"'), 'Footer has Terms of Service link');
  assert(footerContent.includes('href="/contact"'), 'Footer has Contact link');
  assert(footerContent.includes('href="/about"'), 'Footer has About link');
  assert(footerContent.includes('href="/blog"'), 'Footer Resources links to blog');
  assert(!footerContent.includes('href="#">Privacy Policy"'), 'No placeholder Privacy Policy link');
  assert(!footerContent.includes('href="#">Terms of Service"'), 'No placeholder Terms link');
  assert(!footerContent.includes('href="#">Contact"'), 'No placeholder Contact link');
  assert(!footerContent.includes('href="#">About"'), 'No placeholder About link');

  // ============================================
  // Section 3: jsonld.ts has generateWebPageJsonLd
  // ============================================
  console.log('3. JSON-LD helper');
  const jsonldContent = fs.readFileSync(path.join(ROOT, 'src/lib/jsonld.ts'), 'utf8');
  assert(jsonldContent.includes('generateWebPageJsonLd'), 'generateWebPageJsonLd function exists');
  assert(jsonldContent.includes("'@type': 'WebPage'"), 'WebPage type in generateWebPageJsonLd');

  // ============================================
  // Section 4: Pre-rendered HTML files
  // ============================================
  console.log('4. Pre-rendered HTML files');
  const serverAppDir = path.join(NEXT_DIR, 'server', 'app');
  for (const p of pages) {
    // Check for flat HTML file under server/app
    const candidates = [
      path.join(serverAppDir, `${p}.html`),
      path.join(serverAppDir, `${p}.rsc`),
    ];
    const found = candidates.some(c => fs.existsSync(c));
    assert(found, `${p} has pre-rendered output`);
  }

  // ============================================
  // Section 5: About page content
  // ============================================
  console.log('5. About page content');
  const aboutSource = fs.readFileSync(path.join(ROOT, 'src/app/about/page.tsx'), 'utf8');
  assert(aboutSource.includes("metadata") && (aboutSource.includes("generateMetadata") || aboutSource.includes("export const metadata")), 'About has metadata');
  assert(aboutSource.includes("generateWebPageJsonLd"), 'About uses generateWebPageJsonLd');
  assert(aboutSource.includes("generateBreadcrumbJsonLd"), 'About uses BreadcrumbList JSON-LD');
  assert(aboutSource.includes("SITE_URL"), 'About imports SITE_URL');
  assert(aboutSource.includes("canonical"), 'About has canonical URL');
  assert(aboutSource.includes("about"), 'About page has /about in source');
  assert(aboutSource.includes("revalidate"), 'About has revalidate');
  assert(aboutSource.includes('Navbar'), 'About includes Navbar');
  assert(aboutSource.includes('Footer'), 'About includes Footer');
  assert(aboutSource.includes('Our Mission'), 'About has mission section');
  assert(aboutSource.includes('What We Offer'), 'About has offerings section');
  assert(aboutSource.includes('Our Values'), 'About has values section');
  assert(aboutSource.includes('Our Reach'), 'About has reach stats section');
  assert(aboutSource.includes('47'), 'About mentions 47 counties');
  assert(aboutSource.includes('43'), 'About mentions 43 categories');
  assert(aboutSource.includes('/jobs'), 'About links to /jobs');
  assert(aboutSource.includes('/blog'), 'About links to /blog');
  assert(aboutSource.includes('/opportunities') || aboutSource.includes('opportunities'), 'About mentions opportunities');

  // ============================================
  // Section 6: Contact page content
  // ============================================
  console.log('6. Contact page content');
  const contactSource = fs.readFileSync(path.join(ROOT, 'src/app/contact/page.tsx'), 'utf8');
  assert(contactSource.includes("metadata") && (contactSource.includes("generateMetadata") || contactSource.includes("export const metadata")), 'Contact has metadata');
  assert(contactSource.includes("generateWebPageJsonLd"), 'Contact uses generateWebPageJsonLd');
  assert(contactSource.includes("generateBreadcrumbJsonLd"), 'Contact uses BreadcrumbList JSON-LD');
  assert(contactSource.includes('info@jobboard.ke'), 'Contact has email');
  assert(contactSource.includes('+254'), 'Contact has phone');
  assert(contactSource.includes('Nairobi'), 'Contact has location');
  assert(contactSource.includes('Business Hours'), 'Contact has business hours');
  assert(contactSource.includes('form'), 'Contact has a form');
  assert(contactSource.includes('subject'), 'Contact form has subject field');
  assert(contactSource.includes('message'), 'Contact form has message field');
  assert(contactSource.includes('/about'), 'Contact links to About');
  assert(contactSource.includes('/privacy-policy'), 'Contact links to Privacy Policy');
  assert(contactSource.includes('/terms-of-service'), 'Contact links to Terms');
  assert(contactSource.includes('/blog'), 'Contact links to Blog');

  // ============================================
  // Section 7: Privacy Policy page content
  // ============================================
  console.log('7. Privacy Policy content');
  const privacySource = fs.readFileSync(path.join(ROOT, 'src/app/privacy-policy/page.tsx'), 'utf8');
  assert(privacySource.includes("metadata") && (privacySource.includes("generateMetadata") || privacySource.includes("export const metadata")), 'Privacy has metadata');
  assert(privacySource.includes("generateWebPageJsonLd"), 'Privacy uses generateWebPageJsonLd');
  assert(privacySource.includes('Information We Collect'), 'Privacy has data collection section');
  assert(privacySource.includes('How We Use Your Information'), 'Privacy has data usage section');
  assert(privacySource.includes('Information Sharing'), 'Privacy has sharing section');
  assert(privacySource.includes('Data Security'), 'Privacy has security section');
  assert(privacySource.includes('Data Retention'), 'Privacy has retention section');
  assert(privacySource.includes('Your Rights'), 'Privacy has rights section');
  assert(privacySource.includes('Children'), 'Privacy has children section');
  assert(privacySource.includes('Kenya Data Protection Act'), 'Privacy mentions Kenya Data Protection Act');
  assert(privacySource.includes('info@jobboard.ke'), 'Privacy has contact email');

  // ============================================
  // Section 8: Terms of Service page content
  // ============================================
  console.log('8. Terms of Service content');
  const termsSource = fs.readFileSync(path.join(ROOT, 'src/app/terms-of-service/page.tsx'), 'utf8');
  assert(termsSource.includes("metadata") && (termsSource.includes("generateMetadata") || termsSource.includes("export const metadata")), 'Terms has metadata');
  assert(termsSource.includes("generateWebPageJsonLd"), 'Terms uses generateWebPageJsonLd');
  assert(termsSource.includes('Use of Services'), 'Terms has use section');
  assert(termsSource.includes('User Accounts'), 'Terms has accounts section');
  assert(termsSource.includes('Job Listings'), 'Terms has listings section');
  assert(termsSource.includes('Prohibited Conduct'), 'Terms has prohibited conduct section');
  assert(termsSource.includes('Intellectual Property'), 'Terms has IP section');
  assert(termsSource.includes('Limitation of Liability'), 'Terms has limitation section');
  assert(termsSource.includes('Indemnification'), 'Terms has indemnification section');
  assert(termsSource.includes('Governing Law'), 'Terms has governing law section');
  assert(termsSource.includes('Republic of Kenya'), 'Terms mentions Kenya law');

  // ============================================
  // Section 9: SEO metadata quality
  // ============================================
  console.log('9. SEO metadata quality');
  // All pages should have unique titles containing "JobBoard Kenya"
  const allSources = [
    { name: 'About', content: aboutSource },
    { name: 'Contact', content: contactSource },
    { name: 'Privacy', content: privacySource },
    { name: 'Terms', content: termsSource },
  ];
  for (const s of allSources) {
    assert(s.content.includes('JobBoard Kenya'), `${s.name} title contains "JobBoard Kenya"`);
    assert(s.content.includes('openGraph'), `${s.name} has OG tags`);
    assert(s.content.includes('twitter'), `${s.name} has Twitter card`);
    assert(s.content.includes('canonical'), `${s.name} has canonical URL`);
    assert(s.content.includes('description'), `${s.name} has description`);
  }

  // ============================================
  // Section 10: Rendered HTML verification
  // ============================================
  console.log('10. Rendered HTML verification');
  for (const p of pages) {
    const htmlPath = path.join(serverAppDir, `${p}.html`);
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      // Check for JSON-LD
      assert(html.includes('application/ld+json'), `${p} has JSON-LD in rendered HTML`);
      assert(html.includes('WebPage'), `${p} has WebPage type in rendered HTML`);
      assert(html.includes('BreadcrumbList'), `${p} has BreadcrumbList in rendered HTML`);
      // Check for canonical
      assert(html.includes(`jobboard.ke/${p}`), `${p} has correct canonical in rendered HTML`);
      // Check for Navbar/Footer
      assert(html.includes('JB'), `${p} has Navbar in rendered HTML`);
      assert(html.includes('JobBoard Kenya'), `${p} has brand in rendered HTML`);
    } else {
      // Try RSC
      const rscPath = path.join(serverAppDir, `${p}.rsc`);
      if (fs.existsSync(rscPath)) {
        const rsc = fs.readFileSync(rscPath, 'utf8');
        assert(rsc.includes('WebPage'), `${p} RSC has WebPage JSON-LD`);
        assert(rsc.includes('BreadcrumbList'), `${p} RSC has BreadcrumbList JSON-LD`);
        assert(rsc.includes('jobboard.ke'), `${p} RSC has jobboard.ke domain`);
      }
    }
  }

  // ============================================
  // Section 11: Revalidation settings
  // ============================================
  console.log('11. Revalidation settings');
  for (const p of pages) {
    const src = fs.readFileSync(path.join(ROOT, `src/app/${p}/page.tsx`), 'utf8');
    assert(src.includes('revalidate'), `${p} has revalidate export`);
  }

  // ============================================
  // Section 12: Total page count
  // ============================================
  console.log('12. Total page count');
  // Previous phases: 645 routes (640 pre-rendered) + 4 static pages = 649 routes (644 pre-rendered)
  const { execSync } = require('child_process');
  const htmlCount = parseInt(execSync(`find "${serverAppDir}" -name "*.html" | wc -l`).toString().trim());
  assert(htmlCount >= 640, `Total pre-rendered HTML files >= 640 (actual: ${htmlCount})`);

  // ============================================
  // Results
  // ============================================
  console.log(`\n=== Phase 8 Results: ${passed}/${passed + failed} passed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });