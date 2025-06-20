import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';
import CustomCursor from './components/common/CustomCursor';
import ThemeProvider from './components/common/ThemeProvider';
import AppRoutes from './routes';
import useThemeStore from './store/themeStore';

function App() {
  const { theme } = useThemeStore();
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AppRoutes />
          <ScrollToTop />
          <CustomCursor />
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
