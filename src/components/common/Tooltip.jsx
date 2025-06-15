import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useThemeStore();

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg whitespace-nowrap ${
              positionClasses[position]
            } ${
              theme === 'dark'
                ? 'bg-meta-gray-800 text-white'
                : 'bg-white text-meta-gray-800 border border-meta-gray-200'
            }`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 rotate-45 ${
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                'left-[-4px] top-1/2 -translate-y-1/2'
              } ${
                theme === 'dark'
                  ? 'bg-meta-gray-800'
                  : 'bg-white border-r border-b border-meta-gray-200'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip; 