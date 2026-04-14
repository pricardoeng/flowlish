"use client"
import React, { useEffect } from 'react';
import { Share2, X, Trophy, Calendar, Users, Linkedin, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

const AchievementModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  // Celebration sound effect or triggers can go here
  useEffect(() => {
    // Basic auto-close option or animation trigger
  }, []);

  const shareUrl = "https://flowlish.com/achievements/" + achievement.id;
  const shareText = `Acabei de conquistar o badge "${achievement.name}" no Flowlish! 🚀 ${achievement.description}`;

  const shareOnLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Confetti Animation Layer (Simplified CSS version) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute top-[-20px] w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#fbbf24', '#f43f5e', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Top Decorative Banner */}
        <div className="h-32 bg-gradient-to-br from-primary via-indigo-600 to-violet-700 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          <div className="absolute bottom-[-40px] flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-8 border-white dark:border-zinc-900 shadow-xl">
            <span className="text-5xl animate-bounce-slow">{achievement.icon}</span>
          </div>
        </div>

        <div className="pt-16 pb-10 px-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Trophy size={14} />
            Nova Conquista Desbloqueada!
          </div>

          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            {achievement.name}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
            {achievement.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Conquistado em</span>
              </div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {new Date(achievement.earnedAt || Date.now()).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
                <Users size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Raridade</span>
              </div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {achievement.rarity || '15%'} dos usuários
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Compartilhe sua evolução</p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-2xl h-14 border-zinc-200 dark:border-zinc-800"
                onClick={shareOnLinkedin}
              >
                <Linkedin size={20} className="text-[#0077b5]" />
                <span className="font-bold">LinkedIn</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-2xl h-14 border-zinc-200 dark:border-zinc-800"
              >
                <Share2 size={20} className="text-zinc-500" />
                <span className="font-bold">Outros</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 text-center border-t border-zinc-100 dark:border-zinc-800">
          <Button 
            className="w-full h-14 rounded-2xl font-black text-lg"
            onClick={onClose}
          >
            Continuar Jornada
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AchievementModal;
