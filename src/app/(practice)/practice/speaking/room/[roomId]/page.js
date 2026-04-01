import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import VideoRoom from "@/components/speaking/VideoRoom";

export default async function SpeakingRoomPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { roomId } = await params;

  // We find if the room is real
  const match = await prisma.speechQueue.findUnique({
    where: { id: roomId.split('-')[2] || roomId } // Simple safety fallback
  });

  // Since we use roomId based on timestamp, it's safer to check the roomId field directly
  const matchByRoomId = await prisma.speechQueue.findFirst({
    where: { roomId: roomId }
  });

  if (!matchByRoomId) {
    redirect("/practice/speaking?error=room_not_found");
  }

  return <VideoRoom roomId={roomId} userName={session.user.name} userId={session.user.id} />;
}
