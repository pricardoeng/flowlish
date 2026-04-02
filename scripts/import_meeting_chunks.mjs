import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function importChunks() {
  const filePath = path.resolve('meeting_chunks_dataset.xls');
  console.log(`📂 Lendo arquivo: ${filePath}`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const dataLines = lines.slice(1);
    console.log(`📊 Total de linhas: ${dataLines.length}`);

    // Fetch existing chunks to avoid duplicates
    const existing = await prisma.chunk.findMany({
      where: { pack: 'Corporativo' },
      select: { englishText: true }
    });
    const existingTexts = new Set(existing.map(e => e.englishText));

    const toInsert = [];
    
    for (const line of dataLines) {
      const parts = line.split(',');
      if (parts.length < 6) continue;

      const [id, english, portuguese, spanish, scale, tag] = parts;
      const cleanEnglish = english.replace(/\s*\(\d+\)$/, '').trim();
      
      if (existingTexts.has(cleanEnglish)) continue;

      toInsert.push({
        englishText: cleanEnglish,
        portugueseTranslation: portuguese.trim(),
        cefrLevel: scale.trim(),
        pack: 'Corporativo',
        isFree: false,
      });

      existingTexts.add(cleanEnglish);
    }

    if (toInsert.length > 0) {
      console.log(`🚀 Fazendo upload de ${toInsert.length} novos chunks...`);
      // Use createMany for bulk performance
      const result = await prisma.chunk.createMany({
        data: toInsert,
        skipDuplicates: true
      });
      console.log(`✅ Sucesso! ${result.count} chunks importados.`);
    } else {
      console.log('✨ Todos os chunks já foram importados anteriormente.');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

importChunks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
