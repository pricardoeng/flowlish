"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, Settings, Crown, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModals } from '@/context/ModalContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';

const Sidebar = () => {
  const { openUpgrade } = useModals();
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, href: '/' },
    { id: 'dictionary', label: 'Explorar', icon: BookOpen, href: '/dictionary' },
    { id: 'practice', label: 'Praticar', icon: Mic, href: '/practice' },
    { id: 'profile', label: 'Perfil', icon: Settings, href: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-[#1c1c1f]/95 backdrop-blur-xl p-6 lg:flex shadow-2xl transition-colors z-40">
      <Link href="/" className="mb-10 block px-2 py-2">
        <Logo />
      </Link>
      
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative overflow-hidden",
                isActive 
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-white border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-orange-500" />
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="group relative flex items-center gap-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-3 transition-colors hover:bg-zinc-800">
          <div className="h-10 w-10 shrink-0">
            <img 
              src="/images/mascot.png" 
              alt="Mango Mascot" 
              className="h-full w-full object-contain transition-transform group-hover:-rotate-12"
            />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 leading-tight">
            "Vamos dominar esses <span className="text-orange-500">chunks</span> juntos!"
          </p>
        </div>
        
        <div className="flex justify-start px-2">
          <ThemeToggle />
        </div>
        <button 
          onClick={openUpgrade}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 shadow-lg"
        >
          <div className="relative z-10 flex items-center justify-center gap-2 font-black text-sm">
            <Crown size={18} />
            <span>Upgrade to Pro</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
