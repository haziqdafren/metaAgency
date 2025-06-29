import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MagneticCard = ({ 
  children, 
  className = '', 
  tiltStrength = 0.1,
  magneticStrength = 0.2,
  glowEffect = true,
  scaleOnHover = true,
  disabled = false,
  onClick,
  ...props 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to card center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Calculate rotation values
    const rotateX = deltaY * tiltStrength;
    const rotateY = -deltaX * tiltStrength;
    
    // Calculate magnetic translation
    const translateX = deltaX * magneticStrength;
    const translateY = deltaY * magneticStrength;
    
    setMousePosition({
      rotateX,
      rotateY,
      translateX,
      translateY,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ 
      rotateX: 0, 
      rotateY: 0, 
      translateX: 0, 
      translateY: 0,
      x: 0,
      y: 0 
    });
  };

  const handleClick = (e) => {
    if (disabled || !onClick) return;
    
    // Create click effect
    const rect = e.currentTarget.getBoundingClientRect();
    const clickEffect = document.createElement('div');
    const size = 100;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    clickEffect.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: clickEffect 0.5s ease-out;
      pointer-events: none;
      z-index: 10;
    `;
    
    e.currentTarget.appendChild(clickEffect);
    setTimeout(() => clickEffect.remove(), 500);
    
    onClick(e);
  };

  const baseClasses = `
    relative rounded-xl overflow-hidden cursor-pointer
    bg-white dark:bg-gray-800 shadow-lg
    transition-shadow duration-300
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        className={baseClasses}
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: mousePosition.rotateX,
          rotateY: mousePosition.rotateY,
          x: mousePosition.translateX,
          y: mousePosition.translateY,
          scale: isHovered && scaleOnHover ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {/* Glow effect */}
        {glowEffect && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Highlight effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Border highlight */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-transparent opacity-0"
          style={{
            borderImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(6, 182, 212, 0.5)) 1`,
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
};

// Add click effect animation CSS
const style = document.createElement('style');
style.textContent = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  @keyframes clickEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default MagneticCard;