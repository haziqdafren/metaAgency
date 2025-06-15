import React from 'react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const LoadingSpinner = ({ size = 'md' }) => {
  const { theme } = useThemeStore();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${sizeClasses[size]} border-4 rounded-full ${
          theme === 'dark' 
            ? 'border-meta-gray-800 border-t-meta-blue' 
            : 'border-meta-gray-200 border-t-meta-blue'
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default LoadingSpinner; 