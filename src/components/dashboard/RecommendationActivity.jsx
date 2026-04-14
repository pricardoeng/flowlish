"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic, Edit3, Languages, HelpCircle, Award, Timer, Volume2, CheckCircle2, Layers, RotateCcw, MicOff, Activity } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { claimActivityReward, markChunkAsMastered } from '@/actions/learning';

const ACTIVITY_LABELS = {
  'Flashcards': 'Flashcards',
  'Praticar': 'Praticar',
  'Escrita': 'Escrita',
  'Rápido': 'Quiz',
};

const ACTIVITY_ICONS = {
  'Flashcards': Layers,
  'Praticar': Mic,
  'Escrita': Edit3,
  'Rápido': HelpCircle,
};

const QUIZ_DURATION = 10;

const RecommendationActivity = ({ activity, onClose, userId }) => {
  const router = useRouter();
  const [stage, setStage] = useState('intro'); // intro | active | success
  const [input, setInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // null | 'loading' | 'success' | 'error'
  const [selectedWrong, setSelectedWrong] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [timedOut, setTimedOut] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(null); // null | true | false
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const chunks = activity.chunks || [activity.chunk || { englishText: 'Sample phrase', portugueseTranslation: 'Frase de exemplo', id: 'sample' }];
  const chunk = chunks[currentIndex];

  // Whether this activity type should hide the answer (english text) from the header
  const hidesAnswer = activity.tipo === 'Escrita';

  // Build quiz options once, stable across renders
  const quizOptions = useMemo(() => {
    const correct = { label: chunk.portugueseTranslation, correct: true };
    // Use other chunks from the session as distractors if available
    const otherChunks = chunks.filter(c => c.id !== chunk.id);
    const distractors = otherChunks.length > 0 
      ? otherChunks.map(c => c.portugueseTranslation)
      : (activity.distractors || []);
    
    const wrong = distractors.slice(0, 3).map(d => ({ label: d, correct: false }));
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  }, [chunk.id, chunk.portugueseTranslation, activity.distractors, chunks]);

  // Prepare Sentence Builder words
  useEffect(() => {
    if (activity.tipo === 'Escrita' && stage === 'active') {
      const words = chunk.englishText
        .split(' ')
        .map((w, i) => ({ id: i, text: w }));
      
      // Shuffle words
      setAvailableWords([...words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
  }, [activity.tipo, stage, chunk.id, chunk.englishText]);

  // Quiz countdown timer
  useEffect(() => {
    if (stage !== 'active' || activity.tipo !== 'Rápido' || timedOut) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [stage, timeLeft, activity.tipo, timedOut]);

  const playAudio = (text) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en'));
    if (best) utt.voice = best;
    utt.onend = () => setIsPlayingAudio(false);
    utt.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utt);
  };

  const handleNext = () => {
    if (currentIndex < chunks.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset local chunk state
      setFeedback(null);
      setIsFlipped(false);
      setShowHint(false);
      setWasCorrect(null);
      setSelectedWords([]);
      setAvailableWords([]);
      setTimeLeft(QUIZ_DURATION);
      setTimedOut(false);
      setSelectedWrong(null);
    } else {
      setStage('success');
    }
  };

  // Track per-activity-type completion in localStorage (avoids shared counter bug)
  const trackActivityProgress = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const key = `mango:activity:${userId}:${activity.tipo}:${today}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(current + 1));
  };

  const handleComplete = async () => {
    await markChunkAsMastered(userId, chunk.id);
    trackActivityProgress();
    handleNext();
  };

  const handleClaimFinal = async () => {
    await claimActivityReward(userId, activity.recompensa_xp, activity.tipo);
  };

  // Trigger final reward when success stage is reached
  useEffect(() => {
    if (stage === 'success') {
      handleClaimFinal();
    }
  }, [stage]);

  const startRecording = () => {
    if (isRecording) return;
    
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setWasCorrect(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      const normalize = s => s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove all non-alphanumeric except spaces
        .replace(/\s+/g, ' ');       // Collapse multiple spaces
      
      const original = normalize(chunk.englishText);
      const spoken = normalize(transcript);

      // Word-based comparison (80% threshold)
      const originalWords = original.split(' ');
      const spokenWords = spoken.split(' ');
      
      let matches = 0;
      originalWords.forEach(word => {
        if (spokenWords.includes(word)) matches++;
      });

      const ratio = matches / originalWords.length;
      
      console.log('Original:', original, 'Spoken:', spoken, 'Ratio:', ratio);

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
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const Icon = ACTIVITY_ICONS[activity.tipo] || HelpCircle;
  const label = ACTIVITY_LABELS[activity.tipo] || activity.tipo;

  const renderHeader = () => (
    <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-zinc-50 dark:border-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p>
            <div className="flex gap-1 items-center ml-1">
              {chunks.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 w-2.5 rounded-full transition-all duration-500",
                    i === currentIndex ? "bg-primary w-5" : i < currentIndex ? "bg-primary/40" : "bg-zinc-200 dark:bg-zinc-800"
                  )} 
                />
              ))}
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                {currentIndex + 1}/{chunks.length}
              </span>
            </div>
          </div>
          {hidesAnswer ? (
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">Desafio de {label}</h2>
          ) : (
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1">{chunk.englishText}</h2>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-2 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
      >
        <X size={22} />
      </button>
    </div>
  );

  // ── Success screen ───────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white dark:bg-zinc-900 p-10 shadow-2xl text-center space-y-6 animate-scale-in transition-colors">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl">
            🏆
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Sessão Concluída!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Você completou {chunks.length} chunks e ganhou{' '}
              <span className="text-primary font-black">+{Math.round(activity.recompensa_xp)} XP</span>
            </p>
          </div>
          <Button 
            size="lg" 
            className="w-full" 
            onClick={() => {
              router.refresh();
              onClose();
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // ── Module renderers ─────────────────────────────────────────────────────────
  const renderPronuncia = () => (
    <div className="space-y-6 py-4 text-center">
      <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
        {isRecording ? <Activity size={40} className="animate-pulse" /> : <Mic size={40} />}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Ouça e repita:</p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">"{chunk.englishText}"</h3>
        <button
          onClick={() => setShowHint(h => !h)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-black">?</span>
          {showHint ? chunk.portugueseTranslation : 'Ver tradução'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Play Audio Button */}
        <button
          onClick={() => playAudio(chunk.englishText)}
          className="w-full h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <Volume2 size={20} className={isPlayingAudio ? 'animate-pulse' : ''} />
          {isPlayingAudio ? 'Tocando...' : 'Ouvir Pronúncia'}
        </button>

        {/* Record Speech Button */}
        <button
          onClick={startRecording}
          disabled={isRecording || wasCorrect === true}
          className={cn(
            "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg",
            isRecording 
              ? "bg-red-500 text-white animate-pulse" 
              : wasCorrect === true 
                ? "bg-emerald-500 text-white" 
                : "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95"
          )}
        >
          {isRecording ? (
            <> <MicOff size={24} /> Gravando... </>
          ) : wasCorrect === true ? (
            <> <CheckCircle2 size={24} /> Pronúncia Correta! </>
          ) : (
            <> <Mic size={24} /> Pressionar para falar </>
          )}
        </button>
      </div>

      {feedback === 'error' && (
        <p className="text-red-500 font-bold text-sm animate-bounce">
          ✗ Pronúncia não identificada. Tente falar mais claro.
        </p>
      )}

      {wasCorrect === true && (
        <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Você já memorizou este chunk?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Ainda não
            </button>
            <button
              onClick={async () => {
                await markChunkAsMastered(userId, chunk.id);
                handleComplete();
              }}
              className="px-6 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Já decorei!
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEscrita = () => (
    <div className="space-y-6 py-4">
      <div className="flex flex-col gap-1 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Traduza para inglês:</p>
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">"{chunk.portugueseTranslation}"</p>
      </div>

      {/* Selected Words Area */}
      <div className="min-h-[80px] w-full rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap gap-2 transition-colors bg-white dark:bg-zinc-950/50">
        {selectedWords.length === 0 && (
          <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium italic">Clique nas palavras abaixo para montar a frase...</p>
        )}
        {selectedWords.map((word, idx) => (
          <button
            key={`selected-${word.id}-${idx}`}
            onClick={() => {
              setSelectedWords(prev => prev.filter((_, i) => i !== idx));
              setAvailableWords(prev => [...prev, word]);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-sm hover:scale-95 transition-transform"
          >
            {word.text}
          </button>
        ))}
      </div>

      {/* Available Words Board */}
      <div className="flex flex-wrap gap-2 justify-center py-2">
        {availableWords.map((word) => (
          <button
            key={`avail-${word.id}`}
            onClick={() => {
              setSelectedWords(prev => [...prev, word]);
              setAvailableWords(prev => prev.filter(w => w.id !== word.id));
            }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-sm hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            {word.text}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowHint(h => !h)}
          className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs font-black">?</span>
          {showHint ? 'Esconder dica' : 'Ver dica'}
        </button>

        {selectedWords.length > 0 && (
          <button
            onClick={() => {
              setAvailableWords(chunk.englishText.split(' ').map((w, i) => ({ id: i, text: w })));
              setSelectedWords([]);
            }}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={14} />
            Recomeçar
          </button>
        )}
      </div>

      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 font-medium text-sm">
          💡 Dica: <span className="font-black italic">"{chunk.englishText}"</span>
        </div>
      )}

      {feedback === 'error' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-medium text-sm">
          ✗ Não é bem isso. Tente novamente ou use a dica acima.
        </div>
      )}

      <Button
        className="w-full"
        disabled={selectedWords.length === 0}
        onClick={() => {
          const result = selectedWords.map(w => w.text).join(' ');
          const normalize = s => s.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()'"]/, '');
          if (normalize(result) === normalize(chunk.englishText)) {
            handleComplete();
          } else {
            setFeedback('error');
            setTimeout(() => setFeedback(null), 2000);
          }
        }}
      >
        Verificar Resposta
      </Button>
    </div>
  );

  const renderTraducao = () => (
    <div className="space-y-4 py-4 flex flex-col items-center">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Clique no card para ver a tradução</p>
      <div
        onClick={() => setIsFlipped(f => !f)}
        className="w-full h-48 cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* Front — shows English (the question) */}
          <div className="absolute inset-0 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm flex items-center justify-center p-8 rounded-[2.5rem]" style={{ backfaceVisibility: 'hidden' }}>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white text-center">{chunk.englishText}</h3>
          </div>
          {/* Back — shows Portuguese (the answer, revealed on flip) */}
          <div className="absolute inset-0 bg-primary text-white flex items-center justify-center p-8 rounded-[2.5rem] shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-center space-y-2">
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">Tradução</p>
              <h3 className="text-2xl font-black">{chunk.portugueseTranslation}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Audio button */}
      <button
        onClick={(e) => { e.stopPropagation(); playAudio(chunk.englishText); }}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all',
          isPlayingAudio
            ? 'border-primary bg-primary/10 text-primary animate-pulse cursor-not-allowed'
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-primary hover:text-primary hover:bg-primary/5'
        )}
        disabled={isPlayingAudio}
      >
        <Volume2 size={18} className={isPlayingAudio ? 'animate-pulse' : ''} />
        {isPlayingAudio ? 'Tocando...' : 'Ouvir pronúncia'}
      </button>

      {/* Hint before flipping */}
      {!isFlipped && (
        <button
          onClick={() => setShowHint(h => !h)}
          className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-black">?</span>
          {showHint ? <span className="text-amber-700 dark:text-amber-400">{chunk.portugueseTranslation}</span> : 'Ver dica'}
        </button>
      )}
      {isFlipped && (
        <Button className="w-full" onClick={handleComplete}>Dominei! Ganhar XP</Button>
      )}
    </div>
  );

  const renderQuiz = () => {
    if (timedOut) {
      return (
        <div className="space-y-5 py-4 text-center">
          <div className="text-5xl">⏰</div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Tempo esgotado!</h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">
            A resposta correta era: <span className="font-black text-zinc-900 dark:text-white">"{chunk.portugueseTranslation}"</span>
          </p>
          <Button variant="secondary" className="w-full" onClick={onClose}>Tentar novamente depois</Button>
        </div>
      );
    }

    // Timer color
    const timerColor = timeLeft > 6 ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : timeLeft > 3 ? 'text-orange-600 bg-orange-50 border-orange-100'
      : 'text-red-600 bg-red-50 border-red-100 animate-pulse';

    return (
      <div className="space-y-5 py-4">
        {/* Timer bar */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            Qual o significado de:
            <br /><span className="text-primary font-black text-xl tracking-tight">"{chunk.englishText}"</span>
          </h3>
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-sm tabular-nums', timerColor)}>
            <Timer size={14} />
            {timeLeft}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', timeLeft > 6 ? 'bg-emerald-500' : timeLeft > 3 ? 'bg-orange-500' : 'bg-red-500')}
            style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }}
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {quizOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (opt.correct) {
                  handleComplete();
                } else {
                  setSelectedWrong(i);
                  setTimeout(() => setSelectedWrong(null), 800);
                }
              }}
              className={cn(
                'w-full p-4 rounded-2xl border text-left font-bold transition-all text-zinc-700 dark:text-zinc-200',
                selectedWrong === i
                  ? 'border-red-300 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 scale-95'
                  : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch (activity.tipo) {
      case 'Praticar': return renderPronuncia();
      case 'Escrita': return renderEscrita();
      case 'Flashcards': return renderTraducao();
      case 'Rápido': return renderQuiz();
      default: return <div className="py-8 text-center text-zinc-400">Em breve...</div>;
    }
  };

  // ── Main modal ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in transition-colors">
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-2xl animate-scale-in overflow-hidden transition-colors">
        {/* Header with Progress */}
        {renderHeader()}

        {/* Body */}
        <div className="px-8 pb-8">
          {stage === 'intro' ? (
            <div className="space-y-6 pt-6 text-center">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight uppercase">
                  {activity.tipo === 'Rápido' ? '⚡ Desafio Rápido!' : 'Preparado?'}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {activity.tipo === 'Rápido'
                    ? `Você tem ${QUIZ_DURATION} segundos para responder. Pense rápido!`
                    : `Esta atividade contém ${chunks.length} chunks e reforça seu aprendizado.`}
                </p>
              </div>
              <Button size="lg" className="w-full h-14" onClick={() => setStage('active')}>
                Começar Agora
              </Button>
            </div>
          ) : (
            renderModule()
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationActivity;
