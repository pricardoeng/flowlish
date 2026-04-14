import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando limpeza dos Chunks...');

  const chunks = await prisma.chunk.findMany();
  console.log(`📊 Total de chunks encontrados: ${chunks.length}`);

  let updatedCount = 0;
  let deletedCount = 0;

  // 1. Limpar textos (Remover (XX))
  for (const chunk of chunks) {
    const cleanEng = chunk.englishText.replace(/\s*\(\d+\)$/, '').trim();
    const cleanPt = chunk.portugueseTranslation.replace(/\s*\(\d+\)$/, '').trim();

    if (cleanEng !== chunk.englishText || cleanPt !== chunk.portugueseTranslation) {
      await prisma.chunk.update({
        where: { id: chunk.id },
        data: {
          englishText: cleanEng,
          portugueseTranslation: cleanPt,
        },
      });
      updatedCount++;
    }
  }

  console.log(`✅ Chunks higienizados: ${updatedCount}`);

  // 2. Remover duplicatas
  // Buscamos novamente após a limpeza
  const allChunks = await prisma.chunk.findMany();
  const seen = new Set();
  const duplicateIds = [];

  for (const chunk of allChunks) {
    const key = `${chunk.englishText.toLowerCase()}|${chunk.portugueseTranslation.toLowerCase()}`;
    if (seen.has(key)) {
      duplicateIds.push(chunk.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicateIds.length > 0) {
    console.log(`🗑️ Removendo ${duplicateIds.length} duplicatas...`);
    await prisma.chunk.deleteMany({
      where: {
        id: { in: duplicateIds }
      }
    });
    deletedCount = duplicateIds.length;
  }

  console.log('✨ Limpeza concluída com sucesso!');
  console.log(`📈 Resumo: ${updatedCount} atualizados, ${deletedCount} duplicatas removidas.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
