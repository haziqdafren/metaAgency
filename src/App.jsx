import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';
import CustomCursor from './components/common/CustomCursor';
import ThemeProvider from './components/common/ThemeProvider';
import AppRoutes from './routes';

function App() {
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
