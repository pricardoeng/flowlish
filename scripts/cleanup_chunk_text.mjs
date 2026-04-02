import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function cleanup() {
  console.log('🧹 Iniciando limpeza dos textos dos chunks...');
  
  try {
    const chunks = await prisma.chunk.findMany({
      where: {
        englishText: {
          contains: '('
        }
      }
    });

    console.log(`🔍 Encontrados ${chunks.length} chunks com parênteses.`);

    let updatedCount = 0;
    for (const chunk of chunks) {
      // Regex to find " (numbers)" at the end of string
      const cleanedText = chunk.englishText.replace(/\s*\(\d+\)$/, '');
      
      if (cleanedText !== chunk.englishText) {
        await prisma.chunk.update({
          where: { id: chunk.id },
          data: { englishText: cleanedText }
        });
        updatedCount++;
      }
    }

    console.log(`✅ Sucesso! ${updatedCount} chunks foram limpos.`);
  } catch (err) {
    console.error('❌ Erro na limpeza:', err.message);
  }
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
