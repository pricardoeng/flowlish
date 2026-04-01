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
      const roomName = `mango-${waitingMatch.id.slice(-8)}-${Date.now().toString().slice(-4)}`;
      
      // CREATE THE ROOM NATIVELY VIA DAILY API
      const roomResult = await createDailyRoom(roomName);
      if (!roomResult.success) {
        return { success: false, error: "Erro ao criar sala de vídeo segura." };
      }

      await prisma.speechQueue.update({
        where: { id: waitingMatch.id },
        data: {
          status: "matched",
          targetId: currentUserId,
          roomId: roomResult.name
        }
      });

      return { success: true, matched: true, roomId: roomResult.name };
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
