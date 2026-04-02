import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_u3gS5cxheoXr@ep-crimson-resonance-amu88ltp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function unlock(email, packName) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`Usuário não encontrado: ${email}`);
      return;
    }

    // 1. Update unlockedPacks array
    await prisma.user.update({
      where: { id: user.id },
      data: {
        unlockedPacks: {
          set: Array.from(new Set([...(user.unlockedPacks || []), packName]))
        }
      }
    });

    // 2. Create Purchase record
    await prisma.purchase.create({
      data: {
        userId: user.id,
        planType: 'Individual Pack',
        packId: packName,
        status: 'active'
      }
    });
    console.log(`✅ Liberado ${packName} para ${email}`);
  } catch (err) {
    console.error(`❌ Erro ao liberar ${packName} para ${email}:`, err.message);
  }
}

async function main() {
  console.log('Iniciando sincronização com NeonDB...');
  await unlock('pricardo.eng@gmail.com', 'Tecnologia');
  await unlock('pricardo.eng@gmail.com', 'Medicina');
  await unlock('pricardo.eng@outlook.com', 'Tecnologia');
  await unlock('pricardo.eng@outlook.com', 'Medicina');
  console.log('Sincronização concluída.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
