"use client"
import React from 'react';
import { cn } from '@/lib/utils';

const WeeklyGoal = ({ percent = 75 }) => {
  const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const completedDays = 4;

  return (
    <div className="flex items-center gap-8 rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01] hover:shadow-2xl">
      <div className="relative h-24 w-24 flex-shrink-0">
        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-200 dark:stroke-white/10" strokeWidth="3" />
          <circle 
            cx="18" cy="18" r="16" fill="none" 
            className="stroke-primary transition-all duration-1000" 
            strokeWidth="3" 
            strokeDasharray="100 100"
            strokeDashoffset={100 - percent}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black leading-none text-zinc-900 dark:text-white">{percent}%</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">Meta</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Ritmo Semanal</span>
        <div className="flex gap-2">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500">{day}</span>
              <div className={cn(
                "h-3 w-3 rounded-full border-2",
                i < completedDays ? "bg-primary border-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "border-zinc-300 dark:border-white/10"
              )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoal;
