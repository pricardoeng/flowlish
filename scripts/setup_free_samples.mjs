import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  console.log('🧪 Configurando amostras gratuitas (Free Samples)...');

  try {
    // 1. Primeiro, resetamos todos os chunks para isFree: false (exceto os do pack Casual)
    console.log('🧹 Resetando status isFree de pacotes premium...');
    await prisma.chunk.updateMany({
      where: { 
        NOT: { pack: 'Casual' } 
      },
      data: { isFree: false }
    });

    // 2. Garantimos que TODO o pack Casual seja free
    console.log('✅ Marcando todo o pack "Casual" como gratuito...');
    await prisma.chunk.updateMany({
      where: { pack: 'Casual' },
      data: { isFree: true }
    });

    // 3. Pegamos a lista de todos os outros pacotes
    const packsWithContent = await prisma.chunk.groupBy({
      by: ['pack'],
      where: { 
        AND: [
          { pack: { not: null } },
          { pack: { not: 'Casual' } }
        ]
       }
    });

    for (const group of packsWithContent) {
      const packName = group.pack;
      console.log(`🎁 Selecionando 3 amostras para o pacote: ${packName}`);

      // Pegamos os 3 primeiros IDs de cada pacote
      const samples = await prisma.chunk.findMany({
        where: { pack: packName },
        take: 3,
        select: { id: true }
      });

      const sampleIds = samples.map(s => s.id);

      if (sampleIds.length > 0) {
        await prisma.chunk.updateMany({
          where: { id: { in: sampleIds } },
          data: { isFree: true }
        });
        console.log(`   ✨ ${sampleIds.length} chunks liberados em ${packName}.`);
      }
    }

    const totalFree = await prisma.chunk.count({ where: { isFree: true } });
    console.log(`\n🎉 Configuração concluída! Total de chunks gratuitos: ${totalFree}`);

  } catch (err) {
    console.error('❌ Erro na configuração:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
