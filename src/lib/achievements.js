import prisma from './prisma';

/**
 * Defines the core badge logic. 
 * Each badge has a target type and a target value.
 */
export const BADGE_DEFINITIONS = [
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

/**
 * Checks and awards new achievements for a user.
 * Returns an array of newly earned badges.
 */
export async function checkUserAchievements(userId) {
  try {
    // 1. Get user stats
    const stats = await getUserStats(userId);
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    });
    const existingIds = new Set(existingBadges.map(b => b.badgeId));

    const newlyEarned = [];

    // 2. Evaluate each badge definition
    for (const badgeDef of BADGE_DEFINITIONS) {
      if (existingIds.has(badgeDef.id)) continue;

      let isEarned = false;
      switch (badgeDef.targetType) {
        case 'mastered_chunks':
          isEarned = stats.masteredCount >= badgeDef.targetValue;
          break;
        case 'xp':
          isEarned = stats.xp >= badgeDef.targetValue;
          break;
        case 'streak_days':
          isEarned = stats.streak >= badgeDef.targetValue;
          break;
        case 'pack_complete':
          // Special logic for pack completion if needed
          break;
      }

      if (isEarned) {
        // Persist the new badge
        const newBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badgeDef.id,
            earnedAt: new Date()
          },
          include: { badge: true }
        });
        
        // We use the full definition since the DB might not be seeded yet
        newlyEarned.push({ ...badgeDef, earnedAt: newBadge.earnedAt });
      }
    }

    return newlyEarned;
  } catch (error) {
    console.error("Achievement Engine Error:", error);
    return [];
  }
}

/**
 * Calculates current progress towards a specific badge.
 */
export async function getBadgeProgress(userId, badgeId) {
  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!badgeDef) return 0;

  const stats = await getUserStats(userId);
  let currentVal = 0;

  switch (badgeDef.targetType) {
    case 'mastered_chunks': currentVal = stats.masteredCount; break;
    case 'xp': currentVal = stats.xp; break;
    case 'streak_days': currentVal = stats.streak; break;
  }

  return {
    current: currentVal,
    target: badgeDef.targetValue,
    percent: Math.min(100, Math.round((currentVal / badgeDef.targetValue) * 100))
  };
}

/**
 * Calculates rarity (percentage of users who have this badge)
 */
export async function calculateRarity(badgeId) {
  const [totalUsers, earnedCount] = await Promise.all([
    prisma.user.count(),
    prisma.userBadge.count({ where: { badgeId } })
  ]);
  
  if (totalUsers === 0) return 0;
  return ((earnedCount / totalUsers) * 100).toFixed(1);
}

// Helpers
async function getUserStats(userId) {
  const [masteredCount, sessions] = await Promise.all([
    prisma.userChunkProgress.count({ 
      where: { userId, status: 'mastered' } 
    }),
    prisma.learningSession.findMany({
      where: { userId },
      select: { score: true, date: true }
    })
  ]);

  const totalXp = sessions.reduce((acc, s) => acc + (s.score || 0), 0);
  
  // Real streaks: sum of all unique days the user did an activity
  const activeDays = new Set();
  sessions.forEach(s => {
    if (s.date) {
      activeDays.add(new Date(s.date).toISOString().split('T')[0]);
    }
  });

  return {
    masteredCount,
    xp: totalXp,
    streak: activeDays.size
  };
}

