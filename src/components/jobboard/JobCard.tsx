import Link from 'next/link';
import type { Job } from '@/data/jobs';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`} className="job-card block bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 transition">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="job-title text-lg font-extrabold text-gray-800 transition">{job.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
            <span className="font-medium text-gray-700">{job.company}</span>
            <span className="text-gray-300">•</span>
            <span>{job.location}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {job.match}% Match
          </span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{job.type}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
        <span>💰 {job.salary}</span>
        <span>•</span>
        <span>📅 Posted {job.posted}</span>
        <span>•</span>
        <span>⏳ Closes {job.deadline}</span>
      </div>
    </Link>
  );
}