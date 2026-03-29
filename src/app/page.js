import React from 'react';
import prisma from '@/lib/prisma';
import StreakCard from '@/components/dashboard/StreakCard';
import MasteryCard from '@/components/dashboard/MasteryCard';
import WeeklyGoal from '@/components/dashboard/WeeklyGoal';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import Button from '@/components/ui/Button';
import { LayoutGrid, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default async function Dashboard() {
  // Fetch real user data
  const user = await prisma.user.findUnique({
    where: { email: 'paulo@flowlish.app' },
    include: {
      progress: true,
      learningSessions: true
    }
  });

  if (!user) return <div>Usuário não encontrado. Por favor, execute o seed.</div>;

  // Calculate stats
  const xp = 1240; // Simplified for now
  const streaks = 15; // Simplified for now
  
  // Calculate mastery by level
  const mastery = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const totalChunksByLevel = { A1: 50, A2: 100, B1: 200, B2: 300, C1: 400, C2: 500 }; // Mock denominators
  
  user.progress.forEach(p => {
    if (p.status === 'mastered') {
       // Logic to map chunk back to level would go here
       // For now keeping simpler or fetching joined
    }
  });

  // Fetch real activities from "chunks" as recommendations
  // Fetch chunks for activities – always get at least 10, ignoring level if needed
  let chunksForActivities = await prisma.chunk.findMany({
    take: 12,
    where: { cefrLevel: user.currentLevel || 'A1' }
  });

  // Fallback: if not enough chunks at this level, grab from all levels
  if (chunksForActivities.length < 4) {
    chunksForActivities = await prisma.chunk.findMany({ take: 12 });
  }

  // Shuffle and pick exactly 4 (one per activity type)
  const shuffled = [...chunksForActivities].sort(() => 0.5 - Math.random());
  const selectedChunks = shuffled.slice(0, 4);

  const activityTypes = ['Pronúncia', 'Escrita', 'Tradução', 'Rápido'];
  // Always produce 4 activities, cycling chunks if less than 4 available
  const recommendations = activityTypes.map((tipo, i) => {
    const chunk = selectedChunks[i] || selectedChunks[0];
    return {
      id: `${chunk.id}-${tipo}`,
      tipo,
      subtitulo: chunk.englishText,
      duracao: [8, 15, 12, 5][i],
      recompensa_xp: [50, 120, 80, 40][i],
      status: 'Disponível',
      chunk: {
        englishText: chunk.englishText,
        portugueseTranslation: chunk.portugueseTranslation,
        id: chunk.id
      },
      distractors: shuffled
        .filter(c => c.id !== chunk.id)
        .slice(0, 2)
        .map(c => c.portugueseTranslation)
    };
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between tracking-tight">
        <div>
          <h1 className="text-4xl font-black text-zinc-900">Bom dia, {user.name.split(' ')[0]}!</h1>
          {user.progress.length === 0 ? (
            <p className="text-zinc-500 font-medium">
              Você ainda não completou nenhum chunk hoje. <span className="text-primary font-bold">Comece agora</span> e construa seu hábito diário! 🚀
            </p>
          ) : (
            <p className="text-zinc-500 font-medium">Você já dominou <span className="text-primary font-bold">{user.progress.length} chunks</span> hoje. Continue assim!</p>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm border border-zinc-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-white">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Total XP</p>
            <p className="text-sm font-bold text-zinc-900">{xp}</p>
          </div>
        </div>
      </header>

      {/* Main Progress Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StreakCard streaks={streaks} />
        <WeeklyGoal percent={75} />
      </div>

      {/* Recommended Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Recomendado para você</h2>
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

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MasteryCard mastery={mastery} />
        </div>
        
        {/* Weekly Chart Placeholder */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-white p-8 border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-4 tracking-tight">Evolução Semanal</h3>
            <div className="mt-10 flex h-32 items-end justify-between gap-2">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="group relative flex flex-1 flex-col items-center">
                  <div 
                    className="w-full rounded-t-lg bg-primary/20 transition-all hover:bg-primary"
                    style={{ height: `${h}%` }}
                  />
                  <span className="mt-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {['S','T','Q','Q','S','S','D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <ShareButtons />
        </div>
      </div>
    </div>
  );
}

import ShareButtons from '@/components/ui/ShareButtons';
