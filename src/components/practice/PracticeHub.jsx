"use client"
import React from 'react';
import Link from 'next/link';
import { Mic, Layers, PenTool, HelpCircle, Sparkles, TrendingUp, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

const MODES = [
  {
    id: 'FLASHCARDS',
    title: 'Prática de Chunks',
    icon: Layers,
    href: '/practice/flashcards',
    xp: '+50 XP',
    badgeColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    gradient: 'from-orange-500/10'
  },
  {
    id: 'PRATICAR',
    title: 'Prática de Fala',
    icon: Mic,
    href: '/practice/session',
    xp: '+120 XP',
    badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    gradient: 'from-blue-500/10'
  },
  {
    id: 'ESCRITA',
    title: 'Prática de Escrita',
    icon: PenTool,
    href: '/practice/writing',
    xp: '+80 XP',
    badgeColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    gradient: 'from-purple-500/10'
  },
  {
    id: 'QUIZ',
    title: 'Desafio Rápido',
    icon: HelpCircle,
    href: '/practice/quiz',
    xp: '+40 XP',
    badgeColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    gradient: 'from-orange-500/10'
  }
];

const PracticeHub = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} /> Suba de Nível
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Escolha seu modo de <span className="text-primary italic">treinamento</span>
            </h1>
            <p className="text-zinc-400 text-lg font-medium max-w-xl">
              Pratique de forma imersiva e domine novas estruturas do inglês através de métodos ativos de aprendizado.
            </p>
          </div>
          
          <div className="shrink-0 animate-bounce-slow">
            <img src="/images/mascot.png" alt="Mango" className="h-40 w-40 md:h-56 md:w-56 object-contain drop-shadow-[0_20px_50px_rgba(255,107,0,0.3)]" />
          </div>
        </div>
      </div>

      {/* Grid of Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {MODES.map((mode) => (
          <Link 
            key={mode.id} 
            href={mode.href}
            className="group cursor-pointer relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-[#1c1c1f] p-8 shadow-lg border border-zinc-800 transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-zinc-700 min-h-[280px]"
          >
            {/* Background Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none transition-opacity opacity-50 group-hover:opacity-100", mode.gradient)} />

            <div>
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn("inline-flex items-center justify-center p-4 rounded-[1.25rem] border shadow-inner transition-transform group-hover:scale-110", mode.badgeColor)}>
                  <mode.icon size={28} />
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                    {mode.xp}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest drop-shadow-sm">{mode.id}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-400 shadow-inner">
                    0 / 4 CHUNKS
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white leading-snug drop-shadow-md">
                  {mode.title}
                </h3>
                <p className="text-sm font-bold text-zinc-500 transition-colors group-hover:text-zinc-400">
                  Toque para iniciar sessão ›
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between relative z-10 pt-5 border-t border-white/5">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">4 Chunks Totais</span>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <PlayCircle size={24} />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Quick View */}
      <div className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="font-black text-zinc-900 dark:text-zinc-100">Foco Vitalício</h4>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Suas estatísticas de prática</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">84%</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Maestria</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">1.2k</div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Xp Total</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};



export default PracticeHub;
