"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, X, Volume2, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markChunkAsMastered, claimActivityReward } from '@/actions/learning';

export default function FlashcardDeck({ initialDeck = [], userId }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Completed State
  if (currentIndex >= initialDeck.length) {
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md p-10 bg-zinc-900 border border-zinc-800 rounded-[3rem] text-center space-y-8 shadow-2xl animate-fade-in text-white">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
             <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tight">Tudo Dominado!</h2>
            <p className="text-zinc-400 font-medium pb-4">
              Você revisou {initialDeck.length} chunks e fortaleceu sua memória.
            </p>
          </div>
          <button 
            onClick={() => router.push('/practice')} 
            className="w-full py-4 rounded-full bg-orange-500 text-white font-black hover:bg-orange-600 transition-colors shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            VOLTAR AO HUB
          </button>
        </div>
      </div>
    );
  }

  const getLevelStyles = (level) => {
    const l = (level || 'A1').toUpperCase();
    const map = {
      'A1': { frontBorder: 'border-orange-500/50 hover:border-orange-500', bgBack: 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-400 shadow-[0_0_80px_rgba(249,115,22,0.3)] ring-1 ring-white/20', labelFront: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
      'A2': { frontBorder: 'border-emerald-500/50 hover:border-emerald-500', bgBack: 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.3)] ring-1 ring-white/20', labelFront: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
      'B1': { frontBorder: 'border-blue-500/50 hover:border-blue-500', bgBack: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-400 shadow-[0_0_80px_rgba(59,130,246,0.3)] ring-1 ring-white/20', labelFront: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
      'B2': { frontBorder: 'border-purple-500/50 hover:border-purple-500', bgBack: 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-400 shadow-[0_0_80px_rgba(168,85,247,0.3)] ring-1 ring-white/20', labelFront: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
      'C1': { frontBorder: 'border-fuchsia-500/50 hover:border-fuchsia-500', bgBack: 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 border-fuchsia-400 shadow-[0_0_80px_rgba(217,70,239,0.3)] ring-1 ring-white/20', labelFront: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20' },
      'C2': { frontBorder: 'border-rose-500/50 hover:border-rose-500', bgBack: 'bg-gradient-to-br from-rose-400 to-rose-600 border-rose-400 shadow-[0_0_80px_rgba(244,63,94,0.3)] ring-1 ring-white/20', labelFront: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    };
    return map[l] || map['A1'];
  };

  const currentChunk = initialDeck[currentIndex];
  // Calculate dynamic active style mappings
  const activeStyle = currentChunk ? getLevelStyles(currentChunk.cefrLevel) : getLevelStyles('A1');
  
  const speak = (text) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) && v.lang.startsWith('en'));
    if (v) u.voice = v;
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const handleNext = async (markAsMastered) => {
    if (markAsMastered) {
      await markChunkAsMastered(null, currentChunk.id).catch(console.error);
      // Proportional XP for each chunk
      const xpPerChunk = Math.round(50 / initialDeck.length);
      await claimActivityReward(null, xpPerChunk, 'Flashcards').catch(console.error);
    }
    
    setIsFlipped(false);
    setShowHint(false);
    
    if (currentIndex < initialDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (!isFinishing) {
         setIsFinishing(true);
         setCurrentIndex(initialDeck.length);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4 z-50 overflow-hidden font-sans">
      
      <div className="relative w-full max-w-[460px] z-10 flex items-center justify-center">
        {/* External Arrow Left */}
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          className="hidden md:flex absolute -left-20 lg:-left-24 top-1/2 -translate-y-1/2 p-4 text-zinc-600 hover:text-white transition-all disabled:opacity-0 cursor-pointer z-0 hover:-translate-x-2"
          title="Cartão anterior"
        >
          <ChevronLeft size={64} strokeWidth={1.5} />
        </button>

        {/* External Arrow Right */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="hidden md:flex absolute -right-20 lg:-right-24 top-1/2 -translate-y-1/2 p-4 text-zinc-600 hover:text-white transition-all cursor-pointer z-0 hover:translate-x-2"
          title="Avançar sem memorizar"
        >
          <ChevronRight size={64} strokeWidth={1.5} />
        </button>

        <div className="w-full bg-[#1c1c1f] rounded-[2.5rem] shadow-2xl border border-white/5 animate-in slide-in-from-bottom-4 duration-500 z-20 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-orange-500" strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                CHUNKS
              </span>
            </div>
            
            {/* Progress Indicators */}
            <div className="flex items-center gap-1.5 ml-2">
              {initialDeck.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentIndex ? "w-5 bg-orange-500" : 
                    idx < currentIndex ? "w-1.5 bg-orange-500/40" : "w-1.5 bg-zinc-700"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-zinc-500 ml-2">{currentIndex + 1}/{initialDeck.length}</span>
          </div>

          <button onClick={() => router.push('/practice')} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center relative perspective-1000">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 text-center">
            {isFlipped ? "AQUI ESTÁ A TRADUÇÃO" : " CLIQUE NO CARD PARA VER A TRADUÇÃO"}
          </p>

          {/* The Card */}
          <div 
            onClick={() => {
              if(!isFlipped) speak(currentChunk.englishText);
              setIsFlipped(!isFlipped);
            }}
            className={cn(
              "w-full min-h-[220px] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 preserve-3d shadow-2xl",
              isFlipped 
                ? cn("rotate-y-180 border", activeStyle.bgBack) 
                : cn("bg-[#2a2a2d] border hover:-translate-y-1 hover:bg-[#303033]", activeStyle.frontBorder)
            )}
          >
            {/* Front */}
            <div className={cn("absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden", isFlipped && "hidden")}>
               <div className="absolute top-5 left-5">
                 <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border", activeStyle.labelFront)}>
                   NÍVEL {currentChunk.cefrLevel}
                 </span>
               </div>
               <h2 className="text-2xl font-bold text-white leading-snug drop-shadow-sm px-4">
                 {currentChunk.englishText}
               </h2>
            </div>
            
            {/* Back (Translation) */}
            <div className={cn("absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180", !isFlipped && "hidden")}>
               <div className="absolute top-5 left-5">
                 <span className="px-3 py-1 bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm">
                   NÍVEL {currentChunk.cefrLevel}
                 </span>
               </div>
               <h3 className="text-xl font-medium text-white/80 mb-4 italic drop-shadow-sm">
                 {currentChunk.englishText}
               </h3>
               <h2 className="text-3xl font-black text-white leading-snug px-4 drop-shadow-lg">
                 {currentChunk.portugueseTranslation}
               </h2>
            </div>
          </div>

          {/* Hint Overlay (Optional) */}
          {showHint && !isFlipped && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 text-center z-20 shadow-2xl animate-fade-in">
              <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Dica Nível {currentChunk.cefrLevel}</p>
              <p className="text-white text-lg font-medium">{currentChunk.portugueseTranslation.substring(0, 5)}...</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
                className="mt-4 text-xs text-zinc-400 underline"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 w-full flex flex-col items-center gap-4">
             {isFlipped ? (
                <div className="w-full flex justify-between gap-3 animate-fade-in">
                  {/* Prev (Mobile Só) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex === 0}
                    className="md:hidden h-14 w-14 shrink-0 flex items-center justify-center rounded-[1.25rem] bg-white/5 border border-white/5 text-zinc-400 font-black hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Voltar ao card anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                    className="flex-1 h-14 rounded-[1.25rem] bg-white text-black font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-xl"
                  >
                    <CheckCircle2 size={20} />
                    MEMORIZAR
                  </button>

                  {/* Skip (Mobile Só) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                    className="md:hidden h-14 w-14 shrink-0 flex items-center justify-center rounded-[1.25rem] bg-white/5 border border-white/5 text-zinc-400 font-bold hover:bg-white/10 hover:text-white transition-colors"
                    title="Avançar sem memorizar"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
             ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); speak(currentChunk.englishText); }}
                  className="px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center gap-2 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  <Volume2 size={18} />
                  Ouvir pronúncia
                </button>
             )}

             {!isFlipped && (
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                 className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs hover:text-zinc-300 transition-colors"
               >
                 <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                    <span className="text-[10px] leading-none">?</span>
                 </div>
                 Ver dica
               </button>
             )}
          </div>
        </div>

      </div>
      </div>

       <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </div>
  );
}
