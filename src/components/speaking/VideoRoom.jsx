"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DailyIframe from '@daily-co/daily-js';
import Button from '@/components/ui/Button';
import { ArrowLeft, Video, AlertCircle, RefreshCw } from 'lucide-react';

export default function VideoRoom({ roomId, userName, userId }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);

  // Get Daily domain from env or use a placeholder for setup
  const DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'flowlish'; 
  const roomUrl = `https://${DAILY_DOMAIN}.daily.co/${roomId}`;

  useEffect(() => {
    setIsMounted(true);
    console.log("Speakeasy Room Component Mounted (Daily):", { roomId, userName, userId, roomUrl });
  }, [roomId, userName, userId, roomUrl]);

  // Handle joining and cleanup
  useEffect(() => {
    if (!isMounted || !containerRef.current || !roomId) return;

    // Create the Daily call frame
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '1.5rem',
      },
      showLeaveButton: true,
      theme: {
        colors: {
          accent: '#f97316', // Orange-500
          accentText: '#FFFFFF',
          background: '#09090b', // Zinc-950
          backgroundAccent: '#18181b', // Zinc-900
          baseText: '#FFFFFF',
          border: '#27272a', // Zinc-800
          mainAreaBg: '#09090b',
          mainAreaBgAccent: '#18181b',
          mainAreaText: '#FFFFFF',
          supportiveText: '#a1a1aa',
        },
      },
    });

    callFrameRef.current = callFrame;

    // Join the room
    callFrame.join({
      url: roomUrl,
      userName: userName || 'Estudante Mango',
    }).catch((err) => {
      console.error("Daily join error:", err);
      setError("Não foi possível conectar à sala. Verifique sua conexão ou tente novamente mais tarde.");
    });

    // Event listeners
    callFrame.on('left-meeting', () => {
      router.push('/');
    });

    callFrame.on('error', (evt) => {
      console.error("Daily frame error:", evt);
      setError("Erro na chamada de vídeo. Por favor, recarregue a página.");
    });

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [isMounted, roomId, roomUrl, router, userName]);

  // Helper method to gracefully escape the session
  const exitRoom = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
    router.push('/');
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-bold">Iniciando câmera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-zinc-950 flex flex-col pt-4 overflow-hidden">
      {/* Small top header for navigation */}
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all rounded-xl px-4 py-2" 
          onClick={exitRoom}
        >
          <ArrowLeft size={18} className="mr-2" /> Encerrar Prática
        </Button>
      </div>

      <div className="h-full w-full p-4 md:p-8">
        {/* Missing Config Error */}
        {!process.env.NEXT_PUBLIC_DAILY_DOMAIN && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/95 text-zinc-500 gap-6 p-6">
            <div className="bg-orange-500/10 p-4 rounded-full border border-orange-500/20">
              <Video size={48} className="text-orange-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-white tracking-tight">Configurações Pendentes</p>
              <p className="max-w-md text-zinc-400">
                O Speakeasy requer as variáveis de ambiente <code className="text-orange-500 bg-orange-500/10 px-1 rounded">DAILY_API_KEY</code> e <code className="text-orange-500 bg-orange-500/10 px-1 rounded">NEXT_PUBLIC_DAILY_DOMAIN</code> na Vercel.
              </p>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" className="border-zinc-800 text-zinc-400">
              Voltar ao Início
            </Button>
          </div>
        )}

        {/* Runtime Connection Error */}
        {error && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/95 text-zinc-500 gap-6 p-6">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-white tracking-tight">Falha na Conexão</p>
              <p className="max-w-md text-zinc-400">{error}</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8">
                <RefreshCw size={18} className="mr-2" /> Tentar Novamente
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="border-zinc-800 text-zinc-400">
                Sair
              </Button>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="h-full w-full rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900/50"
        />
      </div>
    </div>
  );
}
