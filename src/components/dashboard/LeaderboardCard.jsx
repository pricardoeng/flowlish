"use client"
import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Star, Zap } from 'lucide-react';

const MEDALS = [
  {
    rank: 1,
    icon: '🥇',
    label: '1º',
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    glow: 'shadow-yellow-400/40',
    border: 'border-yellow-400/60',
    bg: 'bg-yellow-400/10 dark:bg-yellow-400/5',
    textColor: 'text-yellow-500',
    height: 'h-20',
  },
  {
    rank: 2,
    icon: '🥈',
    label: '2º',
    gradient: 'from-zinc-300 via-slate-300 to-zinc-400',
    glow: 'shadow-zinc-300/40',
    border: 'border-zinc-300/60',
    bg: 'bg-zinc-200/30 dark:bg-zinc-500/10',
    textColor: 'text-zinc-400',
    height: 'h-12',
  },
  {
    rank: 3,
    icon: '🥉',
    label: '3º',
    gradient: 'from-orange-700 via-amber-700 to-orange-800',
    glow: 'shadow-orange-700/40',
    border: 'border-orange-700/50',
    bg: 'bg-orange-900/10 dark:bg-orange-800/5',
    textColor: 'text-orange-700',
    height: 'h-8',
  },
];

// Reorder for podium: 2nd | 1st | 3rd
const PODIUM_ORDER = [1, 0, 2]; // indices into MEDALS / leaderboard

const Avatar = ({ user, sizeClasses, textClasses }) => {
  const [error, setError] = React.useState(false);
  if (!user) return null;

  return (
    <>
      {!error && (
        <img 
           src={`/uploads/${user.id}.jpg`} 
           alt="" 
           className="absolute inset-0 h-full w-full object-cover z-10 bg-zinc-800"
           onError={() => setError(true)}
        />
      )}
      <div className={cn("absolute inset-0 z-0 flex items-center justify-center w-full h-full", textClasses)}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    </>
  );
};

function formatXP(xp) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return String(xp);
}

const LeaderboardCard = ({ leaderboard = [] }) => {
  if (leaderboard.length === 0) return null;

  // Pad to 3 slots
  const entries = [0, 1, 2].map(i => leaderboard[i] || null);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/30 text-white">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">The best of Mango</h2>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top 3 Estudantes</p>
        </div>
      </div>

      {/* Podium Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 dark:bg-zinc-950 border border-zinc-800/60 shadow-2xl p-8">
        {/* Background radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-yellow-400/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        {/* Podium stage */}
        <div className="relative flex items-end justify-center gap-4 pt-4 pb-2">
          {PODIUM_ORDER.map((playerIdx, colIdx) => {
            const entry = entries[playerIdx];
            const medal = MEDALS[playerIdx];
            const isFirst = playerIdx === 0;

            return (
              <div key={colIdx} className="flex flex-col items-center gap-4 flex-1 max-w-[160px]">
                {/* Avatar + name */}
                <div className={cn(
                  "flex flex-col items-center gap-2 transition-transform",
                  isFirst && "scale-110"
                )}>
                  {/* Medal emoji */}
                  <div className="text-3xl leading-none">{medal.icon}</div>

                  {/* Avatar circle */}
                  <div className={cn(
                    "relative flex items-center justify-center rounded-full border-2 font-black text-white shadow-lg overflow-hidden",
                    isFirst ? "h-16 w-16" : "h-12 w-12",
                    `bg-gradient-to-br ${medal.gradient}`,
                    medal.glow,
                    "shadow-xl"
                  )}>
                    {entry ? (
                      <Avatar 
                        user={entry} 
                        textClasses={isFirst ? "text-2xl" : "text-base"} 
                      />
                    ) : '?'}
                    {entry?.isCurrentUser && (
                      <span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[8px] font-black">
                        EU
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="text-center max-w-[110px]">
                    <p className={cn(
                      "font-black leading-tight truncate",
                      isFirst ? "text-sm text-white" : "text-xs text-zinc-300"
                    )}>
                      {entry ? entry.name.split(' ')[0] : '—'}
                    </p>
                    {/* XP */}
                    <div className={cn(
                      "flex items-center justify-center gap-1 font-black",
                      isFirst ? "text-base" : "text-xs",
                      medal.textColor
                    )}>
                      <Zap size={isFirst ? 14 : 10} className="fill-current" />
                      {entry ? formatXP(entry.xpTotal) : '0'} XP
                    </div>
                  </div>
                </div>

                {/* Podium block */}
                <div className={cn(
                  "w-full rounded-t-2xl border flex items-center justify-center",
                  medal.height,
                  medal.bg,
                  medal.border
                )}>
                  <span className={cn("text-2xl font-black", medal.textColor)}>{medal.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shine line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-[2.5rem] bg-zinc-950 dark:bg-zinc-950 p-6 md:p-8 shadow-2xl border border-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Star size={16} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Ranking Geral</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500">
                <th className="py-4 px-4 font-bold">Posição</th>
                <th className="py-4 px-4 font-bold">XP Semana</th>
                <th className="py-4 px-4 font-bold">XP Mês</th>
                <th className="py-4 px-4 font-bold">XP Total</th>
                <th className="py-4 px-4 font-bold w-32 text-center">Chunks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {leaderboard.map((user, idx) => (
                <tr key={user.id} className={cn("group transition-colors hover:bg-white/5", user.isCurrentUser ? "bg-primary/5" : "")}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4 border-l-2 border-transparent group-hover:border-primary pl-2 transition-colors">
                      <span className={cn(
                        "w-6 text-center font-black",
                        idx === 0 ? "text-yellow-500" : idx === 1 ? "text-zinc-400" : idx === 2 ? "text-orange-600" : "text-zinc-600"
                      )}>{idx + 1}º</span>
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 flex-shrink-0">
                        <Avatar 
                           user={user} 
                           textClasses="text-sm text-zinc-400 font-black" 
                        />
                      </div>
                      <span className="font-bold text-sm text-zinc-200">
                        {user.name}
                        {user.isCurrentUser && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Você</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-zinc-300">{formatXP(user.xpWeek)} <span className="text-zinc-600">XP</span></span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-zinc-300">{formatXP(user.xpMonth)} <span className="text-zinc-600">XP</span></span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-amber-500 drop-shadow-sm">{formatXP(user.xpTotal)} <Zap size={12} className="inline-block relative -top-[1px] fill-current" /></span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">{formatXP(user.chunks)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardCard;
