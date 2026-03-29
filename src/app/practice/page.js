import React from 'react';
import prisma from '@/lib/prisma';
import PracticeSession from '@/components/practice/PracticeSession';

export default async function PracticePage() {
  const user = await prisma.user.findUnique({
    where: { email: 'paulo@flowlish.app' }
  });

  // Fetch chunks for the session based on user level
  const chunks = await prisma.chunk.findMany({
    where: { cefrLevel: user.currentLevel || 'A1' },
    take: 10
  });

  return <PracticeSession user={user} chunks={chunks} />;
}

