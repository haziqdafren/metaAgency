import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  isVisible = false, 
  onClose, 
  duration = 4000,
  position = 'top-right',
  title 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-green-200 text-green-800';
      case 'error':
        return 'bg-white border-red-200 text-red-800';
      case 'warning':
        return 'bg-white border-yellow-200 text-yellow-800';
      default:
        return 'bg-white border-blue-200 text-blue-800';
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimation = () => {
    if (position.includes('right')) {
      return {
        initial: { opacity: 0, x: 100, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 100, scale: 0.95 }
      };
    } else if (position.includes('left')) {
      return {
        initial: { opacity: 0, x: -100, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -100, scale: 0.95 }
      };
    } else {
      return {
        initial: { opacity: 0, y: -100, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -100, scale: 0.95 }
      };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...getAnimation()}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed ${getPosition()} z-[9999] w-full max-w-sm`}
        >
          <div
            className={`relative rounded-lg border shadow-lg p-4 backdrop-blur-sm ${getColors()}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="text-sm font-semibold mb-1">
                    {title}
                  </h4>
                )}
                <p className="text-sm">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            {/* Progress bar */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                <motion.div
                  className={`h-full ${getProgressBarColor()}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;