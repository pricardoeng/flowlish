import React from 'react';
import PracticeSession from '@/components/practice/PracticeSession';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // Fetch chunks for the session based on user level
  const chunks = await prisma.chunk.findMany({
    where: { cefrLevel: user.currentLevel || 'A1' },
    take: 10
  });

  return <PracticeSession user={user} chunks={chunks} />;
}

