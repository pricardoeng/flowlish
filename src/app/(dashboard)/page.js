import React from 'react';
import prisma from '@/lib/prisma';
import Link from "next/link";
import StreakCard from '@/components/dashboard/StreakCard';
import MasteryCard from '@/components/dashboard/MasteryCard';
import WeeklyGoal from '@/components/dashboard/WeeklyGoal';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import AchievementsCard from '@/components/dashboard/AchievementsCard';
import ShareButtons from '@/components/ui/ShareButtons';
import LeaderboardCard from '@/components/dashboard/LeaderboardCard';
import WeeklyEvolution from '@/components/dashboard/WeeklyEvolution';
import Button from '@/components/ui/Button';
import { LayoutGrid, TrendingUp, Sparkles, ArrowRight, Video, LogOut } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { checkUserAchievements } from "@/lib/achievements";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Check and grant any missing achievements automatically on dashboard load
  await checkUserAchievements(session.user.id);

  // Fetch real user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: true,
      learningSessions: true,
      userBadges: { include: { badge: true } }
    }
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600">
          <LogOut size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Sessão Inválida</h1>
          <p className="text-zinc-500 max-w-sm">
            Seu usuário não foi encontrado no novo banco de dados. Por favor, faça logout para sincronizar sua conta.
          </p>
        </div>
        <LogoutButton variant="primary" className="h-14 sm:w-64 rounded-2xl font-black text-lg shadow-xl" />
      </div>
    );
  }

  // Real XP: sum of all LearningSession scores (starts at 0, grows with each activity)
  const xp = user.learningSessions.reduce((sum, s) => sum + (s.score || 0), 0);
  
  // Real streaks: sum of all unique days the user did an activity
  const activeDays = new Set();
  user.learningSessions.forEach(s => {
    if (s.date) {
      // Map correctly to distinct ISO date strings like '2023-10-15'
      activeDays.add(new Date(s.date).toISOString().split('T')[0]);
    }
  });
  
  const streaks = activeDays.size;

  const todayDate = new Date();
  const currentDayOfWeek = (todayDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const startOfWeek = new Date(todayDate);
  startOfWeek.setDate(todayDate.getDate() - currentDayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

  // General leaderboard with all requested stats
  const allUsers = await prisma.user.findMany({
    include: { 
      learningSessions: { select: { score: true, date: true } },
      progress: { where: { status: 'mastered' }, select: { id: true } }
    }
  });

  const leaderboard = allUsers
    .map(u => {
      let xpTotal = 0;
      let xpWeek = 0;
      let xpMonth = 0;
      
      u.learningSessions.forEach(ls => {
        xpTotal += ls.score || 0;
        const d = new Date(ls.date);
        if (d >= startOfWeek) xpWeek += ls.score || 0;
        if (d >= startOfMonth) xpMonth += ls.score || 0;
      });

      return {
        id: u.id,
        name: u.name || 'Anônimo',
        xpTotal,
        xpWeek,
        xpMonth,
        chunks: u.progress.length,
        isCurrentUser: u.id === user.id
      };
    })
    .sort((a, b) => b.xpTotal - a.xpTotal);
  
  const currentUserRank = leaderboard.findIndex(u => u.isCurrentUser) + 1;
  const totalMasteredCount = user.progress.filter(p => p.status === 'mastered').length;

  // Calculate Weekly Evolution data (Mon-Sun)
  const weeklyChunks = [0, 0, 0, 0, 0, 0, 0];
  const weeklyXp = [0, 0, 0, 0, 0, 0, 0];
  let totalWeekChunks = 0;

  // Map dates of current week to indexes
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  user.progress.forEach(p => {
    if (p.status === 'mastered' && p.lastReviewedAt) {
      const dateStr = new Date(p.lastReviewedAt).toISOString().split('T')[0];
      const dayIdx = weekDates.indexOf(dateStr);
      if (dayIdx !== -1) {
        weeklyChunks[dayIdx]++;
        totalWeekChunks++;
      }
    }
  });

  user.learningSessions.forEach(s => {
    if (s.date) {
      const dateStr = new Date(s.date).toISOString().split('T')[0];
      const dayIdx = weekDates.indexOf(dateStr);
      if (dayIdx !== -1) {
        weeklyXp[dayIdx] += (s.score || 0);
      }
    }
  });
  
  // Calculate mastery by level — fetch real data
  const [allChunksByLevel, masteredProgress] = await Promise.all([
    prisma.chunk.groupBy({ by: ['cefrLevel'], _count: { id: true } }),
    prisma.userChunkProgress.findMany({
      where: { userId: user.id, status: 'mastered' },
      include: { chunk: { select: { cefrLevel: true } } }
    })
  ]);

  // Build masteryData: { A1: { total, mastered, percent }, ... }
  const masteryData = {};
  allChunksByLevel.forEach(({ cefrLevel, _count }) => {
    const mastered = masteredProgress.filter(p => p.chunk.cefrLevel === cefrLevel).length;
    masteryData[cefrLevel] = {
      total: _count.id,
      mastered,
      percent: _count.id > 0 ? Math.round((mastered / _count.id) * 100) : 0
    };
  });


  // Map user goal to activity count
  const goalLimits = {
    'Casual': 4,
    'Regular': 8,
    'Intenso': 12
  };
  const limit = goalLimits[user.goal] || 4;

  // Fetch real chunks for the daily activities – add ORDER BY for stability
  let chunksForActivities = await prisma.chunk.findMany({
    take: limit,
    where: { cefrLevel: user.currentLevel || 'A1' },
    orderBy: { id: 'asc' }
  });

  // Date seed logic – ensuring it's stable and deterministic for the day
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const seedString = `${today}-${user.id}`;
  
  // Deterministic LCG-based random number generator
  const seededRandom = (seed) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    return () => {
      hash = (hash * 1664525 + 1013904223) % 4294967296;
      return hash / 4294967296;
    };
  };

  const rng = seededRandom(seedString);

  // Robust Fisher-Yates shuffle with seeded RNG
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const shuffled = shuffle(chunksForActivities);
  const activityTypes = ['Flashcards', 'Praticar', 'Escrita', 'Rápido'];

  // Calculate mastered count within this fixed daily pool
  const shuffledIds = shuffled.map(c => c?.id).filter(Boolean);
  const masteredInPool = user.progress.filter(p => shuffledIds.includes(p.chunkId) && p.status === 'mastered');
  const masteredCount = masteredInPool.length;

  // Map to precisely 4 session cards
  const recommendations = activityTypes.map((tipo, i) => {
    const baseXP = [50, 120, 80, 40][i];

    return {
      id: `session-${tipo}`,
      tipo,
      subtitulo: `${shuffled.length} chunks • Prática de ${tipo === 'Rápido' ? 'Quiz' : tipo === 'Flashcards' ? 'Chunks' : tipo === 'Praticar' ? 'Fala' : tipo}`,
      recompensa_xp: Math.round(baseXP * (shuffled.length / 4)),
      status: 'Disponível',
      masteredCount,
      totalCount: shuffled.length,
      isCompleted: masteredCount >= shuffled.length,
      chunks: (shuffled || []).filter(Boolean).map(chunk => ({
        englishText: chunk.englishText,
        portugueseTranslation: chunk.portugueseTranslation,
        id: chunk.id
      }))
    };
  });

  return (
    <div className="space-y-12 animate-fade-in transition-all">
      {/* 1. Header & Status Hub (Compact & Integrated) */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-6 md:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 shrink-0 animate-bounce-slow">
              <img src="/images/mascot.png" alt="Mango" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Bom dia, <span className="text-primary italic">{user.name.split(' ')[0]}!</span>
              </h1>
              <p className="text-zinc-400 font-medium">Você já dominou <span className="text-white font-bold">{totalMasteredCount} chunks</span> no total. Vamos mais longe?</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-center px-4 py-2 border-r border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Rank</span>
                <span className="text-xl font-black text-primary">#{currentUserRank}</span>
             </div>
             <div className="flex flex-col items-center px-4 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total XP</span>
                <span className="text-xl font-black text-white">{xp}</span>
             </div>
          </div>
        </div>
      </header>

      {/* 2. Quick Status Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <StreakCard streaks={streaks} />
        <WeeklyGoal userId={user.id} goalLimit={limit} />
      </div>

      {/* 3. Primary Action Zone: Recommended (Higher Priority) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">Seus treinos sugeridos</h2>
          </div>
          <Link href="/practice" className="text-sm font-black text-primary hover:underline">Ver Hub</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map(activity => (
            <RecommendationCard key={activity.id} activity={activity} userId={user.id} />
          ))}
        </div>
      </section>

      {/* 4. Reward & Progress Zone */}
      <div className="space-y-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
        {/* Achievements (Now defaults to Summary mode) */}
        <AchievementsCard 
          earnedBadges={user.userBadges}
          masteredCount={totalMasteredCount} 
          streaks={streaks} 
          xp={xp} 
          leaderboardRank={currentUserRank}
          userId={user.id}
        />

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MasteryCard masteryData={masteryData} />
          <WeeklyEvolution chunks={weeklyChunks} xp={weeklyXp} total={totalWeekChunks} />
        </div>

        {/* Global Community */}
        <div className="space-y-6">
          <LeaderboardCard leaderboard={leaderboard} />
          <ShareButtons />
        </div>
      </div>
    </div>
  );
}
