import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-meta-black/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 border-2 border-meta-gray-800 rounded-full" />
        <div className="absolute inset-0 border-2 border-meta-blue border-t-transparent rounded-full" />
      </motion.div>
    </div>
  );
};

export default Loading; 