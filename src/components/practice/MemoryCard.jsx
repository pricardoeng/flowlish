"use client"
import React, { useState } from 'react';
import { Volume2, CheckCircle2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MemoryCard = ({ word, onComplete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const playAudio = (e) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.englishWord);
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')) &&
      v.lang.startsWith('en')
    );
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="group relative w-full aspect-[3/4] max-w-sm mx-auto perspective-1000">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={cn(
          "w-full h-full transition-transform duration-700 preserve-3d cursor-pointer shadow-xl rounded-2xl relative",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* FRONT FACE (Image/MTG Card) */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center p-2 transition-colors">
          {(word.imageUrl && !imgError) ? (
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image 
                src={`${word.imageUrl}?v=3`} 
                alt={word.englishWord} 
                fill
                className="object-contain p-4 transition-opacity duration-300"
                priority
                unoptimized
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 transition-colors animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mx-auto mb-6 opacity-40">
                <img src="/images/logo_icon.png" alt="Mango Logo" className="object-contain grayscale" />
              </div>
              <p className="font-serif text-xl italic font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {word.englishWord}
              </p>
              <p className="text-xs mt-3 uppercase tracking-widest opacity-60">Ilustração em breve</p>
            </div>
          )}
          {/* Subtle overlay hint */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-70">
            <span className="bg-black/60 dark:bg-black/80 text-white text-xs py-1 px-3 rounded-full backdrop-blur-md flex items-center gap-2 transition-colors">
              <RefreshCcw size={12} /> Clique para Virar
            </span>
          </div>
        </div>

        {/* BACK FACE (Text & Info) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-zinc-900 rounded-2xl border-4 border-primary/20 p-6 flex flex-col justify-between shadow-inner transition-colors">
          
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">
              {word.cefrLevel} • {word.theme || 'General'}
            </span>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-tight transition-colors">
              {word.englishWord}
            </h2>
            <p className="text-lg font-medium text-primary italic transition-colors">
              {word.portugueseTranslation}
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={playAudio}
              className={cn(
                "w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                isPlaying ? "bg-primary text-white animate-pulse shadow-primary/30 shadow-lg" : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <Volume2 size={24} />
              {isPlaying ? 'Ouvindo...' : 'Ouvir Pronúncia'}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onComplete) onComplete(word.id, 'mastered');
              }}
              className="w-full h-14 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
            >
              <CheckCircle2 size={24} />
              Memorizar e Avançar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
