import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Purging SpeechQueue table...')
  const deleted = await prisma.speechQueue.deleteMany({})
  console.log(`Successfully deleted ${deleted.count} records.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
