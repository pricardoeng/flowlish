"use client"
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Labels de Segunda (índice 0) a Domingo (índice 6)
const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // Seg=0 … Dom=6
const ACTIVITY_TYPES = ['Flashcards', 'Praticar', 'Escrita', 'Rápido'];

const WeeklyGoal = ({ userId, goalLimit = 4 }) => {
  const [completedDays, setCompletedDays] = useState([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Constrói janela de 7 dias (Seg → Dom da semana atual)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Dom, 1=Seg …
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    });

    // Um dia é "concluído" quando ao menos 1 atividade foi completada naquele dia
    // O key é escrito pela função trackActivityProgress no RecommendationActivity
    // e pelo FlashcardDeck via claimActivityReward (usamos um key de sessão)
    const done = week.map(date => {
      return ACTIVITY_TYPES.some(tipo => {
        const key = `mango:activity:${userId}:${tipo}:${date}`;
        const count = parseInt(localStorage.getItem(key) || '0');
        // Qualquer conclusão de atividade conta o dia como feito
        return count >= 1;
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
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
            const isDone = completedDays[i];
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
