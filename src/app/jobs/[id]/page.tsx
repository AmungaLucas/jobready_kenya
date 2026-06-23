import { jobs } from '@/data/jobs';
import { notFound } from 'next/navigation';
import JobDetailsContent from '@/components/jobboard/JobDetailsContent';
import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const job = jobs.find(j => j.id === id);
  if (!job) notFound();

  const similar = jobs.filter(j => j.id !== job.id && j.category === job.category).slice(0, 3);

  return (
    <>
      <Navbar />
      <JobDetailsContent job={job} similar={similar} />
      <Footer />
    </>
  );
}