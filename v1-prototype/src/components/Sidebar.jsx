import React from 'react';
import { Home, BookOpen, Mic, Trophy, Settings } from 'lucide-react';
import { useAppContext } from '../AppContext';
import './Navigation.css';

const Sidebar = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Progresso', icon: Home },
    { id: 'dictionary', label: 'Dicionário', icon: BookOpen },
    { id: 'practice', label: 'Aprender', icon: Mic },
    { id: 'profile', label: 'Perfil', icon: Settings },
  ];

  const { handleUpgrade } = useAppContext();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"></div>
        <h2>Flowlish</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-primary w-full upgrade-btn" onClick={handleUpgrade} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
