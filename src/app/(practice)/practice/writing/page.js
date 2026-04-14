import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WritingPractice from '@/components/practice/WritingPractice';

export const metadata = {
  title: 'Prática de Escrita – Mango',
  description: 'Treine sua escrita em inglês. Traduza chunks reais e receba feedback instantâneo.',
};

export default async function WritingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentLevel: true, goal: true, id: true },
  });

  const goalLimits = { Casual: 4, Regular: 8, Intenso: 12 };
  const limit = goalLimits[user?.goal] || 4;

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
    },
  });

  // Shuffle server-side
  const daySeed = new Date().toLocaleDateString('en-CA');
  const shuffled = [...chunks].sort(() => 0.5 - Math.random());

  return <WritingPractice initialChunks={shuffled} />;
}
