import React from 'react';
import prisma from '@/lib/prisma';
import FilterPanel from '@/components/dictionary/FilterPanel';
import ChunkCard from '@/components/dictionary/ChunkCard';
import { BookOpen, Sparkles } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DictionaryPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { query, level, theme } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // Fetch real chunks from Prisma with filters and user progress
  const chunks = await prisma.chunk.findMany({
    where: {
      AND: [
        query ? { englishText: { contains: query } } : {},
        level ? { cefrLevel: level } : {},
        theme ? { theme: theme } : {},
      ]
    },
    include: {
      userProgress: {
        where: { userId: user.id }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const processedChunks = chunks.map(c => ({
    ...c,
    isFavorite: c.userProgress[0]?.isFavorite || false,
    mastered: c.userProgress[0]?.status === 'mastered'
  }));

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary" size={32} />
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Dicionário de Chunks</h1>
        </div>
        <p className="max-w-xl text-zinc-600 font-medium">
          Acesse sua biblioteca completa. Filtre por nível, tema ou busque expressões específicas para acelerar seu domínio.
        </p>
      </header>

      <FilterPanel />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {processedChunks.map(chunk => (
          <ChunkCard key={chunk.id} chunk={chunk} userId={user.id} />
        ))}
      </div>

      {chunks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-zinc-100 bg-zinc-50/50">
          <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
             <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Nenhum chunk encontrado</h3>
          <p className="text-zinc-500 max-w-xs">Tente ajustar seus filtros ou buscar por outro termo.</p>
        </div>
      )}
    </div>
  );
}
