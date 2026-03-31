"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { X, Mic, Edit3, Languages, HelpCircle, Award, Timer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { claimActivityReward } from '@/actions/learning';

const ACTIVITY_LABELS = {
  'Pronúncia': 'Pronúncia',
  'Escrita': 'Escrita',
  'Tradução': 'Tradução',
  'Rápido': 'Quiz',
};

const ACTIVITY_ICONS = {
  'Pronúncia': Mic,
  'Escrita': Edit3,
  'Tradução': Languages,
  'Rápido': HelpCircle,
};

const QUIZ_DURATION = 10;

const RecommendationActivity = ({ activity, onClose, userId }) => {
  const [stage, setStage] = useState('intro'); // intro | active | success
  const [input, setInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // null | 'loading' | 'success' | 'error'
  const [selectedWrong, setSelectedWrong] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [timedOut, setTimedOut] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const chunk = activity.chunk || { englishText: 'Sample phrase', portugueseTranslation: 'Frase de exemplo' };

  // Whether this activity type should hide the answer (english text) from the header
  const hidesAnswer = activity.tipo === 'Escrita';

  // Build quiz options once, stable across renders
  const quizOptions = useMemo(() => {
    const correct = { label: chunk.portugueseTranslation, correct: true };
    const wrong = (activity.distractors || []).map(d => ({ label: d, correct: false }));
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  }, [chunk.portugueseTranslation, activity.distractors]);

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

  const handleComplete = async () => {
    await claimActivityReward(userId, activity.recompensa_xp);
    setStage('success');
  };

  const Icon = ACTIVITY_ICONS[activity.tipo] || HelpCircle;
  const label = ACTIVITY_LABELS[activity.tipo] || activity.tipo;

  // ── Success screen ───────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white dark:bg-zinc-900 p-10 shadow-2xl text-center space-y-6 animate-scale-in transition-colors">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl">
            🏆
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Muito bem!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Você concluiu o desafio e ganhou{' '}
              <span className="text-primary font-black">+{activity.recompensa_xp} XP</span>
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={onClose}>
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
        <Mic size={40} className={cn(isListening && 'animate-pulse')} />
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Ouça e repita:</p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">"{chunk.englishText}"</h3>
        {/* Show translation only as hint */}
        <button
          onClick={() => setShowHint(h => !h)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-black">?</span>
          {showHint ? chunk.portugueseTranslation : 'Ver tradução'}
        </button>
      </div>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (isListening) return;
          setIsListening(true);
          setFeedback(null);
          
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(chunk.englishText);
          utt.lang = 'en-US';
          utt.rate = 0.8;
          
          const voices = window.speechSynthesis.getVoices();
          const best = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en'));
          if (best) utt.voice = best;
          
          utt.onend = () => {
            setIsListening(false);
            setFeedback('success');
            // Auto-complete the recommendation flow in the background
            handleComplete();
          };
          
          window.speechSynthesis.speak(utt);
        }}
        className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-lg active:scale-95 transition-all select-none flex items-center justify-center gap-2"
      >
        {isListening ? (
           <span className="flex items-center gap-2 animate-pulse"><Volume2 size={24} /> Tocando...</span>
        ) : (
           <span className="flex items-center gap-2"><Volume2 size={24} /> Ouvir Pronúncia</span>
        )}
      </button>
      {feedback === 'success' && (
        <div className="space-y-3 mt-4 text-center">
          <p className="text-primary font-black text-lg flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> Concluído!
          </p>
        </div>
      )}
    </div>
  );

  const renderEscrita = () => (
    <div className="space-y-5 py-4">
      <div className="flex flex-col gap-1 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Traduza para inglês:</p>
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">"{chunk.portugueseTranslation}"</p>
      </div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Escreva o chunk em inglês..."
        className="w-full h-28 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 font-medium outline-none focus:border-primary transition-all bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none"
      />

      {/* Hint button */}
      <button
        onClick={() => setShowHint(h => !h)}
        className="flex items-center gap-2 text-sm font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs font-black">?</span>
        {showHint ? 'Esconder dica' : 'Ver dica'}
      </button>
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
        onClick={() => {
          const normalize = s => s.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()'"]/, '');
          if (normalize(input) === normalize(chunk.englishText)) {
            handleComplete();
          } else {
            setFeedback('error');
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
      case 'Pronúncia': return renderPronuncia();
      case 'Escrita': return renderEscrita();
      case 'Tradução': return renderTraducao();
      case 'Rápido': return renderQuiz();
      default: return <div className="py-8 text-center text-zinc-400">Em breve...</div>;
    }
  };

  // ── Main modal ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in transition-colors">
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-2xl animate-scale-in overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-zinc-50 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</p>
              {/* For writing exercises, don't show the English answer in the header */}
              {hidesAnswer ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">Desafio de {label}</h2>
                </div>
              ) : (
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">{chunk.englishText}</h2>
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
                    : `Esta atividade dura cerca de ${activity.duracao} min e reforça seu aprendizado.`}
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
