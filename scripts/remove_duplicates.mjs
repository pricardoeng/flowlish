import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function deduplicate() {
  console.log('🧹 Iniciando remoção de duplicatas...');
  
  try {
    // 1. Group by identical fields
    const groups = await prisma.chunk.groupBy({
      by: ['englishText', 'portugueseTranslation', 'pack'],
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } }
    });

    console.log(`🔍 Encontrados ${groups.length} conjuntos de frases duplicadas.`);

    let totalDeleted = 0;
    for (const group of groups) {
      // Get all instances
      const instances = await prisma.chunk.findMany({
        where: {
          englishText: group.englishText,
          portugueseTranslation: group.portugueseTranslation,
          pack: group.pack
        },
        orderBy: { createdAt: 'asc' }
      });

      const primary = instances[0];
      const duplicates = instances.slice(1);
      const duplicateIds = duplicates.map(d => d.id);

      console.log(`📦 Processando: "${primary.englishText}" (${instances.length} cópias)`);

      // 2. Repoint user progress to primary before deleting
      // Find all progress entries for duplicates
      const progressEntries = await prisma.userChunkProgress.findMany({
        where: { chunkId: { in: duplicateIds } }
      });

      for (const entry of progressEntries) {
        // Check if user already has progress on primary
        const existingPrimaryProgress = await prisma.userChunkProgress.findUnique({
          where: {
            userId_chunkId: {
              userId: entry.userId,
              chunkId: primary.id
            }
          }
        });

        if (existingPrimaryProgress) {
          // Keep the one with better status or later review
          if (entry.status === 'mastered' || (entry.lastReviewedAt > existingPrimaryProgress.lastReviewedAt)) {
            await prisma.userChunkProgress.update({
              where: { id: existingPrimaryProgress.id },
              data: {
                status: entry.status,
                lastReviewedAt: entry.lastReviewedAt,
                masteryScore: Math.max(entry.masteryScore, existingPrimaryProgress.masteryScore)
              }
            });
          }
          // Delete duplicate progress
          await prisma.userChunkProgress.delete({ where: { id: entry.id } });
        } else {
          // Just move it
          await prisma.userChunkProgress.update({
            where: { id: entry.id },
            data: { chunkId: primary.id }
          });
        }
      }

      // 3. Delete redundant chunks
      const deleted = await prisma.chunk.deleteMany({
        where: { id: { in: duplicateIds } }
      });
      totalDeleted += deleted.count;
    }

    console.log(`✅ Sucesso! ${totalDeleted} chunks duplicados foram removidos e o progresso foi consolidado.`);
  } catch (err) {
    console.error('❌ Erro na deduplicação:', err.message);
  }
}

deduplicate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
