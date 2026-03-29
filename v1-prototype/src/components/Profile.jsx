import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { User, Mail, Target, Award, Bell, LogOut, Check } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { userProfile, updateProfile, handleUpgrade } = useAppContext();
  const [formData, setFormData] = useState({ ...userProfile });
  const [isSaved, setIsSaved] = useState(false);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const goals = [
    { id: 'Casual', label: 'Casual', desc: '5 min/dia', color: '#10b981' },
    { id: 'Regular', label: 'Regular', desc: '15 min/dia', color: '#3b82f6' },
    { id: 'Intenso', label: 'Intenso', desc: '30+ min/dia', color: '#8b5cf6' }
  ];

  const handleSave = () => {
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="profile-container animate-fade-in">
      <header className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Personalize sua experiência e metas de aprendizado.</p>
      </header>

      {/* Upgrade Banner for Mobile/All */}
      <section className="profile-upgrade-card" onClick={handleUpgrade}>
        <div className="upgrade-info">
          <div className="crown-icon">👑</div>
          <div>
            <h3>Flowlish Pro Vitalício</h3>
            <p>Acesso ilimitado, vozes premium e sem anúncios para sempre.</p>
          </div>
        </div>
        <button className="btn-upgrade-minimal">Upgrade Agora</button>
      </section>

      <div className="profile-sections-grid">
        {/* Basic Info */}
        <section className="profile-card">
          <div className="card-header">
            <User size={20} className="text-primary" />
            <h3>Dados Pessoais</h3>
          </div>
          <div className="form-group">
            <label>Nome Completo</label>
            <div className="input-with-icon">
              <User size={16} />
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Learning Goal */}
        <section className="profile-card">
          <div className="card-header">
            <Target size={20} className="text-primary" />
            <h3>Meta de Estudo</h3>
          </div>
          <p className="section-desc">Quanto tempo você quer dedicar por dia?</p>
          <div className="goals-selector">
            {goals.map(g => (
              <button 
                key={g.id}
                className={`goal-btn ${formData.goal === g.id ? 'active' : ''}`}
                onClick={() => setFormData({...formData, goal: g.id})}
              >
                <span className="goal-label">{g.label}</span>
                <span className="goal-desc">{g.desc}</span>
                {formData.goal === g.id && <div className="active-dot" style={{backgroundColor: g.color}}></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Current Level */}
        <section className="profile-card">
          <div className="card-header">
            <Award size={20} className="text-warning" />
            <h3>Nível de Proficiência</h3>
          </div>
          <p className="section-desc">Selecione seu nível atual para personalizarmos o conteúdo.</p>
          <div className="levels-grid">
            {levels.map(lvl => (
              <button 
                key={lvl}
                className={`level-btn ${formData.level === lvl ? 'active' : ''}`}
                onClick={() => setFormData({...formData, level: lvl})}
              >
                {lvl}
              </button>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <section className="profile-card">
          <div className="card-header">
            <Bell size={20} className="text-primary" />
            <h3>Preferências</h3>
          </div>
          <div className="toggle-group">
            <div className="toggle-item">
              <span>Lembretes Diários</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="toggle-item">
              <span>E-mails de Progresso</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="toggle-item">
              <span>Efeitos Sonoros</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </section>
      </div>

      <div className="profile-actions">
        <button className="btn btn-secondary"><LogOut size={18} /> Sair da Conta</button>
        <button className={`btn btn-primary ${isSaved ? 'success' : ''}`} onClick={handleSave}>
          {isSaved ? <><Check size={18} /> Salvo!</> : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
