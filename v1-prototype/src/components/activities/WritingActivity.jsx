import React, { useState } from 'react';
import { Edit3, CheckCircle, ArrowLeft } from 'lucide-react';
import './Activities.css';

const WritingActivity = ({ onComplete, onBack }) => {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState([]);

  const requiredKeywords = ['sincerely', 'dear', 'i am writing'];

  const handleVerify = () => {
    const lowerText = text.toLowerCase();
    const found = requiredKeywords.filter(kw => lowerText.includes(kw));
    
    if (found.length === requiredKeywords.length) {
      setFeedback(['Perfeito! Você utilizou as expressões formais necessárias.']);
      setTimeout(() => onComplete(), 1500);
    } else {
      const missing = requiredKeywords.filter(kw => !lowerText.includes(kw));
      setFeedback([`Faltam algumas expressões chave: ${missing.map(m => `"${m}"`).join(', ')}`]);
    }
  };

  return (
    <div className="activity-container animate-fade-in">
      <button className="btn-back" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
      <div className="activity-header">
        <Edit3 size={32} color="#3b82f6" />
        <h2>Escrita Formal</h2>
        <p>Redija um e-mail formal utilizando as expressões: "Dear", "I am writing", "Sincerely".</p>
      </div>

      <div className="writing-card">
        <textarea 
          className="email-editor"
          placeholder="Comece a digitar seu e-mail aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
        />
        
        {feedback.length > 0 && (
          <div className={`feedback-box ${feedback[0].includes('Perfeito') ? 'success' : 'error'}`}>
            {feedback[0]}
          </div>
        )}

        <button className="btn btn-primary mt-4" onClick={handleVerify}>
          Verificar Texto
        </button>
      </div>
    </div>
  );
};

export default WritingActivity;
