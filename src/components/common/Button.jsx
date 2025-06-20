import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  color = '', // optional accent color
  ...props
}) => {
  const { theme } = useThemeStore();
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-meta-blue to-cyan-500 text-white hover:opacity-90',
    secondary: theme === 'dark'
      ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
      : 'bg-gray-100 text-meta-black hover:bg-gray-200',
    outline: theme === 'dark'
      ? 'border border-meta-gray-800 text-white hover:bg-meta-gray-800'
      : 'border border-meta-gray-300 text-meta-black hover:bg-gray-100',
    ghost: theme === 'dark'
      ? 'text-white hover:bg-white/10'
      : 'text-meta-black hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const colorClass = color ? color : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${colorClass} ${className}`;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button; 