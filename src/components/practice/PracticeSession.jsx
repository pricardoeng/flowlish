"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Play, RotateCcw, CheckCircle2, Mic, Brain, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { completePracticeSession } from '@/actions/learning';

const PracticeSession = ({ user, chunks }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const [audioCompleted, setAudioCompleted] = useState(false);

  const handleNext = async (status) => {
    setAudioCompleted(false);
    const newResults = [...results, { chunkId: chunks[step].id, status }];
    setResults(newResults);

    if (step < chunks.length - 1) {
      setStep(step + 1);
    } else {
      setIsFinishing(true);
      await completePracticeSession(user.id, newResults);
      setSessionActive(false);
      setIsFinishing(false);
      // In a real app, redirect to a "congrats" page or refresh dashboard
    }
  };

  // Sessão concluída
  if (!sessionActive && results.length > 0) {
    const mastered = results.filter(r => r.status === 'mastered').length;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in">
        <div className="h-32 w-32 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-6xl">
          🎉
        </div>
        <div className="max-w-md space-y-3">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Sessão concluída!</h1>
          <p className="text-zinc-600 font-medium">
            Você dominou <span className="text-primary font-bold">{mastered} de {results.length} chunks</span> nesta sessão. Incrível progresso!
          </p>
        </div>
        <div className="flex flex-col w-full max-w-sm gap-3">
          <Button size="lg" onClick={() => { setResults([]); setStep(0); setSessionActive(true); }} className="w-full">
            Mais uma sessão! <Play size={20} fill="currentColor" />
          </Button>
          <Link href="/" className="w-full">
            <Button variant="secondary" size="lg" className="w-full text-zinc-500 font-bold">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sem chunks disponíveis para o nível atual
  if (chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in">
        <div className="text-6xl">📭</div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Nenhum chunk disponível</h1>
          <p className="text-zinc-600 font-medium">
            Ainda não temos chunks para o seu nível ({user.currentLevel || 'A1'}). Ajuste seu perfil para desbloquear mais conteúdo!
          </p>
        </div>
        <Link href="/profile" className="w-full max-w-sm">
          <Button size="lg" className="w-full">Ajustar Perfil</Button>
        </Link>
      </div>
    );
  }

  // Pronto para começar
  if (!sessionActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in">
        <div className="relative h-40 w-40 rounded-full bg-primary-light flex items-center justify-center text-primary">
          <Brain size={80} strokeWidth={1} />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20"></div>
        </div>
        
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Pronto para começar?</h1>
          <p className="text-zinc-600 font-medium">
            Sua meta de hoje é de 15 chunks. Vamos revisar os aprendidos e descobrir novos!
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3">
          <Button size="lg" onClick={() => setSessionActive(true)} className="w-full">
            Começar Sessão <Play size={20} fill="currentColor" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full text-zinc-500 font-bold">
            Revisar Chunks Dominados
          </Button>
        </div>
      </div>
    );
  }

  const currentChunk = chunks[step] || chunks[0];
  const progress = ((step + 1) / chunks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-10 animate-fade-in">
      {/* Session Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
          <span>Sessão Diária: Chuva de Chunks</span>
          <span>{step + 1} de {chunks.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div 
             className="h-full bg-primary transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
             style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Chunk Stage */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-8">
        <div className="relative group text-center space-y-4 p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-premium w-full transition-all hover:scale-[1.01]">
          <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-[10px] font-black uppercase tracking-widest">
            {currentChunk.cefrLevel}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter leading-tight drop-shadow-sm">
            {currentChunk.englishText}
          </h2>
          <p className="text-xl text-zinc-600 font-medium italic">
            "{currentChunk.portugueseTranslation}"
          </p>
          
          <div className="pt-6 flex justify-center gap-4">
             <button 
               onClick={() => {
                 window.speechSynthesis.cancel();
                 const utterance = new SpeechSynthesisUtterance(currentChunk.englishText);
                 
                 // Try to find a high quality English voice
                 const voices = window.speechSynthesis.getVoices();
                 const premiumVoice = voices.find(v => 
                   (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) && 
                   v.lang.startsWith('en')
                 );
                 if (premiumVoice) utterance.voice = premiumVoice;
                 
                 utterance.lang = 'en-US';
                 utterance.rate = 0.8;
                 utterance.pitch = 1.0;
                 utterance.onend = () => {
                   setAudioCompleted(true);
                   // Auto-advance after 1.5 seconds as requested ("marcar como concluida")
                   setTimeout(() => {
                     handleNext('mastered');
                   }, 1500);
                 };
                 window.speechSynthesis.speak(utterance);
               }}
               className={cn(
                 "flex h-16 w-16 items-center justify-center rounded-full transition-all border shadow-sm",
                 audioCompleted ? "bg-primary text-white border-primary" : "bg-zinc-50 text-primary border-zinc-100 ring-2 ring-primary/20"
               )}
             >
                <Volume2 size={28} />
             </button>
             <button 
               onClick={() => {
                 window.speechSynthesis.cancel();
               }}
               className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all border border-zinc-100"
             >
                <RotateCcw size={28} />
             </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-4">
        <Button 
          variant="secondary" 
          size="lg" 
          className="flex-1 py-6 border-2"
          onClick={() => handleNext('learning')}
          disabled={isFinishing}
        >
          Não conheço
        </Button>
        <Button 
          size="lg" 
          className={cn(
            "flex-1 py-6 text-xl transition-all duration-500",
            audioCompleted ? "scale-105 shadow-xl shadow-primary/20 ring-4 ring-primary/10" : "opacity-80"
          )}
          onClick={() => handleNext('mastered')}
          disabled={isFinishing}
        >
          {isFinishing ? "Finalizando..." : <>Dominei! <CheckCircle2 size={24} /></>}
        </Button>
      </div>
    </div>
  );
};

export default PracticeSession;
