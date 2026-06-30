import Navbar from '@/components/jobboard/Navbar';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col" style={{ paddingTop: '80px' }}>
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
