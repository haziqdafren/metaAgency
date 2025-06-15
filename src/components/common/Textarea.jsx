import React from 'react';
import { motion } from 'framer-motion';

const Textarea = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-meta-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-meta-gray-800/50 border border-meta-gray-700
          text-white placeholder-meta-gray-500
          focus:outline-none focus:ring-2 focus:ring-meta-blue/50 focus:border-transparent
          transition-all duration-200
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Textarea; 