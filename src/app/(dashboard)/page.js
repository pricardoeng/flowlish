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
import { LayoutGrid, TrendingUp, Sparkles, ArrowRight, Video } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch real user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: true,
      learningSessions: true
    }
  });

  if (!user) return <div>Usuário não encontrado. Por favor, execute o seed.</div>;

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
      subtitulo: `${shuffled.length} chunks • Prática de ${tipo === 'Rápido' ? 'Quiz' : tipo}`,
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
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between tracking-tight">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0 rounded-3xl bg-primary/10 p-2 transition-transform hover:rotate-6">
            <img 
              src="/images/mascot.png" 
              alt="Mango Mascot" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-foreground tracking-tight transition-colors">Bom dia, {user.name.split(' ')[0]}!</h1>
            {user.progress.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 font-medium my-2">
                Você ainda não completou nenhum chunk hoje. <span className="text-primary font-bold">Comece agora</span> e construa seu hábito diário! 🚀
              </p>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 font-medium my-2">Você já dominou <span className="text-primary font-bold">{user.progress.length} chunks</span> hoje. Continue assim!</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-900 px-4 py-2 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400 text-white">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Total XP</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{xp}</p>
          </div>
        </div>
      </header>

      {/* Main Progress Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StreakCard streaks={streaks} />
        <WeeklyGoal userId={user.id} goalLimit={limit} />
      </div>

      {/* Achievements Section / Badges */}
      <section className="opacity-95 hover:opacity-100 transition-opacity">
        <AchievementsCard 
          masteredCount={totalMasteredCount} 
          streaks={streaks} 
          xp={xp} 
          leaderboardRank={currentUserRank} 
        />
      </section>

      {/* Live Speaking Matchmaking CTA - Temporarily Hidden */}
      {/* 
      <Link href="/practice/speaking" className="block group">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-primary to-orange-700 p-8 md:p-12 shadow-2xl transition-transform hover:scale-[1.01] hover:shadow-primary/30">
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 font-bold text-white text-xs tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Novo Recurso!
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Pratique Inglês Ao Vivo</h2>
              <p className="text-orange-100 max-w-lg text-lg">
                Esqueça o medo de falar. Entre no Speakeasy Room, conecte-se com outro estudante e pratique cara a cara agora mesmo.
              </p>
            </div>
            
            <div className="shrink-0 flex items-center justify-center p-6 bg-white rounded-3xl group-hover:bg-zinc-900 group-hover:text-primary transition-colors text-zinc-900">
              <Video className="w-16 h-16" />
            </div>
          </div>
        </section>
      </Link>
      */}

      {/* Recommended Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Recomendado para você</h2>
          </div>
          <Button variant="ghost" size="sm" className="group">
            Ver tudo <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map(activity => (
            <RecommendationCard key={activity.id} activity={activity} userId={user.id} />
          ))}
        </div>
      </section>

      {/* Secondary Stats Grid: Mastery and Weekly Evolution side-by-side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MasteryCard masteryData={masteryData} />
        
        {/* Weekly Chart */}
        <WeeklyEvolution chunks={weeklyChunks} xp={weeklyXp} total={totalWeekChunks} />
      </div>

      {/* Share Section (Full width below) */}
      <div className="mt-6">
        <ShareButtons />
      </div>

      {/* Leaderboard Section (At the Bottom) */}

      {/* Leaderboard Section (Moved to Bottom) */}
      <div className="mt-8">
        <LeaderboardCard leaderboard={leaderboard} />
      </div>
    </div>
  );
}
