"use server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

const DAILY_API_KEY = process.env.DAILY_API_KEY;

// Helper to create a room in Daily.co
async function createDailyRoom(roomName) {
  if (!DAILY_API_KEY) {
    console.warn("DAILY_API_KEY not found. Using static room fallback.");
    return { success: true, name: roomName };
  }

  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          enable_chat: true,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // If room already exists, that's fine too
      if (data.error === "already-exists") return { success: true, name: roomName };
      throw new Error(data.info || "Daily API Error");
    }

    return { success: true, name: data.name };
  } catch (error) {
    console.error("Daily Room Creation Failed:", error);
    return { success: false, error: error.message };
  }
}

// 1. Join queue
export async function joinQueue() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    const currentUserId = session.user.id;

    // Use a transaction to ensure atomicity during the matchmaking process
    return await prisma.$transaction(async (tx) => {
      // 1. Clean up any existing waiting entries for this user to avoid staleness
      await tx.speechQueue.deleteMany({
        where: { userId: currentUserId, status: "waiting" }
      });

      // 2. Find if someone else is already waiting
      const waitingMatch = await tx.speechQueue.findFirst({
        where: {
          status: "waiting",
          userId: { not: currentUserId }
        },
        orderBy: { createdAt: "asc" }
      });

      if (waitingMatch) {
        // We found a partner! Let's pair them up.
        // Simplified roomName: just mango_ + random suffix for stability
        const roomName = `mango_${waitingMatch.id.slice(-6)}_${Date.now().toString().slice(-4)}`;
        
        // CREATE THE ROOM NATIVELY VIA DAILY API (Helper call, uses the key if available)
        const roomResult = await createDailyRoom(roomName);
        if (!roomResult.success) {
          throw new Error("Falha ao criar sala de vídeo segura.");
        }

        // Update the waiting entry to match BOTH users
        await tx.speechQueue.update({
          where: { id: waitingMatch.id },
          data: {
            status: "matched",
            targetId: currentUserId,
            roomId: roomResult.name
          }
        });

        // We also create a complementary 'matched' entry for User B (the joiner) 
        // to make checkMatchStatus consistent for both sides if needed
        await tx.speechQueue.create({
          data: {
            userId: currentUserId,
            status: "matched",
            targetId: waitingMatch.userId,
            roomId: roomResult.name
          }
        });

        return { success: true, matched: true, roomId: roomResult.name };
      } else {
        // Nobody waiting, so User B becomes the one waiting
        await tx.speechQueue.create({
          data: {
            userId: currentUserId,
            status: "waiting"
          }
        });

        return { success: true, matched: false };
      }
    });

  } catch (error) {
    console.error("Join Queue Transaction Error:", error);
    return { success: false, error: error.message || "Erro no sistema de pareamento." };
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
