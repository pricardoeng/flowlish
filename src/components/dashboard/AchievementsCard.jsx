"use client"
import React from 'react';
import { cn } from '@/lib/utils';
import { Award, Lock, Sparkles } from 'lucide-react';

const BADGES = [
  { 
    id: 'first_chunk', 
    name: 'Primeiro Sangue', 
    desc: 'Domine 1 Chunk', 
    condition: (p) => p.masteredCount >= 1, 
    icon: '🗡️',
    gradient: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-500/40'
  },
  { 
    id: 'streak_3', 
    name: 'Pé Quente', 
    desc: '3 Dias de Foco', 
    condition: (p) => p.streaks >= 3, 
    icon: '🔥',
    gradient: 'from-orange-400 to-orange-600',
    shadow: 'shadow-orange-500/40'
  },
  { 
    id: 'master_50', 
    name: 'Devorador', 
    desc: 'Domine 50 Chunks', 
    condition: (p) => p.masteredCount >= 50, 
    icon: '🧠',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-500/40',
    max: 50,
    current: (p) => p.masteredCount
  },
  { 
    id: 'survivor', 
    name: 'Sobrevivente', 
    desc: 'Acumule 200 XP', 
    condition: (p) => p.xp >= 200, 
    icon: '🎯',
    gradient: 'from-blue-400 to-cyan-500',
    shadow: 'shadow-blue-500/40',
    max: 200,
    current: (p) => p.xp
  },
  { 
    id: 'top_3', 
    name: 'Elite Mango', 
    desc: 'Top 3 no Ranking', 
    condition: (p) => p.leaderboardRank <= 3 && p.leaderboardRank > 0, 
    icon: '👑',
    gradient: 'from-yellow-300 to-amber-500',
    shadow: 'shadow-yellow-500/40'
  }
];

const AchievementsCard = ({ masteredCount = 0, streaks = 0, xp = 0, leaderboardRank = null }) => {
  const props = { masteredCount, streaks, xp, leaderboardRank };
  const unlockedCount = BADGES.filter(b => b.condition(props)).length;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Conquistas</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">
              {unlockedCount} de {BADGES.length} Desbloqueadas
            </p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = badge.condition(props);
          
          return (
            <div 
              key={badge.id}
              className={cn(
                "group relative flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-300",
                isUnlocked 
                  ? "bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:-translate-y-1 hover:shadow-lg" 
                  : "bg-zinc-50/50 dark:bg-zinc-950/50 border-dashed border-zinc-200 dark:border-zinc-800 grayscale opacity-60"
              )}
            >
              {/* Confetti / Sparkles effect for unlocked items on hover */}
              {isUnlocked && (
                <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className={cn("absolute -inset-4 opacity-20 blur-xl bg-gradient-to-br", badge.gradient)} />
                </div>
              )}

              {/* Badge Icon / Lock */}
              <div className="relative z-10 mb-3">
                <div 
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-transform duration-500",
                    isUnlocked 
                      ? cn(`bg-gradient-to-br shadow-lg ${badge.shadow}`, badge.gradient, "group-hover:rotate-12 group-hover:scale-110") 
                      : "bg-zinc-200 dark:bg-zinc-800"
                  )}
                >
                  {isUnlocked ? badge.icon : <Lock size={20} className="text-zinc-400" />}
                </div>
              </div>

              {/* Text Info */}
              <div className="text-center relative z-10">
                <h4 className={cn(
                  "text-sm font-black tracking-tight",
                  isUnlocked ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
                )}>
                  {badge.name}
                </h4>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-1">
                  {badge.desc}
                </p>
              </div>

              {/* Progress Bar (if applicable and locked) */}
              {!isUnlocked && badge.max && badge.current !== undefined && (
                <div className="w-full mt-3 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary/40 rounded-full" 
                    style={{ width: `${Math.min(100, (badge.current(props) / badge.max) * 100)}%` }} 
                  />
                </div>
              )}
              
              {/* Tiny Badge Sparkle (Top-right corner icon on hover) */}
              {isUnlocked && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-yellow-500">
                  <Sparkles size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsCard;
