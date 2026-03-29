import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import './Activities.css';

const PronunciationActivity = ({ onComplete, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(null);
  const [currentWord, setCurrentWord] = useState('thought');
  
  const targetWords = ['think', 'thought', 'through'];

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setScore(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        
        // Simple comparison
        if (result.includes(currentWord) || currentWord.includes(result)) {
          setScore(100);
          setTimeout(() => onComplete(), 1500);
        } else {
          setScore(30); // Failed attempt
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript("Erro no microfone. Tente novamente.");
        setScore(0);
      };
      
      recognition.onend = () => setIsListening(false);
    } else {
      // Simulate listening if API not supported
      setTimeout(() => {
        setTranscript(currentWord);
        setScore(100);
        setIsListening(false);
        setTimeout(() => onComplete(), 1500);
      }, 2000);
    }
  };

  return (
    <div className="activity-container animate-fade-in">
      <button className="btn-back" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
      <div className="activity-header">
        <Mic size={32} color="#10b981" />
        <h2>Treino de Pronúncia</h2>
        <p>Aperfeiçoe o som dos 'TH' mudos na palavra abaixo:</p>
      </div>

      <div className="pronunciation-card">
        <h1 className="target-word">{currentWord}</h1>
        
        <button 
          className={`btn-mic ${isListening ? 'listening' : ''}`}
          onClick={startListening}
          disabled={isListening}
        >
          {isListening ? "Ouvindo..." : "Toque para Falar"}
        </button>

        {transcript && (
          <div className="transcript-box">
            <p className="user-said">Você disse: <b>{transcript}</b></p>
            {score !== null && (
              <div className={`score-badge ${score > 80 ? 'success' : 'error'}`}>
                {score > 80 ? <><CheckCircle size={16} /> Precisão: {score}%</> : <><AlertCircle size={16} /> Tente Novamente</>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationActivity;
