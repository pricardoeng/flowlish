"use client"
import React from 'react';
import { Flame } from 'lucide-react';

const StreakCard = ({ streaks = 0 }) => {
  return (
    <div className="group relative flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-[#1c1c1f] p-8 shadow-2xl border border-zinc-800 transition-all hover:scale-[1.01] hover:shadow-orange-500/10 hover:border-zinc-700">
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-orange-500 opacity-30 group-hover:opacity-50 transition-opacity rounded-full" />
          <Flame size={52} className="relative text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] fill-orange-500" />
        </div>
        <div>
          <h2 className="text-5xl font-black text-white tracking-tight">{streaks}</h2>
          <span className="text-xs font-black uppercase tracking-widest text-orange-500">Dias de Foco</span>
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-zinc-500 relative z-10">
        Você está no seu melhor ritmo! Continue assim para dominar o inglês rapidamente.
      </p>
    </div>
  );
};

export default StreakCard;
