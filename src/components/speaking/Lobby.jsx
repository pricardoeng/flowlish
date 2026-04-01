"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { joinQueue, checkMatchStatus, cancelQueue } from '@/actions/matchmaking';
import { Loader2, Video, ArrowLeft, Users } from 'lucide-react';

export default function Lobby({ user }) {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let pollingInterval;

    if (isSearching) {
      pollingInterval = setInterval(async () => {
        const res = await checkMatchStatus();
        if (res.success && res.matched && res.roomId) {
          clearInterval(pollingInterval);
          router.push(`/practice/speaking/room/${res.roomId}`);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isSearching, router]);

  const handleStartSearch = async () => {
    setIsSearching(true);
    setError(null);
    const res = await joinQueue();
    if (res.success && res.matched && res.roomId) {
      router.push(`/practice/speaking/room/${res.roomId}`);
    } else if (!res.success) {
      setError("Erro ao conectar no servidor. Tente novamente.");
      setIsSearching(false);
    }
    // if success but not matched, it stays in isSearching=true
  };

  const handleCancel = async () => {
    setIsSearching(false);
    await cancelQueue();
  };

  return (
    <div className="bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-2xl p-8 text-center">
      <div className="flex justify-start mb-6">
        <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => router.push('/')}>
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </Button>
      </div>

      <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex flex-col items-center justify-center mb-6 text-primary border border-primary/20 shadow-[0_0_30px_rgba(234,88,12,0.2)]">
        <Video size={40} />
      </div>

      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Flowlish Speakeasy</h1>
      <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
        Pratique conversação em inglês face a face com outro aluno(a). Sem amarras, sem julgamentos.
      </p>

      {error && (
        <div className="text-red-400 bg-red-400/10 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {isSearching ? (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-orange-400 animate-spin-reverse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={`/uploads/${user?.id}.jpg`} alt="You" 
                   className="h-20 w-20 rounded-full object-cover border-2 border-zinc-800 bg-zinc-800" 
                   onError={(e) => { e.target.style.display='none' }} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Buscando parceiro...</h3>
            <p className="text-sm text-zinc-500">Mantenha esta tela aberta.</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white"
            onClick={handleCancel}
          >
            Cancelar Busca
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_40px_rgba(234,88,12,0.3)] hover:shadow-[0_0_60px_rgba(234,88,12,0.5)] transition-all"
          onClick={handleStartSearch}
        >
          <Users size={24} className="mr-2" />
          Encontrar Parceiro
        </Button>
      )}
    </div>
  );
}
