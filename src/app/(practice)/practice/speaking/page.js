import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Lobby from "@/components/speaking/Lobby";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Flowlish | Speakeasy Room",
};

export default async function SpeakingLobbyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <Lobby user={user} />
      </div>
    </div>
  );
}
