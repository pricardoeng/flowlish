import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import Dictionary from './components/Dictionary';
import Practice from './components/Practice';
import Profile from './components/Profile';
import { AppProvider } from './AppContext';
import './App.css'; 

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'dictionary':
        return <Dictionary onStartPractice={() => setCurrentView('practice')} />;
      case 'practice':
        return <Practice onFinish={() => setCurrentView('dashboard')} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="app-container">
        {/* Desktop Sidebar */}
        <div className="desktop-only">
          <Sidebar activeView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Feature Area */}
        <main className="main-content">
          {renderView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-only">
          <MobileNav activeView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
