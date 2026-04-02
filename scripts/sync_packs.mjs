import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function sync() {
  console.log('🔗 Iniciando sincronização de packs...');
  
  try {
    const chunks = await prisma.chunk.findMany();
    console.log(`🔍 Analisando ${chunks.length} chunks.`);

    let updatedCount = 0;
    for (const chunk of chunks) {
      let targetPack = chunk.pack || chunk.theme;
      let isFree = chunk.isFree;

      // Normalize names
      if (targetPack === 'Juridico') targetPack = 'Jurídico';
      if (targetPack === 'Academico') targetPack = 'Acadêmico';

      // Special rule for Casual
      if (targetPack === 'Casual') {
        isFree = true;
      }

      // If changes needed
      if (chunk.pack !== targetPack || chunk.isFree !== isFree) {
        await prisma.chunk.update({
          where: { id: chunk.id },
          data: { 
            pack: targetPack,
            theme: targetPack, // Keep them synced for now to avoid confusion
            isFree: isFree
          }
        });
        updatedCount++;
      }
    }

    console.log(`✅ Sucesso! ${updatedCount} chunks foram sincronizados com seus respectivos packs.`);
  } catch (err) {
    console.error('❌ Erro na sincronização:', err.message);
  }
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
