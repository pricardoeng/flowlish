"use client"
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Library, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterPanel = ({ availablePacks = [] }) => {
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
    pack: searchParams.get('pack'),
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  const filterGroups = [
    { 
      title: 'Temas Profissionais', 
      items: ['Tecnologia', 'Medicina', 'Jurídico', 'Financeiro', 'Projetos', 'Engenharia', 'Corporativo'] 
    },
    { 
      title: 'Experiência de Vida', 
      items: ['Viajar', 'Viver', 'Estudar', 'Trabalhar'] 
    },
    { 
      title: 'Especialidades', 
      items: ['Avançado', 'Acadêmico'] 
    },
    {
      title: 'Geral',
      items: ['Casual']
    }
  ].map(group => ({
    ...group,
    items: group.items.filter(item => availablePacks.includes(item))
  })).filter(group => group.items.length > 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-premium transition-all">
      {/* Levels - Compact Chips */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Nível:</span>
        <div className="flex items-center gap-2">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter('level', currentFilters.level === lvl ? null : lvl)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all border",
                currentFilters.level === lvl 
                  ? "bg-primary border-primary text-white shadow-lg scale-110" 
                  : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Categories - Sleek Select/Dropdown */}
      <div className="flex-1 max-w-md w-full relative">
        <select
          value={currentFilters.pack || ''}
          onChange={(e) => setFilter('pack', e.target.value || null)}
          className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-transparent rounded-2xl py-3 pl-5 pr-10 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all outline-hidden cursor-pointer"
        >
          <option value="">Todos os Conteúdos</option>
          {filterGroups.map(group => (
            <optgroup key={group.title} label={group.title}>
              {group.items.map(pack => (
                <option key={pack} value={pack}>{pack}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      {(currentFilters.level || currentFilters.pack) && (
        <button 
          onClick={() => router.push(pathname)}
          className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <X size={14} /> Limpar
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
