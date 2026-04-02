import React from 'react';
import PracticeSession from '@/components/practice/PracticeSession';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Curator } from '@/lib/curator';

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { purchases: true }
  });

  // Fetch curated chunks based on user interests and status
  const { chunks, isSample } = await Curator.getCuratedChunks(user.id, user.interests);

  return <PracticeSession user={user} chunks={chunks} isSample={isSample} />;
}

