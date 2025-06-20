import React from 'react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { theme } = useThemeStore();
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-meta-gray-200' : 'text-meta-black'}`}>{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-meta-gray-500" />
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-2.5 rounded-lg
            ${theme === 'dark' ? 'bg-meta-gray-800/50 border border-meta-gray-700 text-white placeholder-meta-gray-500' : 'bg-white border border-meta-gray-300 text-meta-black placeholder-meta-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-meta-blue/50 focus:border-transparent
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
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

export default Input; 