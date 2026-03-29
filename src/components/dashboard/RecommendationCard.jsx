"use client"
import React from 'react';
import { PlayCircle, Award, Zap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useModals } from '@/context/ModalContext';

const RecommendationCard = ({ activity, userId }) => {
  const { openActivity } = useModals();

  const icons = {
    Pronúncia: Mic,
    Escrita: Edit3,
    Tradução: Languages,
    Rápido: Zap
  };

  const colors = {
    Pronúncia: 'text-primary bg-primary-light',
    Escrita: 'text-blue-500 bg-blue-50',
    Tradução: 'text-purple-500 bg-purple-50',
    Rápido: 'text-orange-500 bg-orange-50'
  };

  return (
    <div 
      onClick={() => openActivity(activity, userId)}
      className="group cursor-pointer relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl", colors[activity.tipo] || 'text-zinc-500 bg-zinc-50')}>
          <Zap size={24} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">+{activity.recompensa_xp} XP</span>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs font-black text-primary uppercase tracking-widest">{activity.tipo === 'Rápido' ? 'Quiz' : activity.tipo}</h4>
        <h3 className="text-lg font-black text-zinc-900 leading-tight">
          {{
            'Pronúncia': 'Pratique a pronúncia',
            'Escrita': 'Escreva em inglês',
            'Tradução': 'Vire o card',
            'Rápido': 'Múltipla escolha',
          }[activity.tipo] || activity.subtitulo}
        </h3>
        <p className="text-xs text-zinc-400 font-medium">Toque para revelar ›</p>
      </div>
 
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{activity.duracao} min</span>
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

import { Mic, Edit3, Languages } from 'lucide-react';
export default RecommendationCard;
