import prisma from './prisma';

const CONTEXT_PACKS = ['Viajar', 'Viver', 'Estudar', 'Trabalhar'];

export const Curator = {
  /**
   * Fetches a curated set of chunks based on user tier and interests.
   * @param {string} userId 
   * @param {string[]} preferredPacks 
   * @returns {Promise<{chunks: any[], isSample: boolean}>}
   */
  async getCuratedChunks(userId, preferredPacks = []) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { purchases: true }
    });

    if (!user) throw new Error("User not found");

    const isPremium = user.purchases.some(p => p.status === 'active' && !p.packId);
    const unlockedPacks = user.unlockedPacks || [];
    const userLevel = user.currentLevel || 'A1';

    /**
     * Helper to check if a pack is owned or accessible
     */
    const hasAccessToPack = (packName) => {
      if (isPremium) return true;
      if (packName === 'Free') return true;
      return unlockedPacks.includes(packName);
    };

    // 1. CHunk Retrieval & Access Logic
    const activePack = preferredPacks.length > 0 ? preferredPacks[0] : 'Free';
    const hasFullAccess = hasAccessToPack(activePack);

    if (!hasFullAccess) {
      // Return 3 sample chunks (isLocked)
      const sampleChunks = await prisma.chunk.findMany({
        where: { 
          pack: activePack,
          cefrLevel: userLevel
        },
        take: 3
      });
      
      return {
        chunks: sampleChunks.map(c => ({ ...c, isLocked: true })),
        isSample: true
      };
    }

    // 2. FULL ACCESS LOGIC (Owned Pack or Premium)
    // 70/30 Mix for specialized packs, or 100% for Free/Context if requested
    const isSpecialized = !['Free', ...CONTEXT_PACKS].includes(activePack);
    
    let mainChunksCount = isSpecialized ? 7 : 10;
    
    const primaryChunks = await prisma.chunk.findMany({
      where: { 
        pack: activePack,
        cefrLevel: userLevel
      },
      take: mainChunksCount
    });

    let combined = [...primaryChunks];

    if (isSpecialized) {
      const randomContext = CONTEXT_PACKS[Math.floor(Math.random() * CONTEXT_PACKS.length)];
      const secondaryChunks = await prisma.chunk.findMany({
        where: { 
          pack: randomContext,
          cefrLevel: userLevel
        },
        take: 3
      });
      combined = [...combined, ...secondaryChunks];
    }

    // Shuffle combined result
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
