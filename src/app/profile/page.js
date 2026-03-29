import React from 'react';
import prisma from '@/lib/prisma';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const user = await prisma.user.findUnique({
    where: { email: 'paulo@flowlish.app' }
  });

  if (!user) return <div>Usuário não encontrado.</div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Configurações de Perfil</h1>
        <p className="text-zinc-500 font-medium">Personalize sua jornada e ajuste suas preferências de aprendizado.</p>
      </header>
      
      <ProfileForm user={user} />
    </div>
  );
}

