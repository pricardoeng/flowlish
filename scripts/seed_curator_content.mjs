import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const PACKS = {
  THEMES: ['Medicina', 'Jurídico', 'Financeiro', 'Tecnologia', 'Projetos', 'Engenharia', 'Corporativo'],
  CONTEXTS: ['Viajar', 'Viver', 'Estudar', 'Trabalhar'],
  SPECIALIZED: ['Avançado', 'Acadêmico']
}

async function main() {
  console.log('Sweep: Cleaning existing user progress and chunks...')
  await prisma.userChunkProgress.deleteMany({})
  await prisma.chunk.deleteMany({})

  console.log('🌱 Seeding 1500 chunks...')

  const chunks = []

  const CASUAL_PHRASES = [
    { en: "How are you today?", pt: "Como você está hoje?" },
    { en: "What's your name?", pt: "Qual é o seu nome?" },
    { en: "Nice to meet you.", pt: "Prazer em conhecê-lo." },
    { en: "Where are you from?", pt: "De onde você é?" },
    { en: "I don't understand.", pt: "Eu não entendo." },
    { en: "Can you help me?", pt: "Você pode me ajudar?" },
    { en: "Excuse me, where is the bathroom?", pt: "Com licença, onde é o banheiro?" },
    { en: "How much does this cost?", pt: "Quanto custa isto?" },
    { en: "I'm looking for a restaurant.", pt: "Estou procurando um restaurante." },
    { en: "Do you speak English?", pt: "Você fala inglês?" },
    { en: "Have a great day!", pt: "Tenha um ótimo dia!" },
    { en: "See you later.", pt: "Vejo você mais tarde." },
    { en: "I would like a coffee, please.", pt: "Eu gostaria de um café, por favor." },
    { en: "What time is it?", pt: "Que horas são?" },
    { en: "It's a beautiful day.", pt: "Está um dia bonito." },
    { en: "Thank you very much.", pt: "Muito obrigado." },
    { en: "You're welcome.", pt: "De nada." },
    { en: "I'm sorry for being late.", pt: "Sinto muito pelo atraso." },
    { en: "No problem at all.", pt: "Sem problema nenhum." },
    { en: "I'm hungry.", pt: "Estou com fome." }
  ];

  // 1. CASUAL CHUNKS (300)
  for (let i = 0; i < 300; i++) {
    const base = CASUAL_PHRASES[i % CASUAL_PHRASES.length];
    chunks.push({
      englishText: i > CASUAL_PHRASES.length ? `${base.en} (${i})` : base.en,
      portugueseTranslation: base.pt,
      cefrLevel: i <= 150 ? 'A1' : 'A2',
      theme: 'Casual',
      pack: 'Casual',
      isFree: true,
      tags: 'greeting,basic'
    });
  }

  // 2. THEME PACKS (7 themes * 100 each = 700)
  PACKS.THEMES.forEach(theme => {
    for (let i = 1; i <= 100; i++) {
      chunks.push({
        englishText: `Common ${theme} expression for business interaction.`,
        portugueseTranslation: `Expressão comum de ${theme} para interação profissional.`,
        cefrLevel: i <= 50 ? 'B1' : 'B2',
        theme: theme,
        pack: theme,
        isFree: false,
        tags: 'professional,theme'
      })
    }
  })

  // 3. CONTEXT PACKS (4 contexts * 100 each = 400)
  PACKS.CONTEXTS.forEach(context => {
    for (let i = 1; i <= 100; i++) {
      chunks.push({
        englishText: `Essential phrase for ${context.toLowerCase()} in a new city.`,
        portugueseTranslation: `Frase essencial para ${context.toLowerCase()} em uma nova cidade.`,
        cefrLevel: i <= 50 ? 'A2' : 'B1',
        theme: context,
        pack: 'Casual',
        isFree: false,
        tags: 'context,life'
      })
    }
  })

  // 4. SPECIALIZED (2 packs * 50 each = 100)
  PACKS.SPECIALIZED.forEach(spec => {
    for (let i = 1; i <= 50; i++) {
      chunks.push({
        englishText: `Complex ${spec.toLowerCase()} structure for advanced proficiency.`,
        portugueseTranslation: `Estrutura complexa de ${spec.toLowerCase()} para proficiência avançada.`,
        cefrLevel: spec === 'Avançado' ? 'C1' : 'C2',
        theme: spec,
        pack: spec,
        isFree: false,
        tags: spec.toLowerCase()
      })
    }
  })

  // Batch insert to be fast
  console.log(`Payload prepared: ${chunks.length} chunks. Executing...`)
  
  // Prisma createMany is better for this
  await prisma.chunk.createMany({
    data: chunks,
    skipDuplicates: true
  })

  console.log('✅ 1500 Chunks seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
