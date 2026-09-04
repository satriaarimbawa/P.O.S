'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Key, BarChart2, FileText, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tenants / Kafe', href: '/tenants', icon: Users },
  { name: 'Lisensi', href: '/licenses', icon: Key },
  { name: 'Analitik Global', href: '/analytics', icon: BarChart2 },
  { name: 'Billing & Invoice', href: '/billing', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-navy text-white">
      <div className="flex h-16 items-center justify-center border-b border-white/10">
        <h1 className="text-xl font-bold text-coral">KopiPOS Vendor Hub</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-white/10 text-coral' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}
