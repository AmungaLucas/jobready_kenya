import Link from 'next/link';
import { formatSalary, timeAgo, formatDate, employmentTypeLabels } from '@/lib/jobs';

interface JobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    locationCity: string | null;
    locationCounty: string | null;
    employmentType: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryDisclosure: string;
    datePosted: Date;
    deadline: Date | null;
    featured?: boolean;
    isRemote?: boolean;
    organization: { orgName: string } | null;
    category?: { label: string } | null;
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="job-card block bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/60 transition">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="job-title text-base sm:text-lg font-extrabold text-gray-800 transition leading-snug">{job.title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="font-medium text-gray-700">{job.organization?.orgName || 'Confidential'}</span>
            <span className="text-gray-300">•</span>
            <span>{job.locationCity || job.locationCounty}</span>
            {job.isRemote && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-600 font-medium">Remote</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {job.featured && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">Featured</span>
          )}
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            {employmentTypeLabels[job.employmentType || ''] || job.employmentType}
          </span>
        </div>
      </div>
      {job.category && (
        <p className="text-xs text-gray-400 mt-1">{job.category.label}</p>
      )}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
        <span>💰 {formatSalary(job as any)}</span>
        <span>•</span>
        <span>📅 {timeAgo(job.datePosted)}</span>
        <span>•</span>
        <span>⏳ Closes {formatDate(job.deadline)}</span>
      </div>
    </Link>
  );
}