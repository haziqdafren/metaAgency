import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';
import CustomCursor from './components/common/CustomCursor';
import ThemeProvider from './components/common/ThemeProvider';
import AppRoutes from './routes';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';

function App() {
  const { theme } = useThemeStore();
  const { initialize, loading } = useAuthStore();
  
  // Initialize auth state on app start
  useEffect(() => {
    console.log('🚀 App starting - initializing auth state...');
    initialize();
  }, [initialize]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meta-blue mx-auto"></div>
          <p className="text-meta-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  
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
