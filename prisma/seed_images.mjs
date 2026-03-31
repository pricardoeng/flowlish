import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding initial images to chunks...")

  // Touch Base
  let touchBase = await prisma.chunk.findFirst({
    where: { englishText: { contains: "touch base", mode: "insensitive" } }
  })
  if (touchBase) {
    await prisma.chunk.update({
      where: { id: touchBase.id },
      data: { imageUrl: "/cards/touch_base.png" }
    })
    console.log(`Updated: ${touchBase.englishText} with touch_base.png`)
  }

  // Tied Up
  let tiedUp = await prisma.chunk.findFirst({
    where: { englishText: { contains: "tied up", mode: "insensitive" } }
  })
  if (tiedUp) {
    await prisma.chunk.update({
      where: { id: tiedUp.id },
      data: { imageUrl: "/cards/tied_up.png" }
    })
    console.log(`Updated: ${tiedUp.englishText} with tied_up.png`)
  }

  // On My Way Up
  let onMyWayUp = await prisma.chunk.findFirst({
    where: { englishText: { contains: "my way up", mode: "insensitive" } }
  })
  if (onMyWayUp) {
    await prisma.chunk.update({
      where: { id: onMyWayUp.id },
      data: { imageUrl: "/cards/on_my_way_up.png" }
    })
    console.log(`Updated: ${onMyWayUp.englishText} with on_my_way_up.png`)
  } else {
    // If chunk doesn't exist, create it for demo
    await prisma.chunk.create({
      data: {
        englishText: "I'm on my way up",
        portugueseTranslation: "Estou no caminho do topo",
        cefrLevel: "B1",
        theme: "Career",
        variant: "US",
        imageUrl: "/cards/on_my_way_up.png"
      }
    })
    console.log("Created 'On my way up' demo chunk.")
  }

  // Create explicit demo chunks just to absolutely ensure they show up in flashcards
  const ensureDemos = [
    {
       englishText: "Let's touch base next week",
       portugueseTranslation: "Vamos entrar em contato na próxima semana",
       cefrLevel: "B2",
       theme: "Communication",
       imageUrl: "/cards/touch_base.png"
    },
    {
       englishText: "I'm tied up with meetings all day",
       portugueseTranslation: "Estou enrolado com reuniões o dia todo",
       cefrLevel: "C1",
       theme: "Productivity",
       imageUrl: "/cards/tied_up.png"
    }
  ]
  
  for (let d of ensureDemos) {
    const existing = await prisma.chunk.findFirst({ where: { englishText: d.englishText }});
    if (!existing) {
       await prisma.chunk.create({ data: d });
       console.log(`Created explicit demo chunk: ${d.englishText}`);
    } else {
      await prisma.chunk.update({
        where: { id: existing.id },
        data: { imageUrl: d.imageUrl }
      })
    }
  }

  console.log("Images seeded.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
