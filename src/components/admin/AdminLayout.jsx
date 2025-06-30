import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Home, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminLayout = ({ children, title, showBackButton = false, compact = false }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Extended session timeout for admin users (30 minutes = 1800000 ms)
    // Extended to 60 minutes if user is in upload operations
    const checkSession = () => {
      const sessionStart = localStorage.getItem('adminSessionStart');
      const lastActivity = localStorage.getItem('adminLastActivity') || sessionStart;
      const isUploadActive = localStorage.getItem('adminUploadActive') === 'true';
      
      if (profile && profile.role === 'admin' && sessionStart) {
        const now = Date.now();
        const activityTime = parseInt(lastActivity, 10);
        
        // Use extended timeout during uploads (60 min), normal timeout otherwise (30 min)
        const timeoutDuration = isUploadActive ? 3600000 : 1800000;
        
        if (now - activityTime > timeoutDuration) {
          // Clean up upload state before logout
          localStorage.removeItem('adminUploadActive');
          signOut();
          navigate('/auth/login', { replace: true });
        }
      }
    };
    
    checkSession();
    const interval = setInterval(checkSession, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [profile, signOut, navigate]);

  // Track user activity to extend session
  useEffect(() => {
    const updateActivity = () => {
      if (profile && profile.role === 'admin') {
        localStorage.setItem('adminLastActivity', Date.now().toString());
      }
    };
    
    // Track mouse and keyboard activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [profile]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    if (pathSegments[0] === 'admin') {
      breadcrumbs.push({ name: 'Dashboard', path: '/admin' });
      
      if (pathSegments[1]) {
        const pageNames = {
          'talents': 'Talent Management',
          'upload': 'Upload Performance',
          'bonus': 'Bonus Calculator',
          'articles': 'Articles',
          'talent-search': 'Talent Search'
        };
        
        breadcrumbs.push({
          name: pageNames[pathSegments[1]] || pathSegments[1],
          path: location.pathname
        });
      }
    }
    
    return breadcrumbs;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header with Breadcrumbs */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <nav className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && <span>/</span>}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`hover:text-blue-600 transition-colors ${
                        index === getBreadcrumbs().length - 1 ? 'text-gray-900 font-medium' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${compact ? 'space-y-3' : 'space-y-4'}`}>
        {children}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout; 