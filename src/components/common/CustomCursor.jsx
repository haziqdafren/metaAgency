import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/custom-cursor.css';
import useThemeStore from '../../store/themeStore';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme } = useThemeStore();

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', mouseMove);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const cursorColor = theme === 'dark' ? '#00bcd4' : '#FFFFFF'; // meta-blue for dark, white for light

  const variants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      backgroundColor: cursorColor,
    },
    outline: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      borderColor: cursorColor,
      transition: { type: "spring", mass: 0.1, damping: 10, stiffness: 100 },
    },
  };

  return (
    <div className="custom-cursor">
      <motion.div
        className="cursor-dot"
        variants={variants}
        animate="default"
      />
      <motion.div
        className="cursor-outline"
        variants={variants}
        animate="outline"
      />
    </div>
  );
};

export default CustomCursor; 