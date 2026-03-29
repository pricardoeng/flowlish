"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Mic, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModals } from '@/context/ModalContext';

import Image from 'next/image';

const Sidebar = () => {
  const { openUpgrade } = useModals();
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home, href: '/' },
    { id: 'dictionary', label: 'Dicionário', icon: BookOpen, href: '/dictionary' },
    { id: 'practice', label: 'Praticar', icon: Mic, href: '/practice' },
    { id: 'profile', label: 'Perfil', icon: Settings, href: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-zinc-200 bg-white p-6 lg:flex shadow-sm">
      <Link href="/" className="mb-10 flex items-center px-4 py-2 transition-opacity hover:opacity-80">
        <img 
          src="/images/logo_full.png" 
          alt="Flowlish Logo" 
          className="h-10 w-auto object-contain"
          style={{ minWidth: '140px' }}
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
                  ? "bg-primary-light text-primary" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon size={20} spellCheck={false} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
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
