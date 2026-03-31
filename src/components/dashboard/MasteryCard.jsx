"use client"
import React from 'react';
import { cn } from '@/lib/utils';

const MasteryCard = ({ mastery = {} }) => {
  const levels = [
    { id: 'A1', label: 'Iniciante', color: 'bg-primary' },
    { id: 'A2', label: 'Básico', color: 'bg-primary' },
    { id: 'B1', label: 'Intermediário', color: 'bg-primary' },
    { id: 'B2', label: 'Avançado Base', color: 'bg-primary' },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01] hover:shadow-2xl">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-tight">Chunks Dominados</h3>
      <div className="space-y-5">
        {levels.map((lvl) => {
          const percent = mastery[lvl.id] || 0;
          return (
            <div key={lvl.id} className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-zinc-500 dark:text-zinc-400">{lvl.id} • {lvl.label}</span>
                <span className="text-primary">{percent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", lvl.color)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasteryCard;
