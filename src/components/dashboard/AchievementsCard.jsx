"use client"
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Award, Lock, Sparkles, CheckCircle2, TrendingUp, Users, Calendar } from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/lib/achievements';

const AchievementsCard = ({ 
  earnedBadges = [], 
  masteredCount = 0, 
  streaks = 0, 
  xp = 0, 
  leaderboardRank = null,
  userId = null
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = { masteredCount, streaks, xp, leaderboardRank };
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'milestone', name: 'Marcos' },
    { id: 'skill', name: 'Habilidades' },
    { id: 'streak', name: 'Frequência' }
  ];

  // Helper to check if a badge was earned
  const getEarnedInfo = (badgeId) => {
    return earnedBadges.find(ub => ub.badgeId === badgeId);
  };

  // Calculate progress for a specific badge definition
  const calculateProgress = (badgeDef) => {
    let current = 0;
    switch (badgeDef.targetType) {
      case 'mastered_chunks': current = masteredCount; break;
      case 'xp': current = xp; break;
      case 'streak_days': current = streaks; break;
      case 'leaderboard_rank': current = leaderboardRank || 0; break;
      default: current = 0;
    }
    const percent = Math.min(100, Math.round((current / badgeDef.targetValue) * 100));
    return { current, target: badgeDef.targetValue, percent };
  };

  const filteredBadges = activeCategory === 'all' 
    ? BADGE_DEFINITIONS 
    : BADGE_DEFINITIONS.filter(b => b.category === activeCategory);

  return (
    <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm p-8 transition-all hover:shadow-xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-500/10 text-amber-500">
            <Award size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Suas Conquistas</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
              {earnedBadges.length} de {BADGE_DEFINITIONS.length} Desbloqueadas
            </p>
          </div>
        </div>

        {/* Category Tabs & Expand Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            {isExpanded ? 'Ver Menos' : 'Ver Tudo'}
            <TrendingUp size={14} className={cn("transition-transform", isExpanded ? "rotate-180" : "")} />
          </button>
        </div>
      </div>

      {/* Badges Display - Sliced if not expanded */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(isExpanded ? filteredBadges : filteredBadges.slice(0, 4)).map((badge) => {
          const earnedInfo = getEarnedInfo(badge.id);
          const isUnlocked = !!earnedInfo;
          const progress = calculateProgress(badge);
          // Cores clean estilo "Exercise Cards"
          const badgeStyles = {
            'master-1': { iconColor: "text-orange-500 bg-orange-500/10 border-orange-500/20", glow: "from-orange-500/10" },
            'master-50': { iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20", glow: "from-blue-500/10" },
            'master-250': { iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", glow: "from-emerald-500/10" },
            'master-1000': { iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20", glow: "from-purple-500/10" },
            'streak-3': { iconColor: "text-red-500 bg-red-500/10 border-red-500/20", glow: "from-red-500/10" },
            'streak-15': { iconColor: "text-zinc-300 bg-zinc-400/10 border-zinc-400/20", glow: "from-zinc-400/10" },
            'streak-30': { iconColor: "text-violet-500 bg-violet-500/10 border-violet-500/20", glow: "from-violet-500/10" },
            'xp-500': { iconColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", glow: "from-yellow-500/10" },
            'specialist-tech': { iconColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", glow: "from-cyan-500/10" }
          };

          const fallbackStyle = { iconColor: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", glow: "from-zinc-500/10" };
          const activeStyle = isUnlocked ? (badgeStyles[badge.id] || fallbackStyle) : {};

          return (
            <div 
              key={badge.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                isUnlocked 
                  ? "bg-[#1c1c1f] hover:-translate-y-2 hover:shadow-2xl border-zinc-800 hover:border-zinc-700 min-h-[260px]"
                  : "bg-zinc-50/50 dark:bg-[#151518] border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-700 min-h-[260px]"
              )}
            >
              {/* Subtle Background Glow (Only for unlocked) */}
              {isUnlocked && (
                <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none transition-opacity opacity-50 group-hover:opacity-100", activeStyle.glow)} />
              )}

              {/* Rarity Info (Only shown when locked) */}
              {!isUnlocked && (
                <div className="absolute top-4 right-6 flex items-center gap-1.5 pt-2 z-10">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800/80 text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                    <Users size={10} />
                    <span>{badge.rarity || '12%'}</span>
                  </div>
                </div>
              )}

              {/* Icon Section */}
              <div className="mb-6 relative z-10">
                <div className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-[1.25rem] text-4xl transition-all duration-700",
                  isUnlocked 
                    ? cn("border shadow-inner group-hover:scale-110", activeStyle.iconColor)
                    : "bg-zinc-200/50 dark:bg-zinc-900 grayscale opacity-40 border border-transparent"
                )}>
                  {badge.icon}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 z-10">
                <h4 className={cn(
                  "text-xl font-black tracking-tight transition-colors drop-shadow-sm",
                  isUnlocked ? "text-white" : "text-zinc-400"
                )}>
                  {badge.name}
                </h4>
                <p className={cn(
                  "text-sm font-medium mt-1.5 leading-relaxed drop-shadow-sm",
                  isUnlocked ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-500"
                )}>
                  {badge.description}
                </p>
              </div>

              {/* Mechanical Stats (Footer - Only shown when locked) */}
              {!isUnlocked && (
                <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800 z-10">
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-zinc-500">Progresso</span>
                      <span className="text-zinc-400">{progress.current} / {progress.target}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-zinc-500 dark:bg-zinc-700 rounded-full transition-all duration-1000"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
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
