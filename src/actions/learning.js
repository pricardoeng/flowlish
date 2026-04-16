"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { checkUserAchievements } from "@/lib/achievements"


export async function completePracticeSession(clientUserId, chunkResults) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;
    // chunkResults: Array of { chunkId, status: 'mastered' | 'learning' }
    // chunkResults: Array of { chunkId, status: 'mastered' | 'learning' }
    
    const results = await Promise.all(chunkResults.map(async (res) => {
      return prisma.userChunkProgress.upsert({
        where: {
          userId_chunkId: {
            userId,
            chunkId: res.chunkId
          }
        },
        update: {
          status: res.status,
          lastReviewedAt: new Date()
        },
        create: {
          userId,
          chunkId: res.chunkId,
          status: res.status,
          lastReviewedAt: new Date()
        }
      })
    }))

    revalidatePath('/')
    revalidatePath('/dictionary')
    
    // Check for new achievements
    const newBadges = await checkUserAchievements(userId);
    
    return { success: true, count: results.length, newAchievements: newBadges }
  } catch (error) {
    console.error("Failed to complete session:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserProfile(clientUserId, data) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        goal: data.goal,
        currentLevel: data.level,
        interests: Array.isArray(data.interests) ? data.interests : []
      }
    })
    
    revalidatePath('/profile')
    revalidatePath('/')
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function toggleFavorite(clientUserId, chunkId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    const progress = await prisma.userChunkProgress.findUnique({
      where: { userId_chunkId: { userId, chunkId } }
    });

    if (!progress) {
      await prisma.userChunkProgress.create({
        data: {
          userId,
          chunkId,
          isFavorite: true,
          status: 'seen'
        }
      });
    } else {
      await prisma.userChunkProgress.update({
        where: { id: progress.id },
        data: { isFavorite: !progress.isFavorite }
      });
    }

    revalidatePath('/dictionary');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false };
  }
}

/**
 * Calcula nextReviewAt baseado no masteryScore (Spaced Repetition)
 * score 0 → +1 dia | 1-2 → +3 dias | 3-4 → +7 dias | 5+ → +14 dias
 */
function getNextReviewDate(masteryScore) {
  const days = masteryScore === 0 ? 1 : masteryScore <= 2 ? 3 : masteryScore <= 4 ? 7 : 14;
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function markChunkAsMastered(clientUserId, chunkId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // Busca score atual para calcular o próximo intervalo SRS
    const existing = await prisma.userChunkProgress.findUnique({
      where: { userId_chunkId: { userId, chunkId } },
      select: { masteryScore: true }
    });

    const currentScore = existing?.masteryScore ?? 0;
    const nextReviewAt = getNextReviewDate(currentScore);

    await prisma.userChunkProgress.upsert({
      where: { userId_chunkId: { userId, chunkId } },
      update: {
        status: 'mastered',
        masteryScore: { increment: 1 },
        lastReviewedAt: new Date(),
        nextReviewAt
      },
      create: {
        userId,
        chunkId,
        status: 'mastered',
        masteryScore: 1,
        lastReviewedAt: new Date(),
        nextReviewAt
      }
    });

    revalidatePath('/dictionary');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to mark chunk mastered:", error);
    return { success: false, error: error.message };
  }
}

export async function claimActivityReward(clientUserId, xp, activityType = 'General') {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // Save XP earned to LearningSession for the correct total
    await prisma.learningSession.create({
      data: {
        userId,
        sessionType: activityType,
        score: Math.round(xp)
      }
    });

    revalidatePath('/')
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function markWordAsMastered(clientUserId, wordId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    
    // Always trust the server session ID
    const userId = session.user.id;
    
    // Check if progress already exists
    const existing = await prisma.userWordProgress.findUnique({
      where: {
        userId_wordId: { userId, wordId }
      }
    });

    if (existing) {
      await prisma.userWordProgress.update({
        where: { id: existing.id },
        data: {
          status: 'mastered',
          masteryScore: Math.min(existing.masteryScore + 20, 100),
          timesReviewed: existing.timesReviewed + 1,
          lastReviewed: new Date()
        }
      });
    } else {
      await prisma.userWordProgress.create({
        data: {
          userId,
          wordId,
          status: 'mastered',
          masteryScore: 100,
          timesReviewed: 1
        }
      });
    }
    
    revalidatePath('/practice/flashcards');
    return { success: true };
  } catch (error) {
    console.error("Failed to mark word mastered:", error);
    return { success: false, error: error.message };
  }
}

export async function unlockPack(clientUserId, packId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // 1. Add to unlockedPacks if not already there
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentPacks = user.unlockedPacks || [];
    
    if (!currentPacks.includes(packId)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          unlockedPacks: {
            push: packId
          }
        }
      });

      // 2. Register purchase
      await prisma.purchase.create({
        data: {
          userId,
          planType: 'PACK',
          packId: packId,
          status: 'active'
        }
      });
    }

    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to unlock pack:", error);
    return { success: false, error: error.message };
  }
}
