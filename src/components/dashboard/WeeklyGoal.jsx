"use client"
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const ACTIVITY_TYPES = ['Flashcards', 'Praticar', 'Escrita', 'Rápido'];
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // Sun=0 … Sat=6

const WeeklyGoal = ({ userId, goalLimit = 4 }) => {
  const [completedDays, setCompletedDays] = useState([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Build the 7-day window (Mon → Sun of current week)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon …
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    });

    // A day is "done" when AT LEAST one activity type has completed all chunks
    const done = week.map(date => {
      return ACTIVITY_TYPES.some(tipo => {
        const key = `mango:activity:${userId}:${tipo}:${date}`;
        const count = parseInt(localStorage.getItem(key) || '0');
        return count >= goalLimit;
      });
    });

    const completedCount = done.filter(Boolean).length;
    setCompletedDays(done);
    setPercent(Math.round((completedCount / 7) * 100));
  }, [userId, goalLimit]);

  // Current day of week index in Mon-Sun order (0=Mon, 6=Sun)
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;

  return (
    <div className="flex items-center gap-8 rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01] hover:shadow-2xl">
      {/* Circle progress */}
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

      {/* Days row */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Ritmo Semanal</span>
        <div className="flex gap-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
            const isDone = completedDays[i];
            const isToday = i === todayIndex;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={cn(
                  "text-[10px] font-bold",
                  isToday ? "text-primary" : "text-zinc-500"
                )}>{day}</span>
                <div className={cn(
                  "h-3 w-3 rounded-full border-2 transition-all duration-300",
                  isDone
                    ? "bg-primary border-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                    : isToday
                      ? "border-primary dark:border-primary"
                      : "border-zinc-300 dark:border-white/10"
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
