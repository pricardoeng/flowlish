import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TacticsGame from '@/components/practice/TacticsGame';

export const metadata = {
  title: 'Chunk Tactics – Mango',
  description: 'Jogue o baralho tático de chunks em inglês. Domine frases reais com o Mango, uma carta por vez.',
};

export default async function TacticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentLevel: true, goal: true },
  });

  const goalLimits = { Casual: 4, Regular: 8, Intenso: 12 };
  const limit = goalLimits[user?.goal] || 4;

  // Fetch a good deck: mix of free chunks from user's level + nearby levels
  const chunks = await prisma.chunk.findMany({
    where: {
      OR: [
        { cefrLevel: user?.currentLevel || 'A1' },
        { isFree: true },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      englishText: true,
      portugueseTranslation: true,
      cefrLevel: true,
      pack: true,
      theme: true,
    },
  });

  // Shuffle the deck server-side with deterministic daily seed
  const today = new Date().toLocaleDateString('en-CA');
  const seed = `${today}-${session.user.id}-tactics`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  const rng = () => { hash = (hash * 1664525 + 1013904223) % 4294967296; return hash / 4294967296; };
  const shuffled = [...chunks].sort(() => rng() - 0.5);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Page Header */}
      <div className="border-b-[3px] border-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              🃏 Chunk Tactics
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
              {shuffled.length} cartas no deck de hoje
            </p>
          </div>
          <div className="flex gap-1">
            {['A1','A2','B1','B2','C1','C2'].map(l => {
              const counts = shuffled.filter(c => c.cefrLevel === l).length;
              if (!counts) return null;
              const colors = { A1:'bg-[#FF5A36]', A2:'bg-[#FFD100]', B1:'bg-[#0055FF]', B2:'bg-[#00D084]', C1:'bg-[#9B51E0]', C2:'bg-[#FF3366]' };
              return (
                <div key={l} className={`${colors[l]} text-white text-[10px] font-black px-2 py-1 rounded-lg`}>
                  {l}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game */}
      <TacticsGame initialChunks={shuffled} />
    </div>
  );
}
