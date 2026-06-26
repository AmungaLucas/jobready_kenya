import Link from 'next/link';
import { UPDATE_TYPE_ICONS, UPDATE_TYPE_LABELS, UPDATE_TAG_COLORS } from '@/lib/updates';

interface UpdateItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  updateType: string;
  sourceName: string;
  imageUrl: string | null;
  hasPdf: boolean;
  datePosted: Date;
  featured: boolean;
}

export default function UpdateList({ updates }: { updates: UpdateItem[] }) {
  return (
    <div className="divide-y divide-gray-200/60">
      {updates.map((update) => (
        <Link
          key={update.id}
          href={`/updates/${update.slug}`}
          className="flex items-start gap-3 py-4 group"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {UPDATE_TYPE_ICONS[update.updateType] || '\uD83D\uDCE1'}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 leading-relaxed group-hover:text-emerald-700 transition">
              {update.title}
            </h3>
            {update.summary && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{update.summary}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`text-xs font-medium ${UPDATE_TAG_COLORS[update.updateType] || 'text-gray-600'}`}>
                {UPDATE_TYPE_LABELS[update.updateType] || update.updateType}
              </span>
              <span className="text-xs text-gray-300">&middot;</span>
              <span className="text-xs text-gray-400">{update.sourceName}</span>
              <span className="text-xs text-gray-300">&middot;</span>
              <span className="text-xs text-gray-400">
                {update.datePosted.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {update.hasPdf && (
                <>
                  <span className="text-xs text-gray-300">&middot;</span>
                  <span className="text-xs text-red-500 font-medium">PDF</span>
                </>
              )}
              {update.imageUrl && (
                <>
                  <span className="text-xs text-gray-300">&middot;</span>
                  <span className="text-xs text-gray-400">Image</span>
                </>
              )}
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-emerald-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}