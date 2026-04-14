"use client"
import React, { useState, useEffect } from 'react';
import { PlayCircle, Zap, CheckCircle2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModals } from '@/context/ModalContext';
import { Mic, Edit3, Layers, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RecommendationCard = ({ activity, userId }) => {
  const { openActivity } = useModals();
  const router = useRouter();

  // Per-activity-type progress from localStorage (fixes shared-counter bug)
  const [localMastered, setLocalMastered] = useState(0);

  const readLocalProgress = () => {
    if (typeof window === 'undefined') return 0;
    const today = new Date().toLocaleDateString('en-CA');
    const key = `mango:activity:${userId}:${activity.tipo}:${today}`;
    return parseInt(localStorage.getItem(key) || '0');
  };

  useEffect(() => {
    setLocalMastered(readLocalProgress());

    // Listen for updates when modal writes to localStorage
    const handleStorage = () => setLocalMastered(readLocalProgress());
    window.addEventListener('storage', handleStorage);

    // Also poll every 2s to catch same-tab updates (storage event doesn't fire in same tab)
    const interval = setInterval(() => setLocalMastered(readLocalProgress()), 2000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [userId, activity.tipo]);

  const isCompleted = localMastered >= activity.totalCount && activity.totalCount > 0;

  const colors = {
    Flashcards: 'text-primary bg-primary/10 border-primary/20',
    Praticar: 'text-blue-500 bg-blue-100 dark:bg-blue-500/10 border-blue-500/20',
    Escrita: 'text-purple-500 bg-purple-100 dark:bg-purple-500/10 border-purple-500/20',
    Rápido: 'text-orange-500 bg-orange-100 dark:bg-orange-500/10 border-orange-500/20'
  };

  const icons = {
    Flashcards: Layers,
    Praticar: Mic,
    Escrita: Edit3,
    Rápido: HelpCircle
  };

  const Icon = icons[activity.tipo] || Zap;

  const handleAction = (e) => {
    e.stopPropagation();
    if (activity.tipo === 'Flashcards') {
      router.push('/practice/flashcards');
    } else if (activity.tipo === 'Praticar') {
      router.push('/practice/session');
    } else {
      openActivity(activity, userId);
    }
  };

  return (
    <div 
      onClick={handleAction}
      className={cn(
        "group cursor-pointer relative overflow-hidden rounded-3xl bg-[#1c1c1f] p-6 shadow-2xl border transition-all hover:scale-[1.01] hover:shadow-orange-500/10",
        isCompleted ? "border-emerald-500/30 shadow-emerald-500/5" : "border-zinc-800 hover:border-zinc-700"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "inline-flex items-center justify-center p-3 rounded-2xl border transition-colors", 
          isCompleted ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-500/20" : colors[activity.tipo] || 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-transparent'
        )}>
          {isCompleted ? <Trophy size={24} /> : <Icon size={24} />}
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">+{Math.round(activity.recompensa_xp)} XP</span>
          {isCompleted && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mt-1 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-full">Meta Batida</span>}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">{activity.tipo === 'Rápido' ? 'Quiz' : activity.tipo}</h4>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full",
            isCompleted ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          )}>
            {localMastered} / {activity.totalCount} CHUNKS
          </span>
        </div>
        <h3 className="text-lg font-black text-white leading-tight">
          {activity.tipo === 'Rápido' ? 'Desafio Rápido' : activity.subtitulo.split(' • ')[1]}
        </h3>
        <p className={cn(
          "text-xs font-bold transition-colors",
          isCompleted ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-500"
        )}>
          {isCompleted ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Sessão concluída ✨
            </span>
          ) : "Toque para iniciar sessão ›"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{activity.totalCount} CHUNKS</span>
        <button 
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 shadow-lg",
            isCompleted ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed" : "bg-primary text-white shadow-primary/20"
          )}
          onClick={handleAction}
        >
          <PlayCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
