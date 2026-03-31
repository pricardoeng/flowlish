"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

import Image from 'next/image';

const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, href: '/' },
    { id: 'dictionary', label: 'Explorar', icon: BookOpen, href: '/dictionary' },
    { id: 'practice', label: 'Treinar', icon: Mic, href: '/practice' },
    { id: 'flashcards', label: 'Cartas', icon: BookOpen, href: '/practice/flashcards' },
    { id: 'profile', label: 'Meu Perfil', icon: Settings, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 p-2 pb-6 backdrop-blur-lg lg:hidden transition-colors">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {isActive && (
              <div className="absolute -top-1 h-1 w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
