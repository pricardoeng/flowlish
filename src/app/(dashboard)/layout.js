import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Link from 'next/link';
import { Crown } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-6 backdrop-blur-md lg:hidden transition-colors">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Crown size={22} className="text-orange-500" />
            </button>
        </div>
      </div>

      <Sidebar />
      
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
        <div className="mx-auto max-w-5xl p-6 md:p-10">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
