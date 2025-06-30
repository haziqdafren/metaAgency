import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, Lock, User, Mail } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const EnhancedInput = ({
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  error,
  success,
  hint,
  placeholder,
  icon: CustomIcon,
  className = '',
  showStrength = false,
  autoComplete,
  required = false,
  disabled = false,
  ...props
}) => {
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  // Auto-select appropriate icon
  const getDefaultIcon = () => {
    if (CustomIcon) return CustomIcon;
    if (type === 'email') return Mail;
    if (type === 'password') return Lock;
    if (type === 'text' && label?.toLowerCase().includes('user')) return User;
    return null;
  };

  const Icon = getDefaultIcon();

  // Password strength calculation
  useEffect(() => {
    if (isPassword && showStrength && value) {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[a-z]/.test(value)) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      setPasswordStrength(Math.min(strength, 100));
    }
  }, [value, isPassword, showStrength]);

  // Caps lock detection
  const handleKeyPress = (e) => {
    if (isPassword) {
      const capsLock = e.getModifierState && e.getModifierState('CapsLock');
      setCapsLockOn(capsLock);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg transition-all duration-200 ease-in-out
    ${Icon ? 'pl-12' : ''}
    ${isPassword ? 'pr-12' : ''}
    ${theme === 'dark' 
      ? 'bg-meta-gray-800/50 border border-meta-gray-700 text-white placeholder-meta-gray-500' 
      : 'bg-white border border-meta-gray-300 text-meta-black placeholder-meta-gray-400'
    }
    ${focused && !error 
      ? theme === 'dark' 
        ? 'border-meta-blue ring-2 ring-meta-blue/20' 
        : 'border-meta-blue ring-2 ring-meta-blue/20'
      : ''
    }
    ${error 
      ? 'border-red-500 ring-2 ring-red-500/20' 
      : success 
        ? 'border-green-500 ring-2 ring-green-500/20' 
        : ''
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-meta-blue/50'}
    focus:outline-none focus:ring-2
    ${error 
      ? 'focus:ring-red-500/20 focus:border-red-500' 
      : success 
        ? 'focus:ring-green-500/20 focus:border-green-500'
        : 'focus:ring-meta-blue/20 focus:border-meta-blue'
    }
    ${className}
  `;

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium transition-colors duration-200 ${
          theme === 'dark' ? 'text-meta-gray-200' : 'text-meta-gray-700'
        } ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors duration-200 ${
              focused && !error 
                ? 'text-meta-blue' 
                : error 
                  ? 'text-red-500' 
                  : success 
                    ? 'text-green-500'
                    : theme === 'dark' 
                      ? 'text-meta-gray-500' 
                      : 'text-meta-gray-400'
            }`} />
          </div>
        )}

        {/* Input Field */}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setFocused(true)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-meta-gray-500 hover:text-meta-gray-700" />
            ) : (
              <Eye className="h-5 w-5 text-meta-gray-500 hover:text-meta-gray-700" />
            )}
          </button>
        )}

        {/* Status Icons */}
        {!isPassword && (error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Caps Lock Warning */}
      <AnimatePresence>
        {isPassword && capsLockOn && focused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-amber-600 text-sm"
          >
            <Info className="h-4 w-4" />
            <span>Caps Lock is on</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Strength Indicator */}
      <AnimatePresence>
        {isPassword && showStrength && value && focused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}>
                Password Strength
              </span>
              <span className={`font-medium ${
                passwordStrength < 50 ? 'text-red-500' :
                passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {getStrengthText()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${passwordStrength}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-500 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-green-500 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <AnimatePresence>
        {hint && !error && !success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'}`}
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedInput;