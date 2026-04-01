"use server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

// Helper to create a room in Daily.co
async function createDailyRoom(roomName) {
  const API_KEY = process.env.DAILY_API_KEY;
  
  if (!API_KEY) {
    console.error("DAILY_API_KEY not found in environment variables.");
    return { 
      success: false, 
      error: "Daily.co API Key não configurada no servidor." 
    };
  }

  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
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
      if (data.error === "already-exists") {
        // If it already exists, we still need the URL. 
        // For Daily, it's usually https://[domain].daily.co/[name]
        // But the best way is to fetch it if it exists.
        const getRes = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        });
        const getData = await getRes.json();
        return { success: true, name: roomName, url: getData.url };
      }
      throw new Error(data.info || "Daily API Error");
    }

    return { success: true, name: data.name, url: data.url };
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

    return await prisma.$transaction(async (tx) => {
      await tx.speechQueue.deleteMany({
        where: { userId: currentUserId, status: "waiting" }
      });

      const waitingMatch = await tx.speechQueue.findFirst({
        where: {
          status: "waiting",
          userId: { not: currentUserId }
        },
        orderBy: { createdAt: "asc" }
      });

      if (waitingMatch) {
        // Generate a unique room name
        const roomName = `mango_${Math.random().toString(36).substring(7)}_${Date.now().toString().slice(-4)}`;
        
        const roomResult = await createDailyRoom(roomName);
        if (!roomResult.success) {
          throw new Error(roomResult.error || "Falha ao criar sala de vídeo.");
        }

        // Store the FULL URL in the roomId field for simplicity, or we can use another field if available
        // For now, let's keep roomId but use it as the source of truth for the client
        await tx.speechQueue.update({
          where: { id: waitingMatch.id },
          data: {
            status: "matched",
            targetId: currentUserId,
            roomId: roomResult.url // STORE FULL URL
          }
        });

        await tx.speechQueue.create({
          data: {
            userId: currentUserId,
            status: "matched",
            targetId: waitingMatch.userId,
            roomId: roomResult.url // STORE FULL URL
          }
        });

        return { success: true, matched: true, roomId: roomResult.url };
      } else {
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
      console.log(`Match detected for user ${currentUserId}: ${myEntry.roomId}`);
      return { success: true, matched: true, roomId: myEntry.roomId }; // This is now the URL
    }

    return { success: true, matched: false };
  } catch (error) {
    console.error("Check Match Status Error:", error);
    return { success: false, error: "System error during polling" };
  }
}

// 3. Get the matched room URL for the current user
export async function getMatchedRoom() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };
    
    const myEntry = await prisma.speechQueue.findFirst({
      where: {
        userId: session.user.id,
        status: "matched"
      },
      orderBy: { createdAt: "desc" }
    });

    if (myEntry && myEntry.roomId) {
      return { success: true, url: myEntry.roomId };
    }

    return { success: false, error: "No active match found" };
  } catch (error) {
    return { success: false, error: "System error" };
  }
}

// 4. Cancel waiting
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
