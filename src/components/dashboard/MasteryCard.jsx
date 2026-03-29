"use client"
import React from 'react';

const MasteryCard = ({ mastery = {} }) => {
  const levels = [
    { id: 'A1', label: 'Iniciante', color: 'bg-emerald-500' },
    { id: 'A2', label: 'Básico', color: 'bg-emerald-500' },
    { id: 'B1', label: 'Intermediário', color: 'bg-emerald-500' },
    { id: 'B2', label: 'Avançado Base', color: 'bg-emerald-500' },
  ];

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-100">
      <h3 className="text-lg font-bold text-zinc-900 mb-6">Chunks Dominados</h3>
      <div className="space-y-5">
        {levels.map((lvl) => {
          const percent = mastery[lvl.id] || 0;
          return (
            <div key={lvl.id} className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-zinc-600">{lvl.id} • {lvl.label}</span>
                <span className="text-primary">{percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
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

import { cn } from '@/lib/utils';
export default MasteryCard;
