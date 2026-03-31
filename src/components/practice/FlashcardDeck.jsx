"use client"
import React, { useState } from 'react';
import MemoryCard from './MemoryCard';
import { markWordAsMastered } from '@/actions/learning';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function FlashcardDeck({ initialDeck, userId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  
  const handleCardComplete = async (wordId, status) => {
    // Save progress to DB in background
    markWordAsMastered(userId, wordId).catch(console.error);
    
    // Move to next card
    if (currentIndex < initialDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished deck
      setCurrentIndex(initialDeck.length);
    }
  };

  const currentWord = initialDeck[currentIndex];

  if (currentIndex >= initialDeck.length) {
    return (
      <div className="w-full max-w-md mx-auto p-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-center space-y-8 shadow-premium animate-fade-in transition-colors">
        <div className="relative h-40 w-40 mx-auto transition-transform hover:scale-110">
          <img 
            src="/images/mascot.png" 
            alt="Mango Mascot" 
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Sessão Concluída!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium pb-4">
            Incrível! Você memorizou <span className="text-primary font-bold">{initialDeck.length} cartas</span> novas pro seu deck.
          </p>
        </div>
        <Button onClick={() => router.push('/practice')} variant="primary" className="w-full">
          Voltar para Prática
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Progress tracking */}
      <div className="flex justify-between w-full max-w-sm mb-6 px-4">
        <span className="text-zinc-500 dark:text-zinc-400 font-bold tracking-widest text-xs uppercase transition-colors">
          Carta {currentIndex + 1} de {initialDeck.length}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase transition-colors">
          Nível: {currentWord.cefrLevel}
        </span>
      </div>

      <MemoryCard 
        key={currentWord.id} // key ensures reset of internal flip state when advancing
        word={currentWord} 
        onComplete={(id) => handleCardComplete(id, 'mastered')}
      />
    </div>
  );
}
