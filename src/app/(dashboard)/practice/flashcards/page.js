import React from 'react';
import FlashcardDeck from '@/components/practice/FlashcardDeck';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  
  const userId = session.user.id;

  // Load just the chunks that have images for the demo
  const deck = await prisma.word.findMany({
    where: {
      imageUrl: { not: null }
    },
    take: 10
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 h-full flex flex-col">
      <div className="mb-8 text-center bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 transition-colors">
          Sessão de Memória 🃏
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium transition-colors">
          Memorize expressões visualmente. Vire a carta, ouça o áudio e avance!
        </p>
      </div>

      <div className="flex-1 overflow-hidden relative pb-12">
        {deck.length > 0 ? (
          <FlashcardDeck initialDeck={deck} userId={userId} />
        ) : (
          <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold transition-colors">Nenhuma carta encontrada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
