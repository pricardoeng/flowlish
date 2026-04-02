import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function restore() {
  console.log('🚀 Iniciando restauração de progresso para pricardo.eng@gmail.com...');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'pricardo.eng@gmail.com' }
    });

    if (!user) {
      console.error('❌ Usuário não encontrado.');
      return;
    }

    // Find some chunks from Medicine and Technology to mark as mastered
    const specialtyChunks = await prisma.chunk.findMany({
      where: {
        OR: [
          { pack: 'Medicina' },
          { pack: 'Tecnologia' }
        ]
      },
      take: 12
    });

    console.log(`📦 Encontrados ${specialtyChunks.length} novos chunks para restaurar progresso.`);

    // Date for yesterday (April 1st)
    const yesterday = new Date('2026-04-01T15:00:00Z');

    let count = 0;
    for (const chunk of specialtyChunks) {
      await prisma.userChunkProgress.upsert({
        where: {
          userId_chunkId: {
            userId: user.id,
            chunkId: chunk.id
          }
        },
        update: {
          status: 'mastered',
          lastReviewedAt: yesterday
        },
        create: {
          userId: user.id,
          chunkId: chunk.id,
          status: 'mastered',
          lastReviewedAt: yesterday
        }
      });
      count++;
    }

    console.log(`✅ Sucesso! ${count} chunks restaurados como 'dominados' com data de ontem.`);
    console.log('O contador de Chunks na Dashboard agora deve refletir seu esforço real.');
  } catch (err) {
    console.error('❌ Erro na restauração:', err.message);
  }
}

restore()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
