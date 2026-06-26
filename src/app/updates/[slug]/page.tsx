import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUpdateBySlug, UPDATE_TYPE_LABELS, UPDATE_TYPE_ICONS, UPDATE_TAG_COLORS } from '@/lib/updates';
import { SITE_URL } from '@/lib/jsonld';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);
  if (!update) return { title: 'Update Not Found' };

  const typeLabel = UPDATE_TYPE_LABELS[update.updateType] || update.updateType;
  const title = update.seoTitle || `${update.title} | JobBoard Kenya`;
  const description = update.seoDescription || update.summary || `${update.title} — ${typeLabel} update from ${update.sourceName}. Read the full notice on JobBoard Kenya.`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: { canonical: `${SITE_URL}/updates/${update.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: description.substring(0, 160),
      type: 'article',
      publishedTime: (update.datePublished || update.datePosted).toISOString(),
      url: `${SITE_URL}/updates/${update.slug}`,
      siteName: 'JobBoard Kenya',
      images: update.imageUrl ? [{ url: update.imageUrl, width: 1200, height: 630, alt: update.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function UpdateDetailPage({ params }: Props) {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);
  if (!update || update.status !== 'PUBLISHED' || update.deletedAt) notFound();

  const typeLabel = UPDATE_TYPE_LABELS[update.updateType] || update.updateType;
  const typeIcon = UPDATE_TYPE_ICONS[update.updateType] || '\uD83D\uDCE1';
  const tagColor = UPDATE_TAG_COLORS[update.updateType] || 'text-gray-700';

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <section className="section-bg py-4 border-b border-gray-200/50" style={{ paddingTop: '88px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
            <span>/</span>
            <Link href="/updates" className="hover:text-emerald-600 transition">Updates</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none">{update.title}</span>
          </nav>
        </div>
      </section>

      <section className="section-bg py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{typeIcon}</span>
                <span className={`text-xs font-medium ${tagColor}`}>{typeLabel}</span>
                {update.featured && (
                  <span className="text-xs font-medium text-amber-700">Featured</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">
                {update.title}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700">{update.sourceName}</span>
                <span className="text-gray-300 mx-2">&middot;</span>
                <span>{(update.datePublished || update.datePosted).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>

            {/* Image */}
            {update.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200/50">
                <Image
                  src={update.imageUrl}
                  alt={update.title}
                  width={1200}
                  height={630}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            )}

            {/* Content */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/60">
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {update.body}
              </div>
            </div>

            {/* PDF Attachment */}
            {update.pdfUrl && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                      <path d="M8 12h8v1.5H8V12zm0 3h6v1.5H8V15z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Official Document</p>
                    <p className="text-xs text-gray-500 mt-0.5">Download the original PDF notice from {update.sourceName}</p>
                  </div>
                  <a
                    href={update.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex-shrink-0"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            )}

            {/* Source link */}
            {update.sourceUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Source: {update.sourceName}</span>
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                >
                  Visit official website &rarr;
                </a>
              </div>
            )}

            {/* Back link */}
            <div className="pt-4 border-t border-gray-200/50">
              <Link
                href="/updates"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
              >
                &larr; Back to all updates
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}