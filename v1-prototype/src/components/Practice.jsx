import React, { useState } from 'react';
import './Practice.css';
import { Play, ArrowRight, Mic, Edit3, Type, Zap, Star, Trophy, CheckCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import PronunciationActivity from './activities/PronunciationActivity';
import WritingActivity from './activities/WritingActivity';
import TranslationActivity from './activities/TranslationActivity';
import QuizActivity from './activities/QuizActivity';

const Practice = ({ onFinish }) => {
  const { userStats, toggleFavorite, chunks, recommendations, completeActivity } = useAppContext();
  const [currentActivity, setCurrentActivity] = useState(null);

  const handleComplete = (id, xp) => {
    completeActivity(id, xp);
    setCurrentActivity(null);
  };

  const getIcon = (iconStr, color) => {
    if (iconStr === 'mic') return <Mic size={24} color={color} />;
    if (iconStr === 'edit') return <Edit3 size={24} color={color} />;
    if (iconStr === 'type') return <Type size={24} color={color} />;
    if (iconStr === 'zap') return <Zap size={24} color={color} />;
  };

  const renderActivity = () => {
    switch(currentActivity) {
      case 'pronunciation': return <PronunciationActivity onComplete={() => handleComplete('pronunciation', 50)} onBack={() => setCurrentActivity(null)} />;
      case 'writing': return <WritingActivity onComplete={() => handleComplete('writing', 80)} onBack={() => setCurrentActivity(null)} />;
      case 'translation': return <TranslationActivity onComplete={() => handleComplete('translation', 40)} onBack={() => setCurrentActivity(null)} />;
      case 'quiz': return <QuizActivity onComplete={() => handleComplete('quiz', 30)} onBack={() => setCurrentActivity(null)} />;
      default: return null;
    }
  };

  if (currentActivity) return renderActivity();

  return (
    <div className="practice-container animate-fade-in">
      <header className="practice-header">
        <div className="header-stats">
          <div className="stat-pill"><TrophyIcon /> <span>XP: {userStats.xp}</span></div>
          <div className="stat-pill"><ZapIcon /> <span>Streaks: {userStats.streaks}</span></div>
        </div>
      </header>

      <div className="practice-hero-grid">
        <section className="banner-continue">
          <div className="banner-bg-shape"></div>
          <div className="banner-content">
            <span className="badge-light">CONTINUAR APRENDENDO</span>
            <h1 className="hero-title">Pronto para mais um chunk?</h1>
            <p className="hero-desc">Você está no caminho certo para a fluência. Hoje focaremos em expressões idiomáticas avançadas.</p>
            <div className="banner-action-row">
              <div className="course-progress">
                <div className="cp-header"><span>Business English</span><span className="cp-val">68%</span></div>
                <div className="cp-track"><div className="cp-fill"></div></div>
              </div>
              <button className="btn btn-primary" onClick={onFinish}>Concluir Prática</button>
            </div>
          </div>
        </section>

        <section className="highlight-card">
          <div className="highlight-header">
            <span className="highlight-label">DESTAQUE DA SEMANA</span>
            <Star size={16} className="text-primary" fill="currentColor" />
          </div>
          <h2 className="highlight-chunk">"It's up to you"</h2>
          <span className="highlight-tag">Você quem decide</span>
          <div className="highlight-example"><i>"Where should we eat lunch?" — "I don't mind, it's up to you."</i></div>
          <button className="btn-link">Adicionar aos favoritos <ArrowRight size={16} /></button>
        </section>
      </div>

      <div className="practice-lower-grid">
        <div className="recommended-section">
          <h2 className="section-title">Recomendado para você</h2>
          <div className="rec-grid">
            {recommendations.map(rec => (
              <RecCard 
                key={rec.id}
                icon={getIcon(rec.icon, rec.color)}
                title={rec.type}
                desc={rec.subtitle}
                meta={`${rec.duration} min • +${rec.xp} XP`}
                bg={rec.bg}
                status={rec.status}
                onClick={() => { if(rec.status !== 'Concluído') setCurrentActivity(rec.id) }}
              />
            ))}
          </div>
        </div>

        <div className="activity-sidebar">
          <h3 className="sidebar-title">ATIVIDADE SEMANAL</h3>
          <div className="circular-progress-wrap">
            <svg viewBox="0 0 100 100" className="donut-chart">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50" transform="rotate(-90 50 50)" />
            </svg>
            <div className="donut-inner"><h2 className="donut-val">15</h2><span className="donut-label">DIAS</span></div>
          </div>
          <div className="week-timeline">
            {['S', 'T', 'Q', 'Q', 'S'].map((day, i) => (
              <div key={i} className={`timeline-day ${i < 4 ? 'done' : i === 4 ? 'active' : ''}`}>
                <span className="t-label">{day}</span>
                <div className="t-circle">{i < 4 ? '✔' : <Zap size={10} color="white" fill="white" />}</div>
              </div>
            ))}
          </div>
          <div className="activity-stats">
            <div className="stat-col"><span className="stat-lbl">TOTAL XP</span><span className="stat-val">{userStats.xp}</span></div>
            <div className="stat-col"><span className="stat-lbl">RANKING</span><span className="stat-val text-primary">#4</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecCard = ({ icon, title, desc, meta, bg, status, onClick }) => (
  <div className={`rec-card ${status === 'Concluído' ? 'completed' : ''}`} onClick={onClick} style={{ cursor: status === 'Concluído' ? 'default' : 'pointer' }}>
    <div className="rec-icon" style={{ backgroundColor: bg }}>
      {status === 'Concluído' ? <CheckCircle size={24} color="var(--success)" /> : icon}
    </div>
    <div className="rec-content">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h4>{title}</h4>
        {status === 'Concluído' && <span style={{fontSize:'0.75rem', color:'var(--success)', fontWeight:'bold'}}>CONCLUÍDO</span>}
      </div>
      <p>{desc}</p>
      <span className="rec-meta">{meta}</span>
    </div>
  </div>
);

const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M8 21h8m-4-4v4m3-18H9a6 6 0 00-6 6v2a6 6 0 006 6h6a6 6 0 006-6V8a6 6 0 00-6-6z"/></svg>
);

export default Practice;
