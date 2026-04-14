import React from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, rawPacks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        purchases: {
          where: { status: 'active' }
        }
      }
    }),
    // Busca packs reais e distintos do banco de dados (exclui "Free")
    prisma.chunk.findMany({
      select: { pack: true },
      distinct: ['pack'],
      where: { pack: { not: 'Free' } },
      orderBy: { pack: 'asc' }
    })
  ]);

  if (!user) return <div>Usuário não encontrado.</div>;

  // Lista de packs reais no banco
  const availablePacks = rawPacks.map(r => r.pack).filter(Boolean);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Configurações de Perfil</h1>
        <p className="text-zinc-500 font-medium">Personalize sua jornada e ajuste suas preferências de aprendizado.</p>
      </header>
      
      <ProfileForm user={user} availablePacks={availablePacks} />
    </div>
  );
}

