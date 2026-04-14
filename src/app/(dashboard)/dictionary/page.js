// Forced recompile to resolve stale JS chunk 404s
import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import FilterPanel from '@/components/dictionary/FilterPanel';
import ChunkCard from '@/components/dictionary/ChunkCard';
import Pagination from '@/components/dictionary/Pagination';
import { BookOpen, Library, LogOut } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DictionaryPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { query, level, pack, page } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const pageSize = 12;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        purchases: { where: { status: 'active' } }
      }
    });

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600">
            <LogOut size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Usuário não encontrado</h1>
            <p className="text-zinc-500 max-w-sm">
              Não conseguimos encontrar seus dados no banco de dados atual. Por favor, faça logout e entre novamente.
            </p>
          </div>
          <LogoutButton variant="primary" className="h-14 sm:w-64 rounded-2xl font-black text-lg shadow-xl" />
        </div>
      );
    }

    // ✅ ACESSO LIBERADO: todos os usuários têm acesso a todo o dicionário
    const isPro = true;
    const unlockedPacks = user.unlockedPacks || [];

    // Sem filtro de acesso — conteúdo 100% liberado
    const accessFilter = {};

    // 1. Total chunks in user's library
    const totalInPlan = await prisma.chunk.count({ where: accessFilter });

    // 2. Chunks matching current filters
    const finalWhereClause = {
      AND: [
        query ? { englishText: { contains: query, mode: 'insensitive' } } : {},
        level ? { cefrLevel: level } : {},
        pack ? { pack: pack } : {},
        accessFilter
      ]
    };

    const [totalFiltered, packsWithContent] = await Promise.all([
      prisma.chunk.count({ where: finalWhereClause }),
      prisma.chunk.groupBy({
        by: ['pack'],
        where: { 
          AND: [
            { pack: { not: null } },
            accessFilter
          ]
        }
      })
    ]);

    const availablePacks = packsWithContent.map(p => p.pack);
    const totalPages = Math.ceil(totalFiltered / pageSize);

    // 3. Fetch current page chunks
    const chunks = await prisma.chunk.findMany({
      where: finalWhereClause,
      include: {
        userProgress: {
          where: { userId: user.id }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (currentPage - 1) * pageSize
    });

    const processedChunks = chunks.map(c => ({
      ...c,
      isFavorite: c.userProgress[0]?.isFavorite || false,
      mastered: c.userProgress[0]?.status === 'mastered'
    }));

    const ALL_PACKS = [
      'Tecnologia', 'Medicina', 'Jurídico', 'Financeiro', 'Projetos', 'Engenharia', 'Corporativo',
      'Viajar', 'Viver', 'Estudar', 'Trabalhar',
      'Avançado', 'Acadêmico'
    ];
    const missingPacks = ALL_PACKS.filter(p => !unlockedPacks.includes(p));

    return (
      <div className="space-y-10 animate-fade-in transition-colors">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 transition-transform hover:rotate-12">
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white">Dicionário</h1>
            </div>
            <p className="max-w-xl text-zinc-500 font-medium text-sm">
              Sua biblioteca completa. Explore {totalInPlan} chunks disponíveis.
            </p>
          </div>

          <div className="flex items-center gap-6 px-6 py-4 bg-zinc-800/50 rounded-3xl border border-zinc-700/50 backdrop-blur-sm self-start">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Acesso</span>
                <span className="text-xs font-black text-orange-500 uppercase tracking-tight">
                  Total Liberado
                </span>
             </div>
             <div className="h-8 w-px bg-zinc-700" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Chunks</span>
                <span className="text-xs font-bold text-white">{totalInPlan}</span>
             </div>
             <div className="h-8 w-px bg-zinc-700" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filtrado</span>
                <span className="text-xs font-bold text-orange-500">{totalFiltered}</span>
             </div>
          </div>
        </header>

        <Suspense fallback={<div className="h-20 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />}>
          <FilterPanel availablePacks={availablePacks} />
        </Suspense>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {processedChunks.map(chunk => (
            <ChunkCard key={chunk.id} chunk={chunk} userId={user.id} />
          ))}
        </div>

        {totalPages > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}

        {chunks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
            <div className="relative h-40 w-40 animate-bounce transition-transform hover:scale-110">
              <img 
                src="/images/mascot.png" 
                alt="Mango Mascot" 
                className="h-full w-full object-contain grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-foreground">Vish, nada por aqui...</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-xs font-medium">Tente ajustar seus filtros ou buscar por outro termo.</p>
              </div>
              <Link 
                href="/dictionary"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-zinc-900/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </div>
                Limpar Todos os Filtros
              </Link>
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
