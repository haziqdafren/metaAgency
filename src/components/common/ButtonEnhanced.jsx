import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import MagneticButton from './MagneticButton';

const ButtonEnhanced = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  magnetic = true,
  magneticStrength = 0.3,
  as: Component = 'button',
  ...props
}, ref) => {
  const { theme } = useThemeStore();

  // If magnetic is enabled, use MagneticButton
  if (magnetic && !disabled && !loading) {
    return (
      <MagneticButton
        ref={ref}
        as={Component}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        magneticStrength={magneticStrength}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
        {children}
      </MagneticButton>
    );
  }

  // Fallback to regular motion button for loading/disabled states
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform-gpu';
  
  const variants = {
    primary: `bg-gradient-to-r from-meta-blue to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-meta-blue/25 ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`,
    secondary: `${
      theme === 'dark' 
        ? 'bg-meta-gray-800 text-white border border-meta-gray-700 hover:bg-meta-gray-700' 
        : 'bg-white text-meta-blue border border-meta-blue hover:bg-meta-blue hover:text-white'
    } shadow-lg hover:shadow-xl ${!disabled && !loading ? 'hover:scale-105 active:scale-95' : ''}`,
    outline: `border-2 border-meta-blue text-meta-blue bg-transparent hover:bg-meta-blue hover:text-white ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`,
    ghost: `text-meta-blue hover:bg-meta-blue/10 ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`,
    danger: `bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`,
    success: `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`,
    glass: `bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:shadow-xl ${
      !disabled && !loading ? 'hover:scale-105 active:scale-95' : ''
    }`
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <motion.component
      ref={ref}
      as={Component}
      className={buttonClasses}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {Icon && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      <span>{children}</span>
    </motion.component>
  );
});

ButtonEnhanced.displayName = 'ButtonEnhanced';

export default ButtonEnhanced;