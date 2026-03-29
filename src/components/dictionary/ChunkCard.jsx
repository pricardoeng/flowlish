"use client"
import React, { useState } from 'react';
import { Volume2, CheckCircle2, Bookmark, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavorite, markChunkAsMastered } from '@/actions/learning';
import { useTransition } from 'react';

const ChunkCard = ({ chunk, userId }) => {
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(chunk.isFavorite);
  const [isMastered, setIsMastered] = useState(chunk.mastered || false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const levelColors = {
    A1: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    A2: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    B1: 'bg-blue-50 text-blue-600 border-blue-100',
    B2: 'bg-blue-50 text-blue-600 border-blue-100',
    C1: 'bg-purple-50 text-purple-600 border-purple-100',
    C2: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border transition-all hover:shadow-md",
      isMastered ? "border-primary/40 ring-1 ring-primary/10" : "border-zinc-100 hover:border-primary/20"
    )}>
      <div className="flex items-start justify-between">
        <span className={cn(
          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
          levelColors[chunk.cefrLevel] || 'bg-zinc-50 text-zinc-500 border-zinc-200'
        )}>
          {chunk.cefrLevel}
        </span>
        <div className="flex gap-1">
          <button 
            onClick={handleFavorite}
            disabled={isPending}
            className={cn(
              "p-1.5 transition-colors",
              favorited ? "text-yellow-500" : "text-zinc-300 hover:text-primary"
            )}
          >
            <Bookmark size={18} fill={favorited ? "currentColor" : "none"} />
          </button>
          <button className="p-1.5 text-zinc-300 hover:text-zinc-500 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-xl font-black text-zinc-900 leading-tight group-hover:text-primary transition-colors tracking-tight">
          {chunk.englishText}
        </h3>
        <p className="text-sm font-medium text-zinc-600 italic">
          {chunk.portugueseTranslation}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-lg mt-1">
            {chunk.theme || 'GENERAL'}
          </span>
          {isMastered && (
            <CheckCircle2 size={16} className="text-primary ml-1" />
          )}
        </div>
        <button 
          onClick={playAudio}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all shadow-sm",
            isPlaying 
              ? "bg-primary text-white scale-110 animate-pulse" 
              : isMastered 
                ? "bg-white text-primary border-2 border-primary" 
                : "bg-primary-light text-primary hover:bg-primary hover:text-white"
          )}
        >
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChunkCard;
