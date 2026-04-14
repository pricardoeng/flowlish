"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Volume2, Check, ArrowLeft, RotateCcw, 
  ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { getLevelConfig } from '@/config/levels';
import { markChunkAsMastered, claimActivityReward } from '@/actions/learning';

const SAVE_KEY = 'mango-quiz-chatter-v1';

function speak(text) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) && v.lang.startsWith('en'));
  if (v) u.voice = v;
  u.lang = 'en-US'; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function ChunkCard({ chunk, flipped, isLearned, onFlip, onAudio, onMarkLearned, isPlaying }) {
  const levelCfg = getLevelConfig(chunk.cefrLevel);
  
  // Clean text helper to remove IDs like (23) or trailing numbers
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/\s*\(\d+\)$/, '').trim();
  };

  const englishText = cleanText(chunk.englishText);
  const portugueseText = cleanText(chunk.portugueseTranslation);

  // Shared Labels component to avoid duplication
  const CardLabels = () => (
    <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
       <span className="px-4 py-1.5 rounded-full bg-black/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">
          {chunk.theme || chunk.pack || 'TACTIC'}
       </span>
       <span className="px-4 py-1.5 rounded-full bg-black/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.1em] border border-white/5">
          {levelCfg.label}
       </span>
    </div>
  );

  // Shared Action Button component
  const ActionButton = () => (
    <div className="absolute bottom-8 right-8 z-30">
       <button 
         onClick={(e) => { e.stopPropagation(); onMarkLearned(); }}
         className={cn(
           "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-lg backdrop-blur-md",
           isLearned ? "bg-white text-black border-white" : "bg-black/10 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/40"
         )}
       >
          <Check size={24} strokeWidth={4} />
       </button>
    </div>
  );

  return (
    <div className="w-full max-w-[420px] mx-auto perspective-2000">
      <div
        className={cn(
          "relative w-full aspect-[3/3.8] transition-all duration-700 preserve-3d cursor-pointer rounded-[32px] group",
          flipped ? "rotate-y-180" : "",
          levelCfg.glow
        )}
        onClick={onFlip}
      >
        {/* Shine/Reflection Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[32px] overflow-hidden">
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-linear-to-br from-white/10 via-transparent to-transparent rotate-45 transform transition-transform duration-1000 group-hover:translate-x-10 group-hover:translate-y-10" />
        </div>

        {/* FRONT FACE (English) */}
        <div
          className={cn(
            "absolute inset-0 rounded-[32px] p-10 flex flex-col justify-center items-center text-center overflow-hidden border border-white/20",
            "bg-linear-to-br",
            levelCfg.gradient
          )}
          style={{ backfaceVisibility: 'hidden', zHost: flipped ? 0 : 1 }}
        >
          <CardLabels />

          <div className="space-y-6">
             <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.05] tracking-tighter drop-shadow-md">
                {englishText}
             </h2>
          </div>

          <ActionButton />

          {/* Corners Decor */}
          <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-[24px]" />
          <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-10 right-10 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-10 left-10 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
        </div>

        {/* BACK FACE (Portuguese) */}
        <div
          className={cn(
            "absolute inset-0 rounded-[32px] p-10 flex flex-col justify-center items-center text-center border border-white/20",
            "bg-linear-to-br",
            levelCfg.gradient
          )}
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)', 
            zIndex: flipped ? 1 : 0 
          }}
        >
          <CardLabels />

          <div className="space-y-4">
             <h3 className="text-3xl font-black text-white tracking-tighter leading-tight drop-shadow-md">
                {portugueseText}
             </h3>
             <p className="text-base font-bold text-white/60 italic">
                {englishText}
             </p>
          </div>

          <ActionButton />

          {/* Corners Decor for symmetry */}
          <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-[24px]" />
          <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-10 right-10 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-10 left-10 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg" />

          {/* Progress Indicator (bottom line) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function TacticsGame({ initialChunks = [] }) {
  const router = useRouter();
  const [deck, setDeck] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [learnedIds, setLearnedIds] = useState(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screen, setScreen] = useState('loading');

  // Load persistence and Filter Deck
  useEffect(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    let lastSavedIdx = 0;
    let savedLearned = new Set();

    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.learnedIds) savedLearned = new Set(saved.learnedIds);
        if (saved.currentIdx !== undefined) lastSavedIdx = saved.currentIdx;
      } catch (e) {}
    }

    // Filter out learned chunks and deduplicate
    const seen = new Set();
    const remaining = initialChunks.filter(c => {
      if (savedLearned.has(c.id)) return false;
      const cleanEng = c.englishText.replace(/\s*\(\d+\)$/, '').trim().toLowerCase();
      const cleanPt = c.portugueseTranslation.replace(/\s*\(\d+\)$/, '').trim().toLowerCase();
      const key = `${cleanEng}|${cleanPt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    setLearnedIds(savedLearned);
    setDeck(remaining);
    
    if (remaining.length === 0) {
      setScreen('mastered_all');
    } else {
      // Ensure currentIdx is valid for the new remaining list
      setCurrentIdx(lastSavedIdx < remaining.length ? lastSavedIdx : 0);
      setScreen('play');
    }
  }, [initialChunks]);

  // Save persistence
  useEffect(() => {
    if (screen === 'play' && deck.length > 0) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        currentIdx,
        learnedIds: Array.from(learnedIds),
        savedAt: new Date().toISOString()
      }));
    }
  }, [currentIdx, learnedIds, screen, deck.length]);

  const current = deck[currentIdx];
  const total = deck.length;
  const totalOriginal = initialChunks.length || 1; // Prevent div by zero
  const learnedCountGlobal = learnedIds.size;
  const progressPcnt = Math.min(100, Math.round((learnedCountGlobal / totalOriginal) * 100));

  const finishSession = async () => {
    // Calculate reward (minimal XP for practice)
    const xpPerChunk = 10;
    const earnedXp = Array.from(learnedIds).length * xpPerChunk;
    
    // Sync XP to DB
    if (earnedXp > 0) {
      await claimActivityReward(null, earnedXp, 'Praticar').catch(console.error);
    }

    // Clear session-specific index but keep global learnedIds locally
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      currentIdx: 0,
      learnedIds: Array.from(learnedIds),
      savedAt: new Date().toISOString()
    }));
    router.push('/practice');
  };

  const next = () => {
    setIsFlipped(false);
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      finishSession();
    }
  };

  const prev = () => {
    setIsFlipped(false);
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const handleMarkLearned = async () => {
    if (!current) return;
    const newLearned = new Set(learnedIds);
    const isNowLearned = !newLearned.has(current.id);
    
    if (isNowLearned) {
      newLearned.add(current.id);
      // Sync to DB
      await markChunkAsMastered(null, current.id).catch(console.error);
    } else {
      newLearned.delete(current.id);
    }
    setLearnedIds(newLearned);
  };

  const startFresh = () => {
    localStorage.removeItem(SAVE_KEY);
    setLearnedIds(new Set());
    setDeck([...initialChunks]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setScreen('play');
  };

  if (screen === 'loading') return null;

  if (screen === 'mastered_all') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0d1117] text-white p-10 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10">
           <CheckCircle2 size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase mb-4">Tudo Dominado!</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-12">Você já aprendeu todos os chunks deste pack.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
           <button onClick={() => router.push('/practice')} className="w-full py-6 rounded-3xl bg-white text-black font-black text-xl hover:scale-105 transition-all">
             VOLTAR AO DASHBOARD
           </button>
           <button onClick={startFresh} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] hover:text-white pt-4">
             Resetar Progresso
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117] text-white overflow-hidden selection:bg-white/10">
      
      {/* 1. TOP HUD */}
      <div className="w-full max-w-2xl mx-auto pt-4 px-8 text-center space-y-4">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
           <span>{learnedCountGlobal} / {totalOriginal} aprendidos</span>
           <span>{progressPcnt}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
           <div 
             className="h-full bg-white/40 transition-all duration-1000 ease-out" 
             style={{ width: `${progressPcnt}%` }} 
           />
        </div>
        <div className="text-zinc-500 font-black text-[10px] tracking-[0.4em] pt-2 uppercase">
           {currentIdx + 1} / {total} {total < totalOriginal && (
             <span className="opacity-40 ml-2">
               ({Math.max(0, total - (currentIdx + 1))} restantes)
             </span>
           )}
        </div>
      </div>

      {/* 2. MAIN STAGE */}
      <div className="flex-1 flex items-center justify-center p-6 gap-8 relative">
        
        {/* Nav Buttons (Desktop) */}
        <button 
          onClick={prev}
          disabled={currentIdx === 0}
          className="hidden md:flex absolute left-12 z-30 w-14 h-14 rounded-full border border-white/10 items-center justify-center transition-all bg-white/5 hover:bg-white/15 disabled:opacity-0"
        >
          <ChevronLeft size={24} />
        </button>

        {/* The Card */}
        {current && (
           <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
              <ChunkCard 
                chunk={current}
                flipped={isFlipped}
                isLearned={learnedIds.has(current.id)}
                onFlip={() => setIsFlipped(!isFlipped)}
                onAudio={() => { setIsPlaying(true); speak(current.englishText); setTimeout(() => setIsPlaying(false), 2000); }}
                onMarkLearned={handleMarkLearned}
                isPlaying={isPlaying}
              />
           </div>
        )}

        {/* Mobile Sidebar Nav Handles */}
        <div className="md:hidden absolute inset-y-0 left-0 w-20" onClick={prev} />
        <div className="md:hidden absolute inset-y-0 right-0 w-20" onClick={next} />

        <button 
          onClick={next}
          className="hidden md:flex absolute right-12 z-30 w-14 h-14 rounded-full border border-white/10 items-center justify-center transition-all bg-white/5 hover:bg-white/15"
        >
          {currentIdx === total - 1 ? <CheckCircle2 size={24} className="text-green-400" /> : <ChevronRight size={24} />}
        </button>
      </div>

      {/* 3. BOTTOM ACTIONS */}
      <div className="w-full max-w-sm mx-auto pb-6 px-8 flex flex-col items-center gap-6">
        
        {/* Navigation Arrows (Mobile) */}
        <div className="flex md:hidden items-center gap-12">
           <button 
              onClick={prev} 
              disabled={currentIdx === 0}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 disabled:opacity-20"
           >
              <ChevronLeft size={20} />
           </button>
           <button 
              onClick={next} 
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-all active:scale-95"
           >
              {currentIdx === total - 1 ? <CheckCircle2 size={20} className="text-green-400" /> : <ChevronRight size={20} />}
           </button>
        </div>

        {/* Audio & Reset */}
        <div className="flex items-center gap-8">
           <button 
             onClick={(e) => { e.stopPropagation(); setIsPlaying(true); speak(current.englishText); setTimeout(() => setIsPlaying(false), 2000); }}
             className={cn(
               "w-16 h-16 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/15",
               isPlaying && "bg-white text-black scale-110"
             )}
           >
              <Volume2 size={24} strokeWidth={2.5} />
           </button>
           <button 
             onClick={() => { setIsFlipped(false); }}
             className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/15 transition-all active:rotate-180"
           >
              <RotateCcw size={24} strokeWidth={2.5} />
           </button>
        </div>

        {/* HUD DOTS */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar px-4 h-4">
           {deck.map((_, i) => (
             <button 
               key={i} 
               onClick={() => { setIsFlipped(false); setCurrentIdx(i); }}
               className={cn(
                 "transition-all duration-300 rounded-full",
                 i === currentIdx ? "w-6 h-2 bg-white" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
               )} 
             />
           ))}
        </div>

        {/* Encerrar Sessão */}
        <button 
          onClick={finishSession}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-colors py-2"
        >
          <ArrowLeft size={16} /> Encerrar Sessão
        </button>
      </div>

      {/* Global Style for 3D logic */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
