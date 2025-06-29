import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MagneticButton = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  magneticStrength = 0.3,
  disabled = false,
  onClick,
  ...props 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    setPosition({ 
      x: deltaX * magneticStrength, 
      y: deltaY * magneticStrength 
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled) return;
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    if (onClick) onClick(e);
  };

  // Variant styles
  const variants = {
    primary: {
      base: 'bg-gradient-to-r from-meta-blue to-cyan-500 text-white shadow-lg hover:shadow-xl',
      hover: 'hover:shadow-2xl hover:shadow-meta-blue/25'
    },
    secondary: {
      base: 'bg-white text-meta-blue border-2 border-meta-blue shadow-lg hover:shadow-xl',
      hover: 'hover:bg-meta-blue hover:text-white hover:shadow-2xl hover:shadow-meta-blue/25'
    },
    glass: {
      base: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg',
      hover: 'hover:bg-white/20 hover:shadow-2xl'
    },
    outline: {
      base: 'border-2 border-meta-blue text-meta-blue bg-transparent',
      hover: 'hover:bg-meta-blue hover:text-white'
    }
  };

  // Size styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const baseClasses = `
    relative overflow-hidden rounded-xl font-semibold
    transition-all duration-300 ease-out
    transform-gpu cursor-pointer
    active:scale-95
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${variants[variant]?.base || variants.primary.base}
    ${variants[variant]?.hover || variants.primary.hover}
    ${sizes[size] || sizes.md}
    ${className}
  `;

  return (
    <motion.button
      ref={buttonRef}
      className={baseClasses}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transform: 'skewX(-20deg)' }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </motion.button>
  );
};

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default MagneticButton;