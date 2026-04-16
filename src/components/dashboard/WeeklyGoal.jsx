"use client"
import React from 'react';
import { cn } from '@/lib/utils';

// Labels de Segunda (índice 0) a Domingo (índice 6) — alinhado com semana Mon-based
const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/**
 * Componente apresentacional puro.
 * Props vindas do servidor (page.js), sem localStorage.
 * @param {boolean[]} completedDays - array[7] indicando quais dias da semana foram concluídos
 * @param {number} percent - 0-100
 */
const WeeklyGoal = ({ completedDays = [], percent = 0 }) => {
  // Índice do dia atual na semana (0=Seg, 6=Dom)
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex items-center gap-8 rounded-[2rem] bg-[#1c1c1f] p-6 md:p-8 shadow-2xl border border-zinc-800 transition-all hover:scale-[1.01] hover:border-zinc-700">
      {/* Circle progress */}
      <div className="relative h-24 w-24 flex-shrink-0">
        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-800" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="16" fill="none"
            className="stroke-orange-500 transition-all duration-1000 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]"
            strokeWidth="3"
            strokeDasharray="100 100"
            strokeDashoffset={100 - percent}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black leading-none text-white">{percent}%</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">Meta</span>
        </div>
      </div>

      {/* Days row */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Ritmo Semanal</span>
        <div className="flex gap-2">
          {DAY_LABELS.map((day, i) => {
            const isDone = completedDays[i] ?? false;
            const isToday = i === todayIndex;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold",
                  isToday ? "text-orange-500" : "text-zinc-600"
                )}>{day}</span>
                <div className={cn(
                  "h-3 w-3 rounded-full border-2 transition-all duration-300",
                  isDone
                    ? "bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                    : isToday
                      ? "border-orange-500"
                      : "border-zinc-700"
                )} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoal;


