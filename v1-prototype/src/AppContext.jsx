import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

const initialChunks = [
  { id: 1, english: "By the way, I was thinking...", translation: "A propósito, eu estava pensando...", tag: "CASUAL", level: "A2", favorite: false, completed: true },
  { id: 2, english: "I'll look into it right away.", translation: "Vou verificar isso agora mesmo.", tag: "TRABALHO", level: "B1", favorite: true, completed: false },
  { id: 3, english: "It's up to you, really.", translation: "Você que decide, de verdade.", tag: "DIÁRIO", level: "A1", favorite: false, completed: true },
  { id: 4, english: "Keep me posted on the results.", translation: "Mantenha-me informado sobre os resultados.", tag: "OFFICE", level: "B2", favorite: false, completed: false },
  { id: 5, english: "To make a long story short...", translation: "Para encurtar a história...", tag: "NARRATIVA", level: "C1", favorite: false, completed: false },
  { id: 6, english: "I'm tied up at the moment.", translation: "Estou ocupado no momento.", tag: "EXPRESSÃO", level: "B2", favorite: false, completed: true },
  { id: 7, english: "Let's call it a day.", translation: "Por hoje é só.", tag: "TRABALHO", level: "B1", favorite: false, completed: false },
  { id: 8, english: "It totally slipped my mind.", translation: "Esqueci completamente.", tag: "CASUAL", level: "A2", favorite: true, completed: false },
  { id: 9, english: "I couldn't agree more.", translation: "Não poderia concordar mais.", tag: "DIÁRIO", level: "B1", favorite: false, completed: true },
  { id: 10, english: "That makes sense.", translation: "Faz sentido.", tag: "CASUAL", level: "A1", favorite: false, completed: false },
  { id: 11, english: "Let's touch base next week.", translation: "Vamos nos falar semana que vem.", tag: "OFFICE", level: "B2", favorite: true, completed: false },
  { id: 12, english: "I'm looking forward to it.", translation: "Estou ansioso por isso.", tag: "DIÁRIO", level: "A2", favorite: false, completed: false },
  { id: 13, english: "Can you give me a hand?", translation: "Pode me dar uma ajuda?", tag: "CASUAL", level: "A1", favorite: false, completed: false },
  { id: 14, english: "I'll get back to you.", translation: "Eu te retorno.", tag: "TRABALHO", level: "A2", favorite: false, completed: false },
  { id: 15, english: "As far as I know...", translation: "Até onde eu sei...", tag: "EXPRESSÃO", level: "B1", favorite: true, completed: false },
  { id: 16, english: "It goes without saying...", translation: "Nem é preciso dizer...", tag: "NARRATIVA", level: "C1", favorite: false, completed: false },
  { id: 17, english: "Let's grab a bite.", translation: "Vamos comer algo.", tag: "DIÁRIO", level: "A1", favorite: false, completed: false },
  { id: 18, english: "I'm swamped right now.", translation: "Estou atolado de trabalho agora.", tag: "OFFICE", level: "B2", favorite: false, completed: false },
  { id: 19, english: "Don't beat around the bush.", translation: "Não faça rodeios.", tag: "EXPRESSÃO", level: "C1", favorite: false, completed: false },
  { id: 20, english: "So far, so good.", translation: "Até agora, tudo bem.", tag: "CASUAL", level: "A1", favorite: false, completed: false },
];

export const AppProvider = ({ children }) => {
  const [chunks, setChunks] = useState(initialChunks);
  const [userStats, setUserStats] = useState({
    xp: 1240,
    streaks: 15,
    lessonsCompleted: 15,
    mastery: { A1: 100, A2: 85, B1: 42, B2: 12, C1: 0 }
  });

  const [userProfile, setUserProfile] = useState({
    name: 'Paulo Ricardo',
    email: 'paulo@flowlish.app',
    level: 'B2',
    goal: 'Regular', // Casual, Regular, Intense
    dailyGoalMinutes: 15
  });

  const updateProfile = (newData) => {
    setUserProfile(prev => ({ ...prev, ...newData }));
  };

  const [recommendations, setRecommendations] = useState([
    { id: 'pronunciation', type: 'Pronúncia', subtitle: "Aperfeiçoe o som dos 'TH' mudos.", duration: 15, xp: 50, status: 'Disponível', icon: 'mic', color: '#10b981', bg: '#ecfdf5' },
    { id: 'writing', type: 'Escrita', subtitle: "Redação de e-mails formais.", duration: 20, xp: 80, status: 'Disponível', icon: 'edit', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'translation', type: 'Tradução', subtitle: "Contextualize frases complexas.", duration: 10, xp: 40, status: 'Disponível', icon: 'type', color: '#f97316', bg: '#fff7ed' },
    { id: 'quiz', type: 'Rápido (Quiz)', subtitle: "Teste seus reflexos linguísticos.", duration: 5, xp: 30, status: 'Disponível', icon: 'zap', color: '#8b5cf6', bg: '#f5f3ff' },
  ]);

  const completeActivity = (id, xpReward) => {
    setRecommendations(recs => recs.map(r => r.id === id ? { ...r, status: 'Concluído' } : r));
    addXP(xpReward);
  };
  
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const toggleFavorite = (id) => {
    setChunks(chunks.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  };
  
  const markAsCompleted = (id) => {
    setChunks(chunks.map(c => c.id === id ? { ...c, completed: true } : c));
  };

  const addXP = (amount) => {
    setUserStats(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  const handleUpgrade = () => {
    const stripePaymentLink = 'https://buy.stripe.com/test_aFa00j3Acgl4aAI1qc8Zq00';
    const width = 500;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      stripePaymentLink, 
      'FlowlishCheckout', 
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=yes`
    );
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      
      // Procura por vozes nativas de alta qualidade (Samantha/Aaron/Google no Mac/Chrome)
      const premiumVoice = englishVoices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Google US English') ||
        v.name.includes('Alex') ||
        v.name.includes('Daniel') ||
        v.name.includes('Karen') ||
        v.name.includes('Ava') ||
        v.name.includes('Tom')
      );

      if (premiumVoice) {
        utterance.voice = premiumVoice;
      } else if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0]; // Fallback to any English voice
      }

      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Velocidade ligeiramente reduzida para aprendizado educacional
      utterance.pitch = 1.0; 

      window.speechSynthesis.speak(utterance);
    } else {
      console.log("TTS not supported.");
    }
  };

  return (
    <AppContext.Provider value={{
      chunks,
      toggleFavorite,
      userStats,
      addXP,
      playAudio,
      markAsCompleted,
      recommendations,
      completeActivity,
      userProfile,
      updateProfile,
      handleUpgrade
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
