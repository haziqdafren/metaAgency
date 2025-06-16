import React, { useEffect } from 'react';
import useThemeStore from '../../store/themeStore';

const ThemeProvider = ({ children }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Remove both classes first
    document.documentElement.classList.remove('dark', 'light');
    // Add the current theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  return children;
};

export default ThemeProvider; 