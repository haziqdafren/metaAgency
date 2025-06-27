import React from 'react';
import { motion, useAnimationControls, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

// Custom Meta Agency Animation System

// TikTok-inspired bounce entrance
export const TikTokBounce = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ 
        scale: 0,
        rotate: -180,
        opacity: 0 
      }}
      animate={isInView ? {
        scale: [0, 1.2, 0.9, 1.05, 1],
        rotate: [-180, 0],
        opacity: 1
      } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.68, -0.55, 0.265, 1.55], // Custom easing
        scale: {
          times: [0, 0.3, 0.6, 0.8, 1],
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Creator growth animation
export const GrowthReveal = ({ children, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };
  
  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={isInView ? {
        x: 0,
        y: 0,
        opacity: 1
      } : {}}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};

// Money/success floating animation
export const FloatingSuccess = ({ children, intensity = 1 }) => {
  return (
    <motion.div
      animate={{
        y: [0, -8 * intensity, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered text reveal (for headlines)
export const TextReveal = ({ text, className = "" }) => {
  const words = text.split(" ");
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  
  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -90 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  };
  
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      style={{ perspective: 1000 }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={wordVariants}
          style={{ transformOrigin: "bottom" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Indonesian culture-inspired wave animation
export const CulturalWave = ({ children }) => {
  return (
    <motion.div
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%)
        `,
        backgroundSize: "400% 400%",
      }}
    >
      {children}
    </motion.div>
  );
};

// Interactive hover effect for cards
export const InteractiveCard = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        scale: 1.02,
        rotateY: 5,
        rotateX: 5,
        z: 50,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-pink-500/20 rounded-lg opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.div>
  );
};

// Creator success counter animation
export const CounterAnimation = ({ from = 0, to, duration = 2, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimationControls();
  
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        scale: [0.5, 1.2, 1],
        transition: { duration: 0.5 }
      });
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial={{ opacity: 0, scale: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration }}
      >
        {isInView && (
          <motion.span
            initial={{ textContent: from }}
            animate={{ textContent: to }}
            transition={{
              duration,
              ease: "easeOut",
            }}
            onUpdate={(latest) => {
              if (ref.current) {
                const value = Math.floor(latest.textContent);
                ref.current.textContent = `${value.toLocaleString('id-ID')}${suffix}`;
              }
            }}
          />
        )}
      </motion.span>
    </motion.div>
  );
};