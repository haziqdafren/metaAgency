import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = toastId++;
    const newToast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showDemoRestriction = useCallback(() => {
    showToast({
      message: '🎨 Demo Mode: Data modifications are disabled in this preview. This is a read-only demonstration.',
      type: 'info',
      duration: 4000
    });
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    showDemoRestriction
  };
};
