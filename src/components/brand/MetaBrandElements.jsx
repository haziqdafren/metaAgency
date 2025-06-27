import React from 'react';
import { motion } from 'framer-motion';

// Custom Meta Agency Brand Elements
export const MetaLogoMark = ({ size = 40, animated = true }) => {
  const logoVariants = {
    idle: {
      rotate: 0,
      scale: 1,
    },
    hover: {
      rotate: [0, -5, 5, 0],
      scale: 1.05,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="relative"
      variants={logoVariants}
      initial="idle"
      whileHover={animated ? "hover" : "idle"}
      style={{ width: size, height: size }}
    >
      {/* Custom M lettermark with Indonesian-inspired geometric pattern */}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Background circle with traditional Indonesian pattern */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#metaGradient)"
          stroke="url(#strokeGradient)"
          strokeWidth="2"
        />
        
        {/* Indonesian batik-inspired pattern */}
        <pattern id="batikPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)" />
          <path d="M5 5L15 15M15 5L5 15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
        <circle cx="50" cy="50" r="35" fill="url(#batikPattern)" />
        
        {/* Main M letterform */}
        <path
          d="M25 70V30h8l12 20 12-20h8v40h-7V42l-10 16h-6l-10-16v28h-7z"
          fill="white"
          stroke="none"
        />
        
        {/* Accent elements - representing growth/connection */}
        <circle cx="75" cy="30" r="3" fill="#FFD700" opacity="0.8" />
        <circle cx="80" cy="35" r="2" fill="#FF6B6B" opacity="0.6" />
        <circle cx="70" cy="25" r="1.5" fill="#4ECDC4" opacity="0.7" />
        
        <defs>
          <linearGradient id="metaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="50%" stopColor="#16213e" />
            <stop offset="100%" stopColor="#0f3460" />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

// Custom background pattern inspired by Indonesian textile
export const IndonesianPattern = ({ className = "" }) => (
  <div className={`absolute inset-0 opacity-5 ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="indonesian-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Traditional Indonesian diamond pattern */}
          <path d="M60 10 L90 40 L60 70 L30 40 Z" fill="currentColor" opacity="0.3" />
          <path d="M60 30 L75 45 L60 60 L45 45 Z" fill="currentColor" opacity="0.2" />
          <circle cx="60" cy="45" r="3" fill="currentColor" opacity="0.4" />
          
          {/* Corner elements */}
          <circle cx="15" cy="15" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="105" cy="15" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="15" cy="105" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="105" cy="105" r="2" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#indonesian-pattern)" />
    </svg>
  </div>
);

// Dynamic content creator illustration
export const CreatorIllustration = ({ className = "" }) => (
  <motion.div
    className={`relative ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.3 }}
  >
    <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
      {/* Phone screen */}
      <rect x="100" y="20" width="100" height="160" rx="20" fill="#1a1a2e" stroke="#FFD700" strokeWidth="2" />
      <rect x="110" y="40" width="80" height="120" rx="5" fill="#000" />
      
      {/* TikTok-style video content */}
      <rect x="115" y="45" width="70" height="110" rx="3" fill="url(#videoGradient)" />
      
      {/* Hearts and engagement icons floating */}
      <motion.g
        animate={{
          y: [0, -10, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <path d="M220 60 L225 55 L230 60 L225 70 Z" fill="#FF6B6B" />
        <path d="M210 80 L215 75 L220 80 L215 90 Z" fill="#FFD700" />
        <path d="M230 100 L235 95 L240 100 L235 110 Z" fill="#4ECDC4" />
      </motion.g>
      
      {/* Money/growth indicators */}
      <motion.g
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <circle cx="70" cy="100" r="15" fill="#4CAF50" opacity="0.8" />
        <text x="70" y="105" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">Rp</text>
      </motion.g>
      
      <defs>
        <linearGradient id="videoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

// Success metrics with Indonesian touch
export const SuccessMetrics = ({ value, label, icon: Icon, color }) => (
  <motion.div
    className="relative group"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    {/* Traditional Indonesian border pattern */}
    <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
         style={{ padding: '2px' }}>
      <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg"></div>
    </div>
    
    <div className="relative p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      
      {/* Indonesian decorative element */}
      <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full opacity-60"></div>
    </div>
  </motion.div>
);