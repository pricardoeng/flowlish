// Forced recompile to resolve stale JS chunk 404s
import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import FilterPanel from '@/components/dictionary/FilterPanel';
import ChunkCard from '@/components/dictionary/ChunkCard';
import { BookOpen } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DictionaryPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { query, level, theme } = await searchParams;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Usuário não encontrado</h1>
          <p className="text-zinc-500">Por favor, faça login novamente ou execute o seed.</p>
        </div>
      );
    }

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
      <div className="space-y-10 animate-fade-in transition-colors">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            <h1 className="text-4xl font-black tracking-tight transition-colors">Dicionário de Chunks</h1>
          </div>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
            Acesse sua biblioteca completa. Filtre por nível, tema ou busque expressões específicas para acelerar seu domínio.
          </p>
        </header>

        <Suspense fallback={<div className="h-20 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />}>
          <FilterPanel />
        </Suspense>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {processedChunks.map(chunk => (
            <ChunkCard key={chunk.id} chunk={chunk} userId={user.id} />
          ))}
        </div>

        {chunks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
            <div className="relative h-40 w-40 animate-bounce transition-transform hover:scale-110">
              <img 
                src="/images/mascot.png" 
                alt="Mango Mascot" 
                className="h-full w-full object-contain grayscale opacity-50"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-foreground">Vish, nada por aqui...</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs font-medium">Tente ajustar seus filtros ou buscar por outro termo.</p>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading dictionary:", error);
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Erro ao carregar o dicionário</h1>
        <p className="text-zinc-500">Ocorreu um erro ao buscar os dados. Tente atualizar a página.</p>
      </div>
    );
  }
}
