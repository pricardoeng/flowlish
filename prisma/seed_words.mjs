import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding isolated Words table...")

  const demoWords = [
    { englishWord: 'Cat', portugueseTranslation: 'Gato', cefrLevel: 'A1', imageUrl: '/words/cat.png', theme: 'Animals' },
    { englishWord: 'Monkey', portugueseTranslation: 'Macaco', cefrLevel: 'A2', imageUrl: '/words/monkey.png', theme: 'Animals' },
    { englishWord: 'Beer', portugueseTranslation: 'Cerveja', cefrLevel: 'B1', imageUrl: '/words/beer.png', theme: 'Food & Drinks' },
    { englishWord: 'Briefcase', portugueseTranslation: 'Maleta de Negócios', cefrLevel: 'B2', imageUrl: '/words/briefcase.png', theme: 'Business' },
    { englishWord: 'Headquarters', portugueseTranslation: 'Sede (Matriz)', cefrLevel: 'C1', imageUrl: '/words/headquarters.png', theme: 'Business' },
  ]

  for (let w of demoWords) {
    const existing = await prisma.word.findFirst({ where: { englishWord: w.englishWord } });
    if (!existing) {
       await prisma.word.create({ data: w });
       console.log(`Created new word: ${w.englishWord}`);
    } else {
      await prisma.word.update({
        where: { id: existing.id },
        data: { imageUrl: w.imageUrl, portugueseTranslation: w.portugueseTranslation }
      });
      console.log(`Updated existing word: ${w.englishWord}`);
    }
  }

  console.log("Words successfully seeded.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
