"use client"
import React, { createContext, useContext, useState } from 'react';
import UpgradeModal from '@/components/ui/UpgradeModal';
import RecommendationActivity from '@/components/dashboard/RecommendationActivity';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);

  const openUpgrade = () => setIsUpgradeOpen(true);
  const closeUpgrade = () => setIsUpgradeOpen(false);

  const openActivity = (activity, userId) => {
    setActiveActivity(activity);
    setActiveUserId(userId);
  };
  const closeActivity = () => {
    setActiveActivity(null);
    setActiveUserId(null);
  };

  return (
    <ModalContext.Provider value={{ openUpgrade, closeUpgrade, openActivity, closeActivity }}>
      {children}
      <UpgradeModal isOpen={isUpgradeOpen} onClose={closeUpgrade} />
      {activeActivity && (
        <RecommendationActivity 
          activity={activeActivity} 
          userId={activeUserId}
          onClose={closeActivity} 
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModals must be used within ModalProvider");
  return context;
};
