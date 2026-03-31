"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModals } from '@/context/ModalContext';

import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Sidebar = () => {
  const { openUpgrade } = useModals();
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, href: '/' },
    { id: 'dictionary', label: 'Dicionário', icon: BookOpen, href: '/dictionary' },
    { id: 'practice', label: 'Praticar', icon: Mic, href: '/practice' },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen, href: '/practice/flashcards' }, /* Reusing BookOpen icon as placeholder for Cards */
    { id: 'profile', label: 'Perfil', icon: Settings, href: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 lg:flex shadow-sm transition-colors">
      <Link href="/" className="mb-10 flex items-center px-2 py-2 transition-opacity hover:opacity-80">
        <img 
          src="/images/logo_mango_large.png" 
          alt="Mango Logo" 
          className="h-12 w-auto object-contain"
        />
      </Link>
      
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-primary-light dark:bg-orange-500/10 text-primary" 
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <item.icon size={20} spellCheck={false} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-6">
        <div className="group relative flex items-center gap-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-3 transition-colors hover:bg-primary/5">
          <div className="h-10 w-10 shrink-0">
            <img 
              src="/images/mascot.png" 
              alt="Mango Mascot" 
              className="h-full w-full object-contain transition-transform group-hover:-rotate-12"
            />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight">
            "Vamos dominar esses <span className="text-primary">chunks</span> juntos!"
          </p>
        </div>
        
        <div className="flex justify-start px-2">
          <ThemeToggle />
        </div>
        <button 
          onClick={openUpgrade}
          className="group relative w-full overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-premium transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95"
        >
          <div className="relative z-10 flex items-center justify-center gap-2 font-bold">
            <Crown size={18} />
            <span>Upgrade to Pro</span>
          </div>
          <div className="absolute inset-0 z-0 bg-linear-to-br from-primary to-primary-dark opacity-100 transition-opacity"></div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
