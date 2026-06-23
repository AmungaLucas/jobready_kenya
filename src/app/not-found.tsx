import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found - 404 | JobBoard Kenya',
  description: 'The page you are looking for does not exist. Browse jobs, categories, or return to the JobBoard Kenya homepage.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center section-bg">
      <div className="text-center px-4 max-w-lg">
        <div className="text-7xl font-extrabold text-emerald-600 mb-4">404</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          The page you are looking for may have been moved, deleted, or never existed. Try browsing our jobs, categories, or locations to find what you need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition text-sm shadow-md shadow-emerald-200"
          >
            Go to Homepage
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition border border-emerald-200 px-6 py-3 rounded-lg hover:bg-emerald-50"
          >
            Browse Jobs
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <Link href="/jobs" className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
            <span className="text-sm font-medium text-gray-700 block">All Jobs</span>
          </Link>
          <Link href="/categories/technology" className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
            <span className="text-sm font-medium text-gray-700 block">Tech Jobs</span>
          </Link>
          <Link href="/government-jobs" className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
            <span className="text-sm font-medium text-gray-700 block">Govt Jobs</span>
          </Link>
          <Link href="/blog" className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 hover:border-emerald-300 hover:shadow-sm transition">
            <span className="text-sm font-medium text-gray-700 block">Blog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}