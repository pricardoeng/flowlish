"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Volume2, Check, ArrowLeft, RotateCcw, 
  CheckCircle2, Sparkles, Send, Brain
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { markChunkAsMastered, claimActivityReward } from '@/actions/learning';

export default function WritingPractice({ initialChunks = [] }) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const inputRef = useRef(null);

  const current = initialChunks[currentIdx];
  const progress = ((currentIdx + 1) / initialChunks.length) * 100;

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

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const cleanInput = inputValue.trim().toLowerCase().replace(/[.,!?;]/g, '');
    const cleanTarget = current.englishText.toLowerCase().replace(/[.,!?;]/g, '');

    if (cleanInput === cleanTarget) {
      setFeedback('correct');
      speak(current.englishText);
      await markChunkAsMastered(null, current.id).catch(console.error);
      
      setTimeout(() => {
        if (currentIdx < initialChunks.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setInputValue('');
          setFeedback(null);
          setShowAnswer(false);
        } else {
          handleFinish();
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    await claimActivityReward(null, 80, 'Escrita').catch(console.error);
    router.push('/practice');
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentIdx]);

  if (!current) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col p-6 animate-fade-in transition-colors">
      {/* Header HUD */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between mb-12">
        <button onClick={() => router.push('/practice')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center flex-1">
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
             Escrita • {currentIdx + 1} de {initialChunks.length}
           </div>
           <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
           </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-12">
        <div className="space-y-6 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest">
             <Brain size={14} /> Traduza para o Inglês
           </div>
           <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
             {current.portugueseTranslation}
           </h2>
        </div>

        {/* Input Area */}
        <div className="w-full space-y-6">
           <form onSubmit={handleCheck} className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type the answer here..."
                disabled={feedback === 'correct'}
                className={cn(
                  "w-full bg-zinc-800 border-3 text-2xl p-8 rounded-[2rem] outline-none transition-all",
                  feedback === 'correct' ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : 
                  feedback === 'wrong' ? "border-red-500 animate-shake" : "border-zinc-700 focus:border-purple-500"
                )}
              />
              <button 
                type="submit" 
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-purple-600 text-white hover:bg-purple-500 transition-all active:scale-95 shadow-xl"
              >
                <Send size={24} />
              </button>
           </form>

           {/* Feedback & Helpers */}
           <div className="flex items-center justify-between px-4">
              <button 
                onClick={() => setShowAnswer(!showAnswer)}
                className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                disabled={feedback === 'correct'}
              >
                {showAnswer ? 'Ocultar Dica' : 'Preciso de Ajuda'}
              </button>
              
              <div className="flex items-center gap-4">
                 <button onClick={() => speak(current.englishText)} className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                    <Volume2 size={20} />
                 </button>
                 <button onClick={() => setInputValue('')} className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                    <RotateCcw size={20} />
                 </button>
              </div>
           </div>

           {/* Hint Area */}
           {showAnswer && (
             <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Resposta Correta:</p>
                <p className="text-2xl font-black text-white italic">{current.englishText}</p>
             </div>
           )}
        </div>
      </main>

      {/* Success Modal Overlay (Simplified) */}
      {feedback === 'correct' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
           <div className="bg-emerald-500 text-white p-6 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-in zoom-in duration-300">
              <Check size={48} strokeWidth={4} />
           </div>
        </div>
      )}

      <style jsx global>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
