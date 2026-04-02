import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'pricardo.eng@gmail.com';
  const packsToUnlock = ['Tecnologia', 'Medicina'];

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`Usuário não encontrado: ${email}`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        unlockedPacks: {
          set: Array.from(new Set([...(user.unlockedPacks || []), ...packsToUnlock]))
        }
      }
    });

    console.log(`Sucesso! Chunks desbloqueados para ${email}:`, updatedUser.unlockedPacks);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
