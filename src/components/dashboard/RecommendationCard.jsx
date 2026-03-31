"use client"
import React from 'react';
import { PlayCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModals } from '@/context/ModalContext';
import { Mic, Edit3, Languages } from 'lucide-react';

const RecommendationCard = ({ activity, userId }) => {
  const { openActivity } = useModals();

  const colors = {
    Pronúncia: 'text-primary bg-primary/10',
    Escrita: 'text-blue-500 bg-blue-100 dark:bg-blue-500/10',
    Tradução: 'text-purple-500 bg-purple-100 dark:bg-purple-500/10',
    Rápido: 'text-orange-500 bg-orange-100 dark:bg-orange-500/10'
  };

  return (
    <div 
      onClick={() => openActivity(activity, userId)}
      className="group cursor-pointer relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01] hover:shadow-2xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl", colors[activity.tipo] || 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800')}>
          <Zap size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">+{activity.recompensa_xp} XP</span>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs font-black text-primary uppercase tracking-widest">{activity.tipo === 'Rápido' ? 'Quiz' : activity.tipo}</h4>
        <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
          {{
            'Pronúncia': 'Pratique a pronúncia',
            'Escrita': 'Escreva em inglês',
            'Tradução': 'Vire o card',
            'Rápido': 'Múltipla escolha',
          }[activity.tipo] || activity.subtitulo}
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Toque para revelar ›</p>
      </div>
 
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{activity.duracao} min</span>
        <button 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-all hover:scale-110 shadow-lg shadow-primary/20"
          onClick={(e) => { e.stopPropagation(); openActivity(activity, userId); }}
        >
          <PlayCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
