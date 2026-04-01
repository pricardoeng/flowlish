"use server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

// 1. Join queue
export async function joinQueue() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const currentUserId = session.user.id;

    // First, find if someone else is waiting
    const waitingMatch = await prisma.speechQueue.findFirst({
      where: {
        status: "waiting",
        userId: { not: currentUserId }
      },
      orderBy: { createdAt: "asc" }
    });

    if (waitingMatch) {
      // We found a partner! Let's match them.
      const roomId = `flowlish-room-${waitingMatch.id}-${Date.now()}`;
      
      await prisma.speechQueue.update({
        where: { id: waitingMatch.id },
        data: {
          status: "matched",
          targetId: currentUserId,
          roomId: roomId
        }
      });

      return { success: true, matched: true, roomId };
    } else {
      // Make sure we don't have dangling waiting entries
      await prisma.speechQueue.deleteMany({
        where: { userId: currentUserId, status: "waiting" }
      });

      // Nobody waiting, so we create a waiting entry
      await prisma.speechQueue.create({
        data: {
          userId: currentUserId,
          status: "waiting"
        }
      });

      return { success: true, matched: false };
    }

  } catch (error) {
    console.error("Join Queue Error:", error);
    return { success: false, error: "System error" };
  }
}

// 2. Poll for matchmaking status
export async function checkMatchStatus() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const currentUserId = session.user.id;

    const myEntry = await prisma.speechQueue.findFirst({
      where: {
        userId: currentUserId,
        status: "matched"
      },
      orderBy: { createdAt: "desc" }
    });

    if (myEntry && myEntry.roomId) {
      return { success: true, matched: true, roomId: myEntry.roomId };
    }

    return { success: true, matched: false };
  } catch (error) {
    return { success: false, error: "System error" };
  }
}

// 3. Cancel waiting
export async function cancelQueue() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };
    
    await prisma.speechQueue.deleteMany({
      where: {
        userId: session.user.id,
        status: "waiting"
      }
    });

    return { success: true };
  } catch(error) {
    return { success: false };
  }
}
