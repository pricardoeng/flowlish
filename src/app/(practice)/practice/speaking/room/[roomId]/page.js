import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import VideoRoom from "@/components/speaking/VideoRoom";
import { getMatchedRoom } from "@/actions/matchmaking";

export default async function SpeakingRoomPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Get the real room URL from the server for this user
  const roomData = await getMatchedRoom();

  if (!roomData.success) {
    redirect("/practice/speaking?error=room_not_found");
  }

  return <VideoRoom roomId={roomData.url} userName={session.user.name} userId={session.user.id} />;
}
