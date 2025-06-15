import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';
import CustomCursor from './components/common/CustomCursor';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppRoutes />
        <ScrollToTop />
        <CustomCursor />
      </NotificationProvider>
    </Router>
  );
}

export default App;
