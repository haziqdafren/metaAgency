import React, { createContext, useContext, useState, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { isDemoMode as checkDemoMode } from '../utils/demoMode';
import Toast from '../components/common/Toast';

const DemoModeContext = createContext();

export const DemoModeProvider = ({ children }) => {
  const { profile } = useAuthStore();
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const isDemoMode = checkDemoMode(profile);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showDemoRestriction = useCallback(() => {
    showToast(
      '🎨 Demo Mode: Data modifications are disabled in this preview. This is a read-only demonstration.',
      'info'
    );
  }, [showToast]);

  /**
   * Wrap an action with demo mode check
   * If in demo mode, shows restriction message instead of executing action
   */
  const withDemoCheck = useCallback((action) => {
    return (...args) => {
      if (isDemoMode) {
        showDemoRestriction();
        return Promise.resolve({ prevented: true });
      }
      return action(...args);
    };
  }, [isDemoMode, showDemoRestriction]);

  const value = {
    isDemoMode,
    showDemoRestriction,
    withDemoCheck,
    showToast
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position="top-right"
        duration={4000}
      />
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
};
