import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostBySlug, getAllBlogPostSlugs, getRelatedPosts, BLOG_CATEGORIES, formatDate } from '@/lib/blog';
import { generateArticleJsonLd, generateBreadcrumbJsonLd, SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import AdBanner from '@/components/jobboard/AdBanner';

export const revalidate = 60;
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };

  const title = post.seoTitle || `${post.title} | JobBoard Kenya Blog`;
  const description = post.seoDescription || post.excerpt.substring(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: (post.datePublished || post.datePosted).toISOString(),
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: 'JobBoard Kenya',
      section: post.category,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== 'PUBLISHED' || post.deletedAt) notFound();

  const relatedPosts = await getRelatedPosts(post.slug, post.category, 4);

  const articleLd = generateArticleJsonLd({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    datePublished: post.datePublished,
    datePosted: post.datePosted,
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl,
    coverImageUrl: post.coverImageUrl,
    category: post.category,
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.category, url: `/blog?category=${post.category}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-emerald-600 transition">Blog</Link>
            <span>/</span>
            <Link href={`/blog?category=${post.category}`} className="hover:text-emerald-600 transition">{post.category}</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium line-clamp-1">{post.title}</span>
          </nav>
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main content */}
            <article className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-gray-400">{post.readTimeMinutes} min read</span>
                  {post.featured && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 leading-tight">{post.title}</h1>
                <p className="text-sm text-gray-500 mt-3">
                  <span className="font-medium text-gray-700">{post.authorName}</span>
                  <span className="text-gray-300 mx-2">·</span>
                  <span>{formatDate(post.datePublished || post.datePosted)}</span>
                </p>
              </div>

              {/* Cover image */}
              {post.coverImageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/60">
                  <Image src={post.coverImageUrl} alt={post.title} width={1200} height={630} className="w-full h-64 md:h-96 object-cover" />
                </div>
              )}

              <AdBanner slot="2222222222" className="my-4" />

              {/* Content */}
              <div className="prose prose-sm sm:prose-base max-w-none bg-white/70 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/60">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content.replace(/^## (.*$)/gm, '<h2 class="text-lg font-extrabold text-gray-800 mt-8 mb-3">$1</h2>').replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-gray-800 mt-6 mb-2">$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p class="mb-4">').replace(/^(?!<)/, '<p class="mb-4">') }} />
              </div>

              {/* Tags */}
              <AdBanner slot="3333333333" className="my-4" />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-6 border border-emerald-200/60">
                <p className="text-sm text-gray-700 font-medium">Ready to find your next opportunity?</p>
                <div className="flex gap-3">
                  <Link href="/jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200">Browse Jobs →</Link>
                  <Link href="/opportunities" className="bg-white text-emerald-600 hover:text-emerald-700 font-bold px-6 py-3 rounded-lg transition text-sm border border-emerald-300">Opportunities →</Link>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-4">Related Articles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedPosts.map((rp) => (
                      <Link key={rp.id} href={`/blog/${rp.slug}`} className="group bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden border border-white/60 hover:border-emerald-400 hover:shadow-sm transition">
                        {rp.coverImageUrl && (
                          <Image src={rp.coverImageUrl} alt={rp.title} width={400} height={200} className="w-full h-32 object-cover" />
                        )}
                        <div className="p-4">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{rp.category}</span>
                          <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition mt-1 line-clamp-2">{rp.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                            <span>{formatDate(rp.datePublished || rp.datePosted)}</span>
                            <span>{rp.readTimeMinutes} min</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Author */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Author</h3>
                <p className="text-sm font-medium text-gray-800">{post.authorName}</p>
              </div>

              {/* Article Info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Article Info</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-700">{post.category}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Read Time</span><span className="font-medium text-gray-700">{post.readTimeMinutes} min</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Published</span><span className="font-medium text-gray-700">{formatDate(post.datePublished || post.datePosted)}</span></div>
                </div>
              </div>

              {/* Browse */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Browse</h3>
                <ul className="space-y-1">
                  <li><Link href={`/blog?category=${post.category}`} className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">All {post.category} →</Link></li>
                  <li><Link href="/blog" className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">All Articles →</Link></li>
                  <li><Link href="/jobs" className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">Browse Jobs →</Link></li>
                  <li><Link href="/opportunities" className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">Opportunities →</Link></li>
                </ul>
              </div>

              {/* Other Categories */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-3 mb-3">Explore Topics</h3>
                <ul className="space-y-1">
                  {BLOG_CATEGORIES.filter((c) => c !== post.category).map((cat) => (
                    <li key={cat}><Link href={`/blog?category=${cat}`} className="text-sm text-gray-700 hover:text-emerald-600 transition p-2 block rounded-lg hover:bg-emerald-50/50">{cat} →</Link></li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-xl p-5 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📬</span>
                  <h4 className="text-sm font-bold text-gray-700">Get Career Tips</h4>
                </div>
                <p className="text-xs text-gray-600">Weekly career advice delivered to your inbox.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-emerald-600" />
                  <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition text-sm">Subscribe</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}