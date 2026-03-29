"use client"
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const StreakCard = ({ streaks = 0 }) => {
  return (
    <div className="group relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-zinc-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Flame size={48} className="text-orange-500 animate-pulse fill-orange-500" />
          <div className="absolute inset-0 blur-xl bg-orange-400 opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <div>
          <h2 className="text-5xl font-black text-zinc-900 tracking-tight">{streaks}</h2>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Dias de Foco</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-600">
        Você está no seu melhor ritmo! Continue assim para dominar o inglês rapidamente.
      </p>
    </div>
  );
};

export default StreakCard;
