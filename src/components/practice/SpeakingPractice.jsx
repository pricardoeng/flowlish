"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, X, Volume2, MicOff, Activity, CheckCircle2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markChunkAsMastered, claimActivityReward } from '@/actions/learning';

export default function SpeakingPractice({ initialDeck = [], userId }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Completed State
  if (currentIndex >= initialDeck.length) {
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md p-10 bg-zinc-900 border border-zinc-800 rounded-[3rem] text-center space-y-8 shadow-2xl animate-fade-in text-white">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-4xl">
            🏆
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tight">Voz de Ouro!</h2>
            <p className="text-zinc-400 font-medium pb-4">
              Você praticou a pronúncia de {initialDeck.length} chunks com sucesso.
            </p>
          </div>
          <button 
            onClick={() => router.push('/practice')} 
            className="w-full py-4 rounded-full bg-blue-500 text-white font-black hover:bg-blue-600 transition-colors shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            VOLTAR AO HUB
          </button>
        </div>
      </div>
    );
  }

  const currentChunk = initialDeck[currentIndex];

  const playAudio = (text) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium')) && v.lang.startsWith('en'));
    if (best) utt.voice = best;
    utt.onend = () => setIsPlayingAudio(false);
    utt.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utt);
  };

  const startRecording = () => {
    if (isRecording) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Recomenda-se o uso do Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setWasCorrect(null);
      setFeedback(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      const normalize = s => s
        .trim().toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
      
      const original = normalize(currentChunk.englishText);
      const spoken = normalize(transcript);

      const originalWords = original.split(' ');
      const spokenWords = spoken.split(' ');
      
      let matches = 0;
      originalWords.forEach(word => {
        if (spokenWords.includes(word)) matches++;
      });

      const ratio = matches / originalWords.length;

      if (ratio >= 0.8) {
        setWasCorrect(true);
        setFeedback('success');
      } else {
        setWasCorrect(false);
        setFeedback('error');
        setTimeout(() => setFeedback(null), 4000);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setFeedback('error');
      setTimeout(() => setFeedback(null), 4000);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleNext = async () => {
    await markChunkAsMastered(null, currentChunk.id).catch(console.error);

    const xpPerChunk = Math.round(120 / initialDeck.length);
    await claimActivityReward(null, xpPerChunk, 'Praticar').catch(console.error);

    setWasCorrect(null);
    setFeedback(null);
    setShowHint(false);
    setIsRecording(false);
    
    if (currentIndex < initialDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (!isFinishing) {
         setIsFinishing(true);
         setCurrentIndex(initialDeck.length);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4 z-50 overflow-hidden font-sans">
      <div className="w-full max-w-[460px] bg-[#1c1c1f] rounded-[2.5rem] shadow-2xl border border-white/5 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-blue-500" strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                PRATICAR FALA
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 ml-2">
              {initialDeck.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentIndex ? "w-5 bg-blue-500" : 
                    idx < currentIndex ? "w-1.5 bg-blue-500/40" : "w-1.5 bg-zinc-700"
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
        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center transition-colors duration-500",
              isRecording ? "bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "bg-blue-500/10 text-blue-500"
            )}>
              {isRecording ? <Activity size={40} className="animate-pulse" /> : <Mic size={40} />}
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
            )}
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ouça e repita:</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center leading-tight tracking-tight mb-4 px-2">
            "{currentChunk.englishText}"
          </h2>

          <button
            onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 hover:text-blue-500 transition-colors mb-6"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-[10px] font-black">?</span>
            {showHint ? <span className="text-amber-500">{currentChunk.portugueseTranslation}</span> : 'Ver tradução'}
          </button>

          <div className="w-full space-y-4">
            <button
              onClick={() => playAudio(currentChunk.englishText)}
              className="w-full h-14 rounded-2xl bg-[#2a2a2d] hover:bg-[#303033] border border-white/5 text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 size={20} className={isPlayingAudio ? 'text-blue-500 animate-pulse' : 'text-zinc-400'} />
              {isPlayingAudio ? 'Tocando...' : 'Ouvir Pronúncia'}
            </button>

            {!wasCorrect ? (
              <button
                onClick={startRecording}
                disabled={isRecording}
                className={cn(
                  "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg",
                  isRecording 
                    ? "bg-red-500 text-white" 
                    : "bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:scale-[1.02] active:scale-95"
                )}
              >
                {isRecording ? (
                  <> <MicOff size={24} /> Gravando... </>
                ) : (
                  <> <Mic size={24} /> Pressionar para falar </>
                )}
              </button>
            ) : (
              <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                <button
                  onClick={handleNext}
                  className="w-full h-16 rounded-2xl bg-emerald-500 text-white font-black text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95"
                >
                  <CheckCircle2 size={24} /> 
                  Correto! Avançar (XP)
                </button>
              </div>
            )}
          </div>

          {feedback === 'error' && (
            <p className="mt-4 text-red-400 font-bold text-sm animate-bounce text-center">
              ✗ Pronúncia não reconhecida. Fale mais claro.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
