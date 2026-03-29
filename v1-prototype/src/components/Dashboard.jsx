import React from 'react';
import './Dashboard.css';
import { Award, Zap } from 'lucide-react';
import { useAppContext } from '../AppContext';

const Dashboard = () => {
  const { userStats } = useAppContext();

  const handleShare = async () => {
    const shareData = {
      title: 'Conquista: Impulso de Foguete no Flowlish! 🚀',
      text: 'Acabei de completar 15 lições no nível B2 em tempo recorde no Flowlish! Meu vocabulário cresceu 8% nesta semana. Vem aprender inglês por chunks comigo!',
      url: 'https://flowlish.app' // URL fictícia do app
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Compartilhamento cancelado', err);
      }
    } else {
      // Fallback para Desktop (LinkedIn tem link direto, Instagram não possui via URL Web)
      const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
      window.open(linkedinUrl, '_blank', 'width=600,height=600');
      
      // Como o Instagram Web não aceita compartilhamento via URL, alertamos o usuário
      alert('Para compartilhar no Instagram, acesse o Flowlish pelo seu celular para usar o compartilhamento nativo do iOS/Android! Copiamos o texto para a sua área de transferência.');
      navigator.clipboard.writeText(shareData.text);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Progresso</h1>
          <p>Visualize sua jornada rumo à fluência e seus marcos conquistados.</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill"><Zap size={16} className="text-warning" /> <span>{userStats.streaks} Dias de Streak</span></div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Learning Rhythm Redesign */}
        <section className="dashboard-card rhythm-section full-width">
          <div className="rhythm-flex">
            <div className="streak-focus">
              <div className="streak-fire-large">
                <div className="fire-icon">🔥</div>
                <div className="streak-count">
                  <h2>{userStats.streaks}</h2>
                  <span>DIAS DE FOCO</span>
                </div>
              </div>
              <p className="card-subtitle">Você está no seu melhor ritmo! Continue assim.</p>
            </div>

            <div className="weekly-goal-card">
              <div className="goal-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="283" strokeDashoffset="70" />
                </svg>
                <div className="goal-text">
                  <h3>75%</h3>
                  <span>Meta Semanal</span>
                </div>
              </div>
              <div className="weekly-dots">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                  <div key={day} className={`day-dot ${i < 4 ? 'done' : ''}`}>
                    <span className="day-label">{day}</span>
                    <div className="dot"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chunks Dominados */}
        <section className="dashboard-card mastered-section">
          <h3>Chunks Dominados</h3>
          <div className="progress-list">
            <ProgressItem level="A1 • Iniciante" percent={userStats.mastery.A1} />
            <ProgressItem level="A2 • Elementar" percent={userStats.mastery.A2} />
            <ProgressItem level="B1 • Intermediário" percent={userStats.mastery.B1} />
            <ProgressItem level="B2 • Intermediário Superior" percent={userStats.mastery.B2} />
            <ProgressItem level="C1/C2 • Avançado" percent={userStats.mastery.C1} />
          </div>
        </section>

        {/* Achievements */}
        <section className="dashboard-card achievements-section">
          <h3>Medalhas e Conquistas</h3>
          <div className="achievements-list">
            <AchievementCard 
              icon="🌙" 
              title="Madrugador" 
              desc="Estudou antes das 7h por 5 dias seguidos."
              bgColor="#FFF5ED"
            />
            <AchievementCard 
              icon="⚡" 
              title="Foco Total" 
              desc="Concluiu 20 sessões sem erros críticos."
              bgColor="#F0F5FF"
            />
            <AchievementCard 
              icon="🏅" 
              title="Mestre dos Chunks" 
              desc="Dominou mais de 500 expressões úteis."
              bgColor="#E8F5EE"
            />
          </div>
        </section>

        {/* XP Chart - Simplified and themed */}
        <section className="dashboard-card xp-section full-width">
          <div className="card-header">
            <h3>Evolução Semanal</h3>
            <div className="badge-light">XP: {userStats.xp}</div>
          </div>
          <p className="card-subtitle">Seu crescimento de experiência nos últimos dias</p>
          <div className="mock-chart">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="chart-svg">
              <polygon points="0,30 0,25 15,28 30,20 45,22 60,12 80,15 100,5 100,30" fill="url(#gradient-xp)" opacity="0.4" />
              <polyline points="0,25 15,28 30,20 45,22 60,12 80,15 100,5" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
              <defs>
                <linearGradient id="gradient-xp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'var(--primary)', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'var(--primary)', stopOpacity:0}} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* Banner */}
        <section className="dashboard-banner full-width">
          <div className="banner-icon-wrapper">
            <div className="banner-icon">🚀</div>
            <div className="badge-notification">+1</div>
          </div>
          <div className="banner-content">
            <span className="banner-label">NOVA CONQUISTA</span>
            <h2>Impulso de Foguete</h2>
            <p>Você completou 15 lições no nível B2 em tempo recorde. Seu vocabulário cresceu 8% esta semana!</p>
          </div>
          <button className="btn btn-dark">Compartilhar</button>
        </section>
      </div>
    </div>
  );
};

const ProgressItem = ({ level, percent }) => (
  <div className="progress-item">
    <div className="progress-header">
      <span className="progress-label">{level}</span>
      <span className="progress-value">{percent}%</span>
    </div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const AchievementCard = ({ icon, title, desc, bgColor }) => (
  <div className="achievement-card">
    <div className="ach-icon" style={{ backgroundColor: bgColor }}>{icon}</div>
    <div className="ach-text">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

export default Dashboard;
