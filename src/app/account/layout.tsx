import Navbar from '@/components/jobboard/Navbar';
import Footer from '@/components/jobboard/Footer';
import AccountNav from './AccountNav';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="dashboard-layout" style={{ paddingTop: '80px' }}>
        <AccountNav />
        <main className="dashboard-main">{children}</main>
      </div>
      <Footer />
    </>
  );
}