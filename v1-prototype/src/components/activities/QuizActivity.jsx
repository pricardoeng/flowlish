import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowLeft } from 'lucide-react';
import './Activities.css';

const QuizActivity = ({ onComplete, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const questions = [
    { 
      prompt: "Qual é o chunk correto para 'Estou atolado'?",
      options: ["I'm tied up at the moment", "I'm looking for new job", "So far so good"],
      correctIndex: 0
    },
    { 
      prompt: "O que significa 'It slipped my mind'?",
      options: ["Eu escorreguei sem querer", "Eu esqueci completamente", "Mindful meditation"],
      correctIndex: 1
    }
  ];

  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(-1); // Timeout
      return;
    }
    
    if (!feedback && !isFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, feedback, isFinished]);

  const handleAnswer = (index) => {
    if (feedback) return;

    if (index === questions[questionIndex].correctIndex) {
      setFeedback('correct');
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
      setTimeLeft(5);
      setFeedback(null);
    } else {
      setIsFinished(true);
      setTimeout(() => onComplete(), 1500);
    }
  };

  return (
    <div className="activity-container animate-fade-in">
      <button className="btn-back" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
      <div className="activity-header">
        <Zap size={32} color="#8b5cf6" />
        <h2>Quiz Rápido de Reflexo</h2>
        <p>Responda antes que o tempo acabe!</p>
      </div>

      <div className="quiz-card">
        {!isFinished ? (
          <>
            <div className="timer-bar-container">
               <div className="timer-bar" style={{ width: `${(timeLeft / 5) * 100}%`, backgroundColor: timeLeft <= 2 ? 'var(--error)' : 'var(--primary)' }}></div>
            </div>
            <div className="timer-text">
              <Clock size={16} /> 00:0{timeLeft}
            </div>

            <h3 className="quiz-prompt">{questions[questionIndex].prompt}</h3>

            <div className="quiz-options">
              {questions[questionIndex].options.map((option, idx) => (
                <button 
                  key={idx} 
                  className={`quiz-btn ${feedback === 'correct' && idx === questions[questionIndex].correctIndex ? 'correct' : ''} ${feedback === 'incorrect' && idx !== questions[questionIndex].correctIndex ? 'incorrect' : ''}`}
                  onClick={() => handleAnswer(idx)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {feedback === 'incorrect' && <div className="feedback-box error mt-4">Incorreto ou o tempo acabou!</div>}
            {feedback === 'correct' && <div className="feedback-box success mt-4">Rápido e Preciso!</div>}
          </>
        ) : (
          <div className="feedback-box success mt-4">
            <h2>Quiz Finalizado!</h2>
            <p>Você possui ótimos reflexos de chunking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizActivity;
