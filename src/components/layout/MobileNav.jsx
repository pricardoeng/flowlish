"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, Settings, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

import Image from 'next/image';

const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, href: '/' },
    { id: 'dictionary', label: 'Explorar', icon: BookOpen, href: '/dictionary' },
    { id: 'practice', label: 'Praticar', icon: Mic, href: '/practice' },
    { id: 'profile', label: 'Perfil', icon: Settings, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-zinc-800 bg-[#1c1c1f]/90 backdrop-blur-xl p-2 pb-6 lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1.5 px-5 py-2 rounded-2xl transition-all duration-200",
              isActive 
                ? "text-orange-500 bg-orange-500/10" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-wider transition-all",
              isActive ? "text-orange-500" : "text-zinc-600"
            )}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
