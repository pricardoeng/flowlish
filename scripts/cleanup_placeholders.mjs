import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function cleanup() {
  console.log('🧹 Iniciando limpeza de placeholders...');
  
  try {
    const targets = await prisma.chunk.findMany({
      where: {
        OR: [
          { englishText: { startsWith: 'Complex' } },
          { englishText: { startsWith: 'Common' } },
          { englishText: { startsWith: 'Essential' } }
        ]
      },
      select: { id: true }
    });

    const targetIds = targets.map(t => t.id);

    if (targetIds.length > 0) {
      console.log(`🗑️ Removendo progresso de ${targetIds.length} chunks...`);
      await prisma.userChunkProgress.deleteMany({
        where: { chunkId: { in: targetIds } }
      });

      console.log(`🗑️ Removendo chunks...`);
      const deleted = await prisma.chunk.deleteMany({
        where: { id: { in: targetIds } }
      });

      console.log(`✅ Sucesso! ${deleted.count} chunks de placeholder foram removidos.`);
    } else {
      console.log('✨ Nenhum placeholder encontrado.');
    }
  } catch (err) {
    console.error('❌ Erro na limpeza:', err.message);
  }
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
