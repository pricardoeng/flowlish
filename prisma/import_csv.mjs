import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.resolve('meeting_chunks_dataset.csv')
  console.log(`⏳ Starting CSV import from: ${filePath}`)

  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let isHeader = true
  let successCount = 0
  
  const chunksToCreate = []

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false
      continue
    }

    if (!line.trim()) continue;

    // Split handling commas carefully (assuming no commas inside the text itself, looking at demo data)
    const columns = line.split(',')
    
    // chunk_id,chunk_english,chunk_portuguese,chunk_spanish,chunk_scale,tag
    const chunk_english = columns[1]?.trim()
    const chunk_portuguese = columns[2]?.trim()
    const chunk_scale = columns[4]?.trim() || 'A1'
    const tag = columns[5]?.trim() || 'General'

    if (chunk_english && chunk_portuguese) {
      chunksToCreate.push({
        englishText: chunk_english,
        portugueseTranslation: chunk_portuguese,
        cefrLevel: chunk_scale,
        theme: 'Meeting',
        context: tag,
        tags: tag
      })
    }
  }

  console.log(`📦 Parsed ${chunksToCreate.length} items. Inserting into database in batches...`)

  // Create many using batches to avoid overwhelming the pool
  const batchSize = 250;
  for (let i = 0; i < chunksToCreate.length; i += batchSize) {
    const batch = chunksToCreate.slice(i, i + batchSize)
    await prisma.chunk.createMany({
      data: batch,
      skipDuplicates: true // Just in case
    })
    successCount += batch.length
    console.log(`✅ Inserted ${successCount} / ${chunksToCreate.length} chunks...`)
  }

  console.log(`🎉 Successfully imported ${successCount} total chunks into the database!`)
}

main()
  .catch(e => {
    console.error("❌ Error importing CSV:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
