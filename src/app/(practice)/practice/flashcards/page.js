import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import FlashcardDeck from '@/components/practice/FlashcardDeck';

export const metadata = {
  title: 'Prática de Chunks – Mango',
  description: 'Memorize novos chunks e expanda seu vocabulário dinamicamente.',
};

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentLevel: true, goal: true },
  });

  const goalLimits = { Casual: 4, Regular: 8, Intenso: 12 };
  const limit = goalLimits[user?.goal] || 4;

  const chunks = await prisma.chunk.findMany({
    where: {
      OR: [
        { cefrLevel: user?.currentLevel || 'A1' },
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

  // Shuffle server-side
  const shuffled = [...chunks].sort(() => 0.5 - Math.random());

  return <FlashcardDeck initialDeck={shuffled} userId={userId} />;
}
