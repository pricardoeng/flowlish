import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const BADGE_DEFINITIONS = [
  // --- MILESTONES (Mastered Chunks) ---
  { 
    id: 'master-1', 
    name: 'Primeira Palavra', 
    description: 'Domine seu primeiro chunk!', 
    category: 'milestone', 
    icon: '💡', 
    targetType: 'mastered_chunks', 
    targetValue: 1, 
    tier: 'BRONZE' 
  },
  { 
    id: 'master-50', 
    name: 'Explorador', 
    description: 'Domine 50 chunks.', 
    category: 'milestone', 
    icon: '🧗', 
    targetType: 'mastered_chunks', 
    targetValue: 50, 
    tier: 'SILVER',
    nextTierId: 'master-250'
  },
  { 
    id: 'master-250', 
    name: 'Fluente Digital', 
    description: 'Domine 250 chunks.', 
    category: 'milestone', 
    icon: '🧬', 
    targetType: 'mastered_chunks', 
    targetValue: 250, 
    tier: 'GOLD',
    nextTierId: 'master-1000'
  },
  { 
    id: 'master-1000', 
    name: 'Lenda Mango', 
    description: 'Domine 1.000 chunks!', 
    category: 'milestone', 
    icon: '🏆', 
    targetType: 'mastered_chunks', 
    targetValue: 1000, 
    tier: 'DIAMOND' 
  },

  // --- STREAKS (Loyalty) ---
  { 
    id: 'streak-3', 
    name: 'Fogo Inicial', 
    description: 'Mantenha 3 dias de ofensiva.', 
    category: 'streak', 
    icon: '🔥', 
    targetType: 'streak_days', 
    targetValue: 3, 
    tier: 'BRONZE' 
  },
  { 
    id: 'streak-15', 
    name: 'Hábito de Aço', 
    description: '15 dias seguidos de estudo.', 
    category: 'streak', 
    icon: '🛡️', 
    targetType: 'streak_days', 
    targetValue: 15, 
    tier: 'SILVER' 
  },
  { 
    id: 'streak-30', 
    name: 'Imparável', 
    description: '30 dias seguidos! Nada te detém.', 
    category: 'streak', 
    icon: '♾️', 
    targetType: 'streak_days', 
    targetValue: 30, 
    tier: 'GOLD' 
  },

  // --- SKILLS (General XP/Progress) ---
  { 
    id: 'xp-500', 
    name: 'Veterano', 
    description: 'Acumule 500 XP total.', 
    category: 'skill', 
    icon: '🎖️', 
    targetType: 'xp', 
    targetValue: 500, 
    tier: 'SILVER' 
  },
  { 
    id: 'specialist-tech', 
    name: 'Dev Speakeasy', 
    description: 'Conclua o Pack de Tecnologia.', 
    category: 'skill', 
    icon: '💻', 
    targetType: 'pack_complete', 
    targetValue: 1, 
    tier: 'GOLD' 
  }
];

async function main() {
  console.log('🌱 Seeding achievements...');

  for (const b of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: b,
      create: b
    });
  }

  console.log('✅ Achievements seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
