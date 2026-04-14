"use client"
import React, { useState, useTransition } from 'react';
import { Volume2, CheckCircle2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavorite, markChunkAsMastered } from '@/actions/learning';
import { getLevelConfig } from '@/config/levels';

const ChunkCard = ({ chunk, userId }) => {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(chunk.isFavorite);
  const [isMastered, setIsMastered] = useState(chunk.mastered || false);
  const [isPlaying, setIsPlaying] = useState(false);

  const levelCfg = getLevelConfig(chunk.cefrLevel);

  const handleFavorite = () => {
    setFavorited(!favorited);
    startTransition(async () => {
      await toggleFavorite(userId, chunk.id);
    });
  };

  const playAudio = (e) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(chunk.englishText);
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) &&
      v.lang.startsWith('en')
    );
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (!isMastered) {
        setIsMastered(true);
        startTransition(async () => {
          await markChunkAsMastered(userId, chunk.id);
        });
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#1c1c1f] border border-zinc-800 shadow-2xl transition-all duration-300 hover:shadow-orange-500/10 hover:-translate-y-1 hover:border-zinc-700"
    )}>
      {/* Dynamic Background Accent (Very subtle) */}
      <div 
        className={cn("absolute top-0 right-0 h-32 w-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 pointer-events-none", levelCfg.bg)}
      />
      
      <div className="px-6 pt-6 pb-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50">
           <div className={cn("w-2 h-2 rounded-full", levelCfg.bg)} />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
             {levelCfg.label}
           </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleFavorite}
            disabled={isPending}
            className={cn(
              "p-2 rounded-xl transition-all hover:bg-zinc-800",
              favorited ? "text-orange-500 bg-orange-500/10" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <Bookmark size={18} fill={favorited ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="p-8 pt-4 flex flex-col flex-1 relative z-10">
        <div className="space-y-4 flex-1 mb-8">
          <div className="flex items-center gap-2 opacity-60">
             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
               {chunk.pack || chunk.theme || 'CHUNKS BÁSICOS'}
             </span>
          </div>
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">
            {chunk.englishText}
          </h3>
          <p className="text-sm font-medium text-zinc-400 leading-snug">
            {chunk.portugueseTranslation}
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            {isMastered && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-500/20">
                <CheckCircle2 size={12} />
                Dominado
              </div>
            )}
          </div>
          <button 
            onClick={playAudio}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
              "bg-zinc-800 border border-zinc-700 text-zinc-400",
              "hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110 active:scale-95 shadow-sm group/btn",
              isPlaying && "bg-orange-500 text-white border-orange-500 animate-pulse"
            )}
          >
            <Volume2 size={24} strokeWidth={2.5} className={cn("transition-transform", !isPlaying && "group-hover/btn:rotate-12")} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChunkCard;
