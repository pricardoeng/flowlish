import React from 'react';
import { Home, BookOpen, Mic, Trophy, Settings } from 'lucide-react';
import './Navigation.css';

const MobileNav = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'dictionary', label: 'Chunks', icon: BookOpen },
    { id: 'practice', label: 'Aprender', icon: Mic },
    { id: 'profile', label: 'Perfil', icon: Settings },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
        >
          <item.icon size={24} className="mobile-icon" />
          <span className="mobile-label">{item.label}</span>
          {activeView === item.id && <div className="active-dot"></div>}
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
