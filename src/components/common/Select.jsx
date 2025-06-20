import React from 'react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const Select = ({
  label,
  error,
  className = '',
  children,
  ...props
}) => {
  const { theme } = useThemeStore();
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-meta-gray-200' : 'text-gray-700'}`}>{label}</label>
      )}
      <motion.select
        whileFocus={{ scale: 1.01 }}
        className={`w-full px-4 py-2.5 rounded-lg transition-all duration-200
          ${theme === 'dark' ? 'bg-meta-gray-800/50 border border-meta-gray-700 text-white' : 'bg-white border border-meta-gray-300 text-meta-black'}
          focus:outline-none focus:ring-2 focus:ring-meta-blue/50 focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.select>
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

export default Select; 