import prisma from './prisma';

const CONTEXT_PACKS = ['Viajar', 'Viver', 'Estudar', 'Trabalhar'];

export const Curator = {
  /**
   * Fetches a curated set of chunks with SRS prioritization.
   * - 30% da sessão: chunks vencidos para revisão (SRS overdue)
   * - 70% da sessão: chunks novos do pack/nível selecionado
   * @param {string} userId
   * @param {string[]} preferredPacks
   * @returns {Promise<{chunks: any[], isSample: boolean}>}
   */
  async getCuratedChunks(userId, preferredPacks = []) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const userLevel = user.currentLevel || 'A1';

    // Safety check: handle interests as native Array from Postgres (or legacy String)
    const packs = Array.isArray(preferredPacks)
      ? preferredPacks
      : (typeof preferredPacks === 'string' ? preferredPacks.split(',').filter(Boolean) : []);

    const activePack = packs.length > 0 ? packs[0] : 'Free';

    // Map goal to session limit
    const goalLimits = {
      'Casual': 4,
      'Regular': 8,
      'Intenso': 12,
      'Fluency': 10 // Legacy fallback
    };
    const totalLimit = goalLimits[user.goal] || 8;

    // ── 1. SRS OVERDUE CHUNKS (até 30% da sessão) ────────────────────────────
    const srsSlot = Math.floor(totalLimit * 0.3); // ex: 8 → 2 chunks de revisão
    const now = new Date();

    const overdueProgress = await prisma.userChunkProgress.findMany({
      where: {
        userId,
        status: 'mastered',
        nextReviewAt: { lte: now }
      },
      include: {
        chunk: true
      },
      orderBy: { nextReviewAt: 'asc' }, // Mais atrasados primeiro
      take: srsSlot
    });

    const overdueChunks = overdueProgress.map(p => p.chunk);
    const overdueIds = overdueChunks.map(c => c.id);

    // ── 2. NOVOS CHUNKS (restante da sessão) ─────────────────────────────────
    const newSlot = totalLimit - overdueChunks.length;
    const isSpecialized = !['Free', ...CONTEXT_PACKS].includes(activePack);
    const mainCount = isSpecialized ? Math.ceil(newSlot * 0.7) : newSlot;
    const secondaryCount = newSlot - mainCount;

    const primaryChunks = await prisma.chunk.findMany({
      where: {
        pack: activePack,
        cefrLevel: userLevel,
        id: { notIn: overdueIds } // Evitar duplicatas com SRS
      },
      take: mainCount
    });

    let combined = [...overdueChunks, ...primaryChunks];

    // Complemento com pack de contexto (especialidades)
    if (isSpecialized && secondaryCount > 0) {
      const randomContext = CONTEXT_PACKS[Math.floor(Math.random() * CONTEXT_PACKS.length)];
      const secondaryChunks = await prisma.chunk.findMany({
        where: {
          pack: randomContext,
          cefrLevel: userLevel,
          id: { notIn: combined.map(c => c.id) }
        },
        take: secondaryCount
      });
      combined = [...combined, ...secondaryChunks];
    }

    // ── 3. SHUFFLE ────────────────────────────────────────────────────────────
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return {
      chunks: combined,
      isSample: false
    };
  }
};

