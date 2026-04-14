"use client"
import React from 'react';
import { cn } from '@/lib/utils';

import { LEVEL_CONFIG } from '@/config/levels';

const MasteryCard = ({ masteryData = {} }) => {
  const levelsWithData = Object.values(LEVEL_CONFIG).filter(l => masteryData[l.id]?.total > 0);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950/50 dark:bg-zinc-950/50 p-8 shadow-2xl border border-zinc-800/60 transition-all hover:scale-[1.01] hover:shadow-primary/5 group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <h3 className="relative z-10 text-lg font-black text-white mb-6 uppercase tracking-tight">Chunks Dominados</h3>

      {levelsWithData.length === 0 ? (
        <p className="text-sm text-zinc-400 italic">Nenhum chunk encontrado no banco de dados.</p>
      ) : (
        <div className="space-y-5">
          {levelsWithData.map((lvl) => {
            const data = masteryData[lvl.id] || { total: 0, mastered: 0, percent: 0 };
            return (
              <div key={lvl.id} className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500 dark:text-zinc-400">{lvl.id} • {lvl.ptLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 dark:text-zinc-500 font-bold normal-case text-[10px] tracking-normal">
                      {data.mastered}/{data.total}
                    </span>
                    <span className={cn(
                      "font-black",
                      data.percent > 0 ? "text-primary" : "text-zinc-300 dark:text-zinc-600"
                    )}>
                      {data.percent}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", lvl.bg)}
                    style={{ width: `${data.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MasteryCard;
