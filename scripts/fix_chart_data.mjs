import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function repair() {
  console.log('Iniciando reparo dos dados do gráfico...');
  
  try {
    // Find all mastered chunks with null review date
    const corrupted = await prisma.userChunkProgress.findMany({
      where: {
        status: 'mastered',
        lastReviewedAt: null
      }
    });

    console.log(`Encontrados ${corrupted.length} registros para reparo.`);

    if (corrupted.length === 0) {
      console.log('Nada para reparar.');
      return;
    }

    const now = new Date();
    
    // Update them to have a lastReviewedAt date
    const results = await prisma.userChunkProgress.updateMany({
      where: {
        status: 'mastered',
        lastReviewedAt: null
      },
      data: {
        lastReviewedAt: now
      }
    });

    console.log(`✅ Sucesso! ${results.count} registros atualizados com a data atual.`);
    console.log('O gráfico da Dashboard deve agora exibir as barras de progresso.');
  } catch (err) {
    console.error('❌ Erro no reparo:', err.message);
  }
}

repair()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
