"use client"
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterPanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentFilters = {
    query: searchParams.get('query') || '',
    level: searchParams.get('level'),
    theme: searchParams.get('theme'),
  };

  // Real data for levels and themes
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const themes = ['Business', 'Casual', 'Travel', 'Academic', 'Social', 'Idiom'];

  return (
    <div className="flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text"
          placeholder="O que você quer aprender hoje?"
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-hidden transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-premium"
          value={currentFilters.query}
          onChange={(e) => setFilter('query', e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2 text-zinc-500 dark:text-zinc-400 text-sm font-black uppercase tracking-widest transition-colors">
          <Filter size={16} />
          <span>Filtros</span>
        </div>
        
        {levels.map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilter('level', currentFilters.level === lvl ? null : lvl)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              currentFilters.level === lvl 
                ? "bg-zinc-900 dark:bg-primary border-zinc-900 dark:border-primary text-white" 
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-primary hover:text-primary"
            )}
          >
            {lvl}
          </button>
        ))}

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2 transition-colors" />

        {themes.map(theme => (
          <button
            key={theme}
            onClick={() => setFilter('theme', currentFilters.theme === theme ? null : theme)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              currentFilters.theme === theme 
                ? "bg-primary border-primary text-white" 
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-primary hover:text-primary shadow-sm"
            )}
          >
            {theme}
          </button>
        ))}

        {(currentFilters.level || currentFilters.theme || currentFilters.query) && (
          <button 
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Limpar <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
