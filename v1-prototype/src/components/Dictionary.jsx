import React, { useState } from 'react';
import './Dictionary.css';
import { Search, Volume2, Heart, ChevronDown, CheckCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';

const Dictionary = ({ onStartPractice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [limit, setLimit] = useState(6);
  const { chunks, toggleFavorite, playAudio, userStats, markAsCompleted } = useAppContext();

  const filteredChunks = chunks.filter(chunk => {
    const matchesSearch = chunk.english.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chunk.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = showOnlyFavorites ? chunk.favorite : true;
    const matchesCompleted = showOnlyCompleted ? chunk.completed : true;
    return matchesSearch && matchesFav && matchesCompleted;
  });

  const displayedChunks = filteredChunks.slice(0, limit);
  const hasMore = limit < filteredChunks.length;

  const handleLoadMore = () => {
    setLimit(prev => prev + 6);
  };

  return (
    <div className="dictionary-container animate-fade-in">
      <header className="dict-header">
        <div className="header-stats">
          <div className="stat-pill"><ZapIcon /> <span>Streaks: {userStats.streaks}</span></div>
          <div className="stat-pill"><TrophyIcon /> <span>XP: {userStats.xp}</span></div>
        </div>
        
        <h1 className="mt-4">Dicionário de Chunks</h1>
        <p className="subtitle">Sua biblioteca pessoal de frases e expressões prontas. Domine o idioma através de blocos de significado, não apenas palavras soltas.</p>
      </header>

      {/* Filters */}
      <div className="dict-filters">
        <div className="search-bar">
          <Search size={18} className="text-light" />
          <input 
            type="text" 
            placeholder="Pesquisar por chunk ou tradução..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setLimit(6); // reset pagination on search
            }}
          />
        </div>
        
        <div className="filter-select">
          <span>Nível</span>
          <ChevronDown size={16} />
        </div>
        
        <div className="filter-select">
          <span>Contexto</span>
          <ChevronDown size={16} />
        </div>
        
        <button 
          className="btn-favorite-filter"
          onClick={() => {
            setShowOnlyFavorites(!showOnlyFavorites);
            setLimit(6);
          }}
          style={{ backgroundColor: showOnlyFavorites ? '#FFE4E6' : 'var(--bg-card)' }}
        >
          <Heart size={16} className="text-error" fill={showOnlyFavorites ? "currentColor" : "none"} /> Favoritos
        </button>

        <button 
          className="btn-favorite-filter"
          onClick={() => {
            setShowOnlyCompleted(!showOnlyCompleted);
            setLimit(6);
          }}
          style={{ backgroundColor: showOnlyCompleted ? '#E8F5EE' : 'var(--bg-card)', color: showOnlyCompleted ? 'var(--primary)' : 'inherit' }}
        >
          <CheckCircle size={16} className={showOnlyCompleted ? "text-primary" : "text-light"} /> Concluídos
        </button>
      </div>

      {/* Grid of Chunks */}
      <div className="chunks-grid">
        {displayedChunks.map(chunk => (
          <div className="chunk-card" key={chunk.id}>
            <div className="chunk-card-header">
              <h3 className="chunk-english">{chunk.english}</h3>
              <button className="play-btn" onClick={() => { playAudio(chunk.english); markAsCompleted(chunk.id); }}>
                <Volume2 size={18} className="text-primary" />
              </button>
            </div>
            
            <button className="favorite-icon-btn" onClick={() => toggleFavorite(chunk.id)}>
              <Heart size={18} className="text-error" fill={chunk.favorite ? "currentColor" : "none"} />
            </button>

            <div className="chunk-body">
              <span className="trans-label">TRADUÇÃO {chunk.completed && <span style={{color: 'var(--success)', marginLeft: '8px', fontWeight: 'bold'}}>✓ CONCLUÍDO</span>}</span>
              <p className="chunk-translation">{chunk.translation}</p>
            </div>
            
            <div className="chunk-footer">
              <span className="chunk-tag">{chunk.tag}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dict-pagination-section">
        {hasMore ? (
          <button className="btn btn-primary" onClick={handleLoadMore}>
            Carregar Mais Chunks <ChevronDown size={18} />
          </button>
        ) : (
          <button className="btn btn-secondary" disabled style={{ cursor: 'default', opacity: 0.8 }}>
            <CheckCircle size={18} /> Todos os chunks exibidos
          </button>
        )}
      </div>
    </div>
  );
};

// Mini internal components just for icons matching screenshot layout
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M8 21h8m-4-4v4m3-18H9a6 6 0 00-6 6v2a6 6 0 006 6h6a6 6 0 006-6V8a6 6 0 00-6-6z"/></svg>
);

export default Dictionary;
