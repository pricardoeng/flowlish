import React, { useState } from 'react';
import { Type, ArrowLeft, CheckCircle, RefreshCcw } from 'lucide-react';
import './Activities.css';

const TranslationActivity = ({ onComplete, onBack }) => {
  const [words, setWords] = useState([
    { id: 1, text: "to", selected: false },
    { id: 2, text: "story", selected: false },
    { id: 3, text: "short", selected: false },
    { id: 4, text: "long", selected: false },
    { id: 5, text: "a", selected: false },
    { id: 6, text: "make", selected: false },
  ]);
  
  const [answerQueue, setAnswerQueue] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);

  const expectedSentence = "to make a long story short".split(" ");

  const handleSelectWord = (word) => {
    setWords(words.map(w => w.id === word.id ? { ...w, selected: true } : w));
    setAnswerQueue([...answerQueue, word]);
  };

  const handleRemoveWord = (word) => {
    setAnswerQueue(answerQueue.filter(w => w.id !== word.id));
    setWords(words.map(w => w.id === word.id ? { ...w, selected: false } : w));
  };

  const handleVerify = () => {
    const userSentence = answerQueue.map(w => w.text).join(" ");
    const expected = expectedSentence.join(" ");

    if (userSentence === expected) {
      setIsCorrect(true);
      setTimeout(() => onComplete(), 1500);
    } else {
      setIsCorrect(false);
    }
  };

  const reset = () => {
    setAnswerQueue([]);
    setWords(words.map(w => ({ ...w, selected: false })));
    setIsCorrect(null);
  };

  return (
    <div className="activity-container animate-fade-in">
      <button className="btn-back" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
      <div className="activity-header">
        <Type size={32} color="#f97316" />
        <h2>Tradução (Frases Complexas)</h2>
        <p>Ordene as palavras para traduzir: <b>"Para encurtar a história"</b></p>
      </div>

      <div className="translation-card">
        <div className="answer-dropzone">
          {answerQueue.length === 0 && <span className="placeholder">Selecione as palavras abaixo...</span>}
          {answerQueue.map(word => (
            <div key={word.id} className="word-chip selected" onClick={() => handleRemoveWord(word)}>
              {word.text}
            </div>
          ))}
        </div>

        <div className="word-bank">
          {words.map(word => !word.selected && (
            <div key={word.id} className="word-chip available" onClick={() => handleSelectWord(word)}>
              {word.text}
            </div>
          ))}
        </div>

        {isCorrect !== null && (
          <div className={`feedback-box mt-4 ${isCorrect ? 'success' : 'error'}`}>
            {isCorrect ? "Tradução Perfeita!" : "A ordem está incorreta. Tente novamente!"}
          </div>
        )}

        <div className="action-row mt-4">
          <button className="btn btn-secondary" onClick={reset}><RefreshCcw size={18} /> Resetar</button>
          <button className="btn btn-primary" onClick={handleVerify} disabled={answerQueue.length === 0}>
            Verificar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationActivity;
