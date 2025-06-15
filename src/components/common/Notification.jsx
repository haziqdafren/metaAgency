import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const Notification = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-meta-blue" />,
  };

  const bgColors = {
    success: theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50',
    error: theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50',
    info: theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-meta-gray-50',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed top-4 right-4 z-50 max-w-md ${bgColors[type]} backdrop-blur-sm rounded-lg shadow-lg border ${
            theme === 'dark' ? 'border-meta-gray-700' : 'border-meta-gray-200'
          }`}
        >
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-meta-gray-800'
              }`}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`ml-4 flex-shrink-0 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === 'dark' 
                  ? 'text-meta-gray-400 hover:text-white focus:ring-meta-gray-600' 
                  : 'text-meta-gray-500 hover:text-meta-gray-700 focus:ring-meta-gray-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 