import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, getBlogPostCounts, BLOG_CATEGORIES, BLOG_CATEGORY_DESCRIPTIONS, formatDate } from '@/lib/blog';
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import GoogleAd from '@/components/jobboard/GoogleAd';

// Remote MySQL: force dynamic to avoid build-time connection exhaustion
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const catLabel = category && category !== 'all' ? category : '';

  const title = catLabel
    ? `${catLabel} Articles - JobBoard Kenya Blog`
    : 'Career Blog - Job Search Tips, Salary Guides & Kenya Job Market Insights | JobBoard Kenya';
  const description = catLabel
    ? `Browse ${catLabel.toLowerCase()} articles on JobBoard Kenya. ${BLOG_CATEGORY_DESCRIPTIONS[catLabel]?.substring(0, 100) || ''}`.substring(0, 160)
    : 'Expert career advice, salary guides, interview tips, and Kenya job market insights. Stay ahead in your career with JobBoard Kenya\'s blog.';

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${category ? `/blog?category=${category}` : '/blog'}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${SITE_URL}${category ? `/blog?category=${category}` : '/blog'}`,
      siteName: 'JobBoard Kenya',
    },
    twitter: { card: 'summary_large_image', title, description: description.substring(0, 160) },
  };
}

export default async function BlogListPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : 'all';

  const [{ posts, total }, counts] = await Promise.all([
    getBlogPosts(category, 1, 12),
    getBlogPostCounts(),
  ]);

  const catLabel = category !== 'all' ? category : 'Blog';
  const pageDesc = category !== 'all' && BLOG_CATEGORY_DESCRIPTIONS[category]
    ? BLOG_CATEGORY_DESCRIPTIONS[category]
    : 'Expert career advice, salary benchmarks, interview strategies, and in-depth analysis of Kenya\'s job market. Our articles help Kenyan job seekers at every stage of their career, from fresh graduates to senior executives. Stay informed about the latest trends, learn practical skills, and make better career decisions with insights from industry professionals and recruitment experts.';

  const collectionLd = generateCollectionPageJsonLd({
    name: `${catLabel} - JobBoard Kenya`,
    description: pageDesc.substring(0, 200),
    url: category !== 'all' ? `/blog?category=${category}` : '/blog',
    itemCount: total,
  });

  const breadcrumbItems = [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }];
  if (category !== 'all') breadcrumbItems.push({ name: catLabel, url: `/blog?category=${category}` });
  const breadcrumbLd = generateBreadcrumbJsonLd(breadcrumbItems);

  const tabs = [
    { key: 'all', label: `All (${counts['all'] || 0})` },
    ...BLOG_CATEGORIES.map((c) => ({ key: c, label: `${c} (${counts[c] || 0})` })),
  ];

  const featuredPosts = posts.filter((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);
  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            {breadcrumbItems.map((item, i) => (
              <span key={item.url} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">/</span>}
                {i < breadcrumbItems.length - 1 ? (
                  <Link href={item.url} className="hover:text-emerald-600 transition">{item.name}</Link>
                ) : (
                  <span className="text-gray-700 font-medium">{item.name}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="section-bg py-8 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📖</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                  {category !== 'all' ? `${catLabel} Articles` : 'Career Blog'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-emerald-600">{total}</span> articles · Expert career advice for Kenyan professionals
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap">
              ← Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.key}
                    href={tab.key === 'all' ? '/blog' : `/blog?category=${tab.key}`}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${category === tab.key ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-white/70 text-gray-600 hover:bg-gray-100 border border-white/60'}`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              {/* Category description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
                <p className="text-sm text-gray-600 leading-relaxed">{pageDesc}</p>
              </div>

              {posts.length > 0 ? (
                <>
                  {/* Featured hero card */}
                  {mainFeatured && (
                    <Link href={`/blog/${mainFeatured.slug}`} className="group relative overflow-hidden rounded-xl border border-white/60 hover:border-emerald-400 transition block">
                      {mainFeatured.coverImageUrl && (
                        <Image src={mainFeatured.coverImageUrl} alt={mainFeatured.title} width={800} height={400} className="w-full h-64 md:h-80 object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6 md:p-8">
                        <span className="inline-block text-xs font-bold text-emerald-300 bg-black/30 px-3 py-1 rounded-full mb-3">Featured</span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug group-hover:text-emerald-200 transition">{mainFeatured.title}</h2>
                        <p className="text-sm text-white/80 mt-2 max-w-lg line-clamp-2">{mainFeatured.excerpt}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                          <span>{formatDate(mainFeatured.datePublished || mainFeatured.datePosted)}</span>
                          <span>{mainFeatured.readTimeMinutes} min read</span>
                          <span className="text-blue-300">{mainFeatured.category}</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Side featured cards */}
                  {sideFeatured.length > 0 && (
                    <div className={`grid gap-4 ${sideFeatured.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {sideFeatured.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden border border-white/60 hover:border-emerald-400 hover:shadow-sm transition">
                          {post.coverImageUrl && (
                            <Image src={post.coverImageUrl} alt={post.title} width={400} height={200} className="w-full h-40 object-cover" />
                          )}
                          <div className="p-4">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{post.category}</span>
                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition mt-1 line-clamp-2">{post.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                              <span>{formatDate(post.datePublished || post.datePosted)}</span>
                              <span>{post.readTimeMinutes} min</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Regular post cards */}
                  {regularPosts.length > 0 && (
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-4">Latest Articles</h2>
                      <div className="space-y-4">
                        {regularPosts.map((post) => (
                          <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                            {post.coverImageUrl ? (
                              <Image src={post.coverImageUrl} alt={post.title} width={160} height={107} className="w-28 h-20 md:w-40 md:h-28 object-cover rounded-lg flex-shrink-0" />
                            ) : (
                              <div className="w-28 h-20 md:w-40 md:h-28 bg-emerald-50 rounded-lg flex-shrink-0 flex items-center justify-center text-emerald-400 text-2xl">📖</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{post.category}</span>
                              <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition mt-1 line-clamp-2">{post.title}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">{post.excerpt}</p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                <span>{post.authorName}</span>
                                <span>·</span>
                                <span>{formatDate(post.datePublished || post.datePosted)}</span>
                                <span>·</span>
                                <span>{post.readTimeMinutes} min read</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-2">No articles in this category yet</h2>
                    <p className="text-sm text-gray-600">We are regularly publishing new career advice and insights. Check back soon or browse other categories.</p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                      <Link href="/blog" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">All Articles →</Link>
                      <Link href="/jobs" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">Browse Jobs →</Link>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                      <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-lg transition text-sm whitespace-nowrap">Get Alerts</button>
                    </div>
                  </div>

                  {/* Cross-link categories */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">Explore Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BLOG_CATEGORIES.filter((c) => c !== category).map((cat) => (
                        <Link key={cat} href={`/blog?category=${cat}`} className="group p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                          <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition block">{cat}</span>
                          <span className="text-xs text-gray-500 line-clamp-2 mt-1 block">{BLOG_CATEGORY_DESCRIPTIONS[cat]?.substring(0, 120)}...</span>
                          <span className="text-xs text-emerald-600 font-medium mt-2 block">{counts[cat] || 0} articles</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Cross-link to jobs */}
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">Looking for Jobs?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Link href="/jobs" className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                        <span className="text-sm font-medium text-gray-700 block">All Jobs</span>
                      </Link>
                      <Link href="/government-jobs" className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                        <span className="text-sm font-medium text-gray-700 block">Government Jobs</span>
                      </Link>
                      <Link href="/opportunities" className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                        <span className="text-sm font-medium text-gray-700 block">Opportunities</span>
                      </Link>
                      <Link href="/categories/technology" className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
                        <span className="text-sm font-medium text-gray-700 block">Tech Jobs</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Blog Overview */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Blog Overview</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Articles</span>
                    <span className="font-medium text-emerald-600">{counts['all'] || 0}</span>
                  </div>
                  {BLOG_CATEGORIES.map((cat) => (
                    <div key={cat} className="flex justify-between">
                      <span className="text-gray-500">{cat}</span>
                      <span className="font-medium text-gray-700">{counts[cat] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Categories</h3>
                <ul className="space-y-1">
                  {BLOG_CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <Link href={`/blog?category=${cat}`} className={`flex items-center justify-between text-sm py-1 transition ${category === cat ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'}`}>
                        <span>{cat}</span>
                        <span className="text-xs text-gray-400">{counts[cat] || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get Career Tips</h4>
                </div>
                <p className="text-xs text-gray-600">Weekly career advice and job market insights delivered to your inbox.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                  <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Bottom Ad */}
      <div className="section-bg pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GoogleAd slot="blog-bottom" format="horizontal" className="rounded-xl" style={{ minHeight: '90px' }} />
        </div>
      </div>
      <Footer />
    </>
  );
}