'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Gift,
  Settings,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/referrals', label: 'Referrals', icon: Gift },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b7e4a] text-white font-bold text-sm">
          JR
        </div>
        <div>
          <span className="text-[#0C1D32] text-lg font-bold leading-tight block">JobReady</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#0b7e4a] bg-[#0b7e4a]/10 rounded-full px-2 py-0.5 mt-0.5">
            <Shield className="w-2.5 h-2.5" /> Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#0b7e4a]/10 text-[#0b7e4a]'
                  : 'text-[#6b6b6b] hover:bg-gray-100 hover:text-[#0C1D32]'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#0b7e4a]' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-4">
        <p className="text-xs text-[#6b6b6b]">
          &copy; {new Date().getFullYear()} JobReady Kenya
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b7e4a] text-white font-bold text-xs">
            JR
          </div>
          <span className="text-[#0C1D32] font-bold">JobReady</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0b7e4a] bg-[#0b7e4a]/10 rounded-full px-2 py-0.5">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-[#0C1D32]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop layout */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 fixed inset-y-0 bg-white border-r border-gray-200 overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}