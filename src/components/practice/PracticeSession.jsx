"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Play, RotateCcw, CheckCircle2, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { completePracticeSession } from '@/actions/learning';
import { useModals } from '@/context/ModalContext';
import { getLevelConfig } from '@/config/levels';

const PracticeSession = ({ user, chunks, isSample = false }) => {
  const { openUpgrade } = useModals();
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
      if (!isSample) {
        await completePracticeSession(user.id, newResults);
      }
      setSessionActive(false);
      setIsFinishing(false);
    }
  };

  const getLevelStyles = (levelId) => {
    const cfg = getLevelConfig(levelId);
    return `${cfg.bg} text-white`;
  };

  // Sessão concluída
  if (!sessionActive && results.length > 0) {
    const mastered = results.filter(r => r.status === 'mastered').length;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in transition-colors">
        <div className="relative h-48 w-48 transition-transform hover:scale-110">
          <img 
            src="/images/mascot.png" 
            alt="Mango Mascot" 
            className="h-full w-full object-contain drop-shadow-2xl animate-float"
          />
        </div>
        
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors uppercase">
            {isSample ? "Gostou da amostra?" : "Sessão concluída!"}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium transition-colors px-4">
            {isSample 
              ? `Você acaba de praticar 3 chunks do Pack ${chunks[0]?.pack}. Desbloqueie o acesso total para dominar centenas de frases técnicas!`
              : `Parabéns! Você dominou ${mastered} de ${results.length} chunks hoje.`}
          </p>
        </div>

        {isSample ? (
          <div className="flex flex-col w-full max-w-sm gap-4 p-6 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/20 shadow-premium">
            <div className="flex items-center gap-3 text-primary justify-center mb-2">
              <Sparkles size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Oferta Premium</span>
            </div>
            <Button size="lg" onClick={openUpgrade} className="w-full bg-orange-600 hover:bg-orange-700 shadow-orange-500/20">
              Desbloquear +1200 Chunks <ArrowRight size={18} className="ml-2" />
            </Button>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full text-zinc-500">Voltar ao Basic</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-sm gap-3">
            <Button size="lg" onClick={() => { setResults([]); setStep(0); setSessionActive(true); }} className="w-full">
              Mais uma sessão! <Play size={20} fill="currentColor" />
            </Button>
            <Link href="/" className="w-full">
              <Button variant="secondary" size="lg" className="w-full text-zinc-500 dark:text-zinc-400 font-bold transition-colors">Voltar ao Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Sem chunks disponíveis para o nível atual
  if (chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in transition-colors">
        <div className="text-6xl">📭</div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors">Nenhum chunk disponível</h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
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
    const packName = chunks[0]?.pack || 'Daily';
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in transition-colors">
        <div className="relative h-48 w-48 transition-transform hover:scale-110">
          <img 
            src="/images/mascot.png" 
            alt="Mango Mascot" 
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles size={12} /> Pack {packName}
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight transition-colors uppercase">Vamos começar?</h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
            {isSample 
              ? `Você acessou uma amostra premium do pack ${packName}. Preparado para 3 desafios rápidos?`
              : `Sua meta de hoje é de ${chunks.length} chunks. Estou pronto para te ajudar a dominar cada um deles!`}
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3">
          <Button size="lg" onClick={() => setSessionActive(true)} className="w-full">
            Começar Sessão <Play size={20} fill="currentColor" />
          </Button>
          {!isSample && (
            <Button variant="secondary" size="lg" className="w-full text-zinc-500 dark:text-zinc-400 font-bold transition-colors">
              Revisar Chunks Dominados
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentChunk = chunks[step] || chunks[0];
  const progress = ((step + 1) / chunks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-10 animate-fade-in transition-colors">
      {/* Session Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors">
          <span className="flex items-center gap-2">
            {isSample ? "Amostra Premium" : "Sessão Diária"} • <span className="text-primary">{currentChunk.pack}</span>
          </span>
          <span>{step + 1} de {chunks.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden transition-colors">
          <div 
             className="h-full bg-primary transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
             style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Chunk Stage - Pip Decks Style Physical Card */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] py-8">
        <div className="neo-card w-full max-w-lg min-h-[400px] flex flex-col overflow-hidden bg-white dark:bg-zinc-900 mx-auto">
          {/* Top Graphic Banner */}
          <div className={cn(
            "px-6 py-4 flex items-center justify-between border-b-[3px] border-zinc-900 dark:border-zinc-700 font-bold uppercase tracking-wider",
            getLevelStyles(currentChunk.cefrLevel)
          )}>
            <span className="text-sm font-black uppercase tracking-[0.2em] opacity-90">
              NÍVEL {currentChunk.cefrLevel}
            </span>
            <span className="text-xs font-black uppercase bg-white/20 px-3 py-1 rounded-full">
              {currentChunk.pack || 'Geral'}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center flex-1 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-[1.1]">
              {currentChunk.englishText}
            </h2>
            <div className="w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <p className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 font-bold italic">
              {currentChunk.portugueseTranslation}
            </p>
          </div>

          {/* Card Action / Footer */}
          <div className="px-8 py-6 border-t-[3px] border-zinc-900 dark:border-zinc-700 mt-auto flex justify-center bg-zinc-50 dark:bg-zinc-950">
             <button 
               onClick={() => {
                 window.speechSynthesis.cancel();
                 const utterance = new SpeechSynthesisUtterance(currentChunk.englishText);
                 const voices = window.speechSynthesis.getVoices();
                 const premiumVoice = voices.find(v => 
                   (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) && 
                   v.lang.startsWith('en')
                 );
                 if (premiumVoice) utterance.voice = premiumVoice;
                 utterance.lang = 'en-US';
                 utterance.rate = 0.8;
                 utterance.onend = () => {
                   setAudioCompleted(true);
                   setTimeout(() => handleNext('mastered'), 1500);
                 };
                 window.speechSynthesis.speak(utterance);
               }}
               className={cn(
                 "flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#09090b] dark:shadow-[4px_4px_0px_0px_#3f3f46] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none active:scale-95",
                 audioCompleted ? "bg-primary text-white border-primary border-primary shadow-none translate-y-[2px] translate-x-[2px]" : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
               )}
             >
                <Volume2 size={28} strokeWidth={2.5} />
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
