"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function completePracticeSession(userId, chunkResults) {
  try {
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
          lastReviewed: new Date(),
          // Simple SRS increment (can be expanded)
          timesReviewed: { increment: 1 }
        },
        create: {
          userId,
          chunkId: res.chunkId,
          status: res.status
        }
      })
    }))

    // Record the session
    await prisma.learningSession.create({
      data: {
        userId,
        duration: 10, // Mock duration for now
        chunksLearned: chunkResults.length,
        xpEarned: chunkResults.length * 10 
      }
    })

    revalidatePath('/')
    revalidatePath('/dictionary')
    
    return { success: true, count: results.length }
  } catch (error) {
    console.error("Failed to complete session:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        goal: data.goal,
        currentLevel: data.level
      }
    })
    
    revalidatePath('/profile')
    revalidatePath('/')
    
    return { success: true, user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function toggleFavorite(userId, chunkId) {
  try {
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

export async function claimActivityReward(userId, xp) {
  try {
    console.log(`User ${userId} claimed ${xp} XP`);
    // Logic to increment User.totalXP if we add it to the schema later
    revalidatePath('/')
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
