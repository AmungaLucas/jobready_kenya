"""Test all pages via raw HTTP sockets — works in this sandbox where urllib/curl fail."""
import socket, select, re, json, sys, time

def http_get(path, timeout=15):
    """Send HTTP request and return (status, headers_dict, body_str)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect(('127.0.0.1', 3000))
        req = f'GET {path} HTTP/1.0\r\nHost: localhost\r\nConnection: close\r\n\r\n'
        s.sendall(req.encode())
        
        # Receive full response in chunks
        chunks = []
        while True:
            ready = select.select([s], [], [], timeout)
            if not ready[0]:
                break
            chunk = s.recv(65536)
            if not chunk:
                break
            chunks.append(chunk)
        
        raw = b''.join(chunks).decode('utf-8', errors='replace')
        if not raw:
            return 0, {}, ''
        
        header_end = raw.find('\r\n\r\n')
        if header_end == -1:
            header_end = raw.find('\n\n')
            sep_len = 2
        else:
            sep_len = 4
        
        header_section = raw[:header_end]
        body = raw[header_end + sep_len:]
        
        first_line = header_section.split('\r\n')[0] if '\r\n' in header_section else header_section.split('\n')[0]
        status = int(first_line.split(' ')[1]) if len(first_line.split(' ')) > 1 else 0
        
        # Parse headers
        headers = {}
        for line in header_section.split('\r\n')[1:]:
            if ':' in line:
                k, v = line.split(':', 1)
                headers[k.strip().lower()] = v.strip()
        
        return status, headers, body
    except socket.timeout:
        return 0, {}, ''
    except Exception as e:
        return 0, {}, str(e)
    finally:
        s.close()

def check(body, *strings):
    """Return dict of string -> bool for presence checks."""
    return {s: s in body for s in strings}

# ===== TESTS =====
results = []
errors = []

def test(label, path, checks=None, section=""):
    code, headers, body = http_get(path)
    status = "OK" if code == 200 else f"ERR({code})"
    size = len(body)
    line = f"  [{status}] {path} ({size:,}b)"
    
    if checks and body:
        present = {k: "Y" if v else "N" for k, v in check(body, *checks).items()}
        extras = " ".join(f"{k}:{v}" for k, v in present.items())
        line += f" | {extras}"
    
    if code != 200:
        errors.append(f"{section} {path} -> {code}")
    
    print(line)
    results.append((label, path, code, size))
    time.sleep(0.4)

# 1. STATIC PAGES
print("=" * 70)
print("1. STATIC PAGES")
print("=" * 70)
for p in ["/", "/about", "/contact", "/privacy-policy", "/terms-of-service", "/faq", "/cv-services", "/cv-matching"]:
    test("static", p, section="static")

# 2. LISTING PAGES
print("\n" + "=" * 70)
print("2. LISTING PAGES (ISR)")
print("=" * 70)
for p in ["/jobs", "/categories", "/locations", "/government-jobs", "/opportunities", "/blog"]:
    test("listing", p, ("adsbygoogle",), section="listing")

# 3. JOB DETAIL
print("\n" + "=" * 70)
print("3. JOB DETAIL PAGES")
print("=" * 70)
for p in ["/jobs/project-coordinator-unicef-nairobi", 
          "/jobs/marketing-manager-co-operative-bank-nairobi",
          "/jobs/data-analyst-kenya-revenue-authority-nairobi"]:
    test("job", p, ("FAQPage", "Frequently Asked Questions", "Why This Role Stands Out", 
                     "How to Apply", "adsbygoogle", "JobPosting", "BreadcrumbList"), section="job")

# 4. CATEGORY
print("\n" + "=" * 70)
print("4. CATEGORY & SUBCATEGORY")
print("=" * 70)
for p in ["/categories/technology", "/categories/healthcare", "/categories/finance",
          "/categories/technology/software-engineering", "/categories/technology/web-development"]:
    test("category", p, section="category")

# 5. LOCATION
print("\n" + "=" * 70)
print("5. LOCATION PAGES")
print("=" * 70)
for p in ["/locations/nairobi", "/locations/mombasa", "/locations/kiambu", "/locations/nakuru"]:
    test("location", p, section="location")

# 6. GOVERNMENT
print("\n" + "=" * 70)
print("6. GOVERNMENT JOBS")
print("=" * 70)
for p in ["/government-jobs/nairobi", "/government-jobs/kiambu", "/government-jobs/mombasa"]:
    test("gov", p, section="gov")

# 7. SITEMAP & ROBOTS
print("\n" + "=" * 70)
print("7. SITEMAP & ROBOTS")
print("=" * 70)
code, headers, body = http_get("/sitemap.xml")
has_jobs = "/jobs/" in body if body else False
print(f"  [{'OK' if code == 200 else 'ERR'}] /sitemap.xml ({len(body):,}b) | HasJobURLs:{'Y' if has_jobs else 'N'}")
if code != 200: errors.append(f"sitemap -> {code}")
results.append(("sitemap", "/sitemap.xml", code, len(body)))

code, _, body = http_get("/robots.txt")
has_ref = "sitemap.xml" in body if body else False
print(f"  [{'OK' if code == 200 else 'ERR'}] /robots.txt ({len(body):,}b) | SitemapRef:{'Y' if has_ref else 'N'}")
if code != 200: errors.append(f"robots -> {code}")
results.append(("robots", "/robots.txt", code, len(body)))

# 8. SECURITY HEADERS
print("\n" + "=" * 70)
print("8. SECURITY HEADERS (from homepage)")
print("=" * 70)
_, hdrs, _ = http_get("/")
for h in ['x-frame-options', 'x-content-type-options', 'referrer-policy', 
          'x-dns-prefetch-control', 'permissions-policy', 'strict-transport-security']:
    val = hdrs.get(h, 'MISSING')
    print(f"  {'Y' if val != 'MISSING' else 'N'} {h}: {val}")

# 9. 404
print("\n" + "=" * 70)
print("9. 404 HANDLING")
print("=" * 70)
code, _, body = http_get("/this-does-not-exist-xyz")
print(f"  [{'OK' if code == 404 else 'ERR'}] /this-does-not-exist-xyz -> {code}")
if code != 404: errors.append(f"404 -> {code}")

# 10. BLOG + OPPORTUNITY DETAILS
print("\n" + "=" * 70)
print("10. BLOG & OPPORTUNITY DETAILS")
print("=" * 70)
# Fetch listing to find slugs
_, _, blog_html = http_get("/blog")
blog_slugs = list(dict.fromkeys(re.findall(r'href="/blog/([a-z0-9-]+)"', blog_html)))[:3]
blog_slugs = [s for s in blog_slugs if s not in ('page', 'category')]
for slug in blog_slugs:
    test("blog", f"/blog/{slug}", ("adsbygoogle",), section="blog")

_, _, opp_html = http_get("/opportunities")
opp_slugs = list(dict.fromkeys(re.findall(r'href="/opportunities/([a-z0-9-]+)"', opp_html)))[:3]
for slug in opp_slugs:
    test("opp", f"/opportunities/{slug}", section="opp")

# SUMMARY
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
ok = sum(1 for _, _, c, _ in results if c == 200)
fail = sum(1 for _, _, c, _ in results if c != 200)
print(f"  Total tests: {len(results)}")
print(f"  Passed: {ok}")
print(f"  Failed: {fail}")
if errors:
    print(f"  Errors: {errors}")
else:
    print("  All pages returned 200 OK!")