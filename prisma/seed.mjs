import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Seeding chunks...')

  const chunksData = [
    // A1 - Casual
    { englishText: "How's it going?", portugueseTranslation: "Como vai?", cefrLevel: "A1", theme: "Social", context: "Greeting" },
    { englishText: "Nice to meet you", portugueseTranslation: "Prazer em conhecer você", cefrLevel: "A1", theme: "Social", context: "Introduction" },
    { englishText: "See you later", portugueseTranslation: "Até logo", cefrLevel: "A1", theme: "Social", context: "Farewell" },
    
    // A2 - Common Phrases
    { englishText: "Could you help me?", portugueseTranslation: "Pode me ajudar?", cefrLevel: "A2", theme: "Travel", context: "Request" },
    { englishText: "I don't think so", portugueseTranslation: "Eu acho que não", cefrLevel: "A2", theme: "Casual", context: "Opinion" },
    
    // B1 - Business / Intermediate
    { englishText: "Let's touch base", portugueseTranslation: "Vamos manter contato / conversar depois", cefrLevel: "B1", theme: "Business", context: "Work" },
    { englishText: "To make a long story short", portugueseTranslation: "Resumindo...", cefrLevel: "B1", theme: "Casual", context: "Storytelling" },
    { englishText: "In the long run", portugueseTranslation: "A longo prazo", cefrLevel: "B1", theme: "Business", context: "Decision" },

    // B2 - Advanced Base
    { englishText: "As far as I'm concerned", portugueseTranslation: "No que me diz respeito", cefrLevel: "B2", theme: "Academic", context: "Argumentation" },
    { englishText: "To read between the lines", portugueseTranslation: "Ler nas entrelinhas", cefrLevel: "B2", theme: "Social", context: "Insight" },

    // Idioms
    { englishText: "Piece of cake", portugueseTranslation: "Muito fácil", cefrLevel: "A1", theme: "Idiom", context: "Casual" },
    { englishText: "Bite the bullet", portugueseTranslation: "Encarar a situação difícil", cefrLevel: "B2", theme: "Idiom", context: "Stoicism" },
    { englishText: "Under the weather", portugueseTranslation: "Sentindo-se mal", cefrLevel: "B1", theme: "Idiom", context: "Health" }
  ]

  for (const chunk of chunksData) {
    await prisma.chunk.upsert({
      where: { id: `seed-${chunk.englishText.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${chunk.englishText.replace(/\s+/g, '-').toLowerCase()}`,
        ...chunk
      }
    })
  }

  // Create a default user for testing
  await prisma.user.upsert({
    where: { email: 'paulo@flowlish.app' },
    update: {},
    create: {
      name: 'Paulo Ricardo',
      email: 'paulo@flowlish.app',
      goal: 'Regular',
      currentLevel: 'B2'
    }
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
