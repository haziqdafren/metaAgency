import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useSidebarStore from './store/sidebarStore';
import { LogOut } from 'lucide-react';

// Helper function for reliable lazy loading with retry
const lazyLoad = (importFunc, retries = 3) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = () => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            console.warn(`Chunk loading attempt failed:`, error);
            if (retries > 0) {
              console.warn(`Retrying... (${retries} attempts left)`);
              setTimeout(attempt, 1000);
            } else {
              console.error(`Chunk loading failed after ${3} attempts:`, error);
              reject(error);
            }
          });
      };
      attempt();
    });
  });
};

// Public Pages
const Home = lazyLoad(() => import('./pages/public/Home'));
const AboutPage = lazyLoad(() => import('./pages/public/AboutPage'));
const ServicesPage = lazyLoad(() => import('./pages/public/ServicesPage'));
const PublicArticles = lazyLoad(() => import('./pages/public/ArticlesEnhanced'));
const JoinPage = lazyLoad(() => import('./pages/public/JoinPage'));
const ContactPage = lazyLoad(() => import('./pages/public/ContactPage'));
const FAQ = lazyLoad(() => import('./pages/public/FAQ'));
const Careers = lazyLoad(() => import('./pages/public/Careers'));
const Privacy = lazyLoad(() => import('./pages/public/Privacy'));
const Terms = lazyLoad(() => import('./pages/public/Terms'));
const Disclaimer = lazyLoad(() => import('./pages/public/Disclaimer'));
const LoginPage = lazyLoad(() => import('./pages/auth/LoginPage'));
const BulletproofLogin = lazyLoad(() => import('./pages/auth/BulletproofLogin'));
const AuthTest = lazyLoad(() => import('./pages/AuthTest'));
const NotFound = lazyLoad(() => import('./pages/public/NotFound'));
const BonusContent = lazyLoad(() => import('./pages/public/BonusContentEnhanced'));
const ArticleDetail = lazyLoad(() => import('./pages/public/ArticleDetail'));

// Protected Pages
const Dashboard = lazyLoad(() => import('./pages/talent/Dashboard'));
const AdminDashboard = lazyLoad(() => import('./pages/admin/AdminDashboard'));
const AdminSidebar = lazyLoad(() => import('./components/admin/AdminSidebar'));
const TalentManagement = lazyLoad(() => import('./pages/admin/TalentManagement'));
const PerformanceUpload = lazyLoad(() => import('./pages/admin/PerformanceUpload'));
const BonusCalculator = lazyLoad(() => import('./pages/admin/BonusCalculator'));
const AdminArticles = lazyLoad(() => import('./pages/admin/AdminArticles'));
const TalentSearch = lazyLoad(() => import('./pages/admin/TalentSearch'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're having trouble loading this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuthStore();
  
  // Add extra logging for debugging
  console.log('🛡️ ProtectedRoute check:', { 
    user: !!user, 
    profile: profile?.role, 
    loading, 
    requiredRole,
    timestamp: new Date().toISOString()
  });
  
  // Show loading spinner while auth is initializing
  if (loading) {
    console.log('⏳ Auth loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meta-blue mx-auto"></div>
          <p className="text-meta-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Check if user exists
  if (!user) {
    console.log('🚫 No user found, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Check if profile is required and exists
  if (!profile) {
    console.log('⚠️ No profile found, waiting for profile fetch...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meta-blue mx-auto"></div>
          <p className="text-meta-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && profile.role !== requiredRole) {
    console.log('⚠️ Insufficient role, redirecting...', { required: requiredRole, actual: profile.role });
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.role === 'talent') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Access granted for role:', profile?.role);
  return children;
}

function AdminLayout({ children }) {
  const { theme, setTheme } = useThemeStore();
  const { signOut } = useAuthStore();
  const { isOpen } = useSidebarStore();
  const location = useLocation();
  const [toast, setToast] = React.useState({ isVisible: false, message: '', type: 'info', title: '' });
  
  // Handle logout with toast notification
  const handleLogout = async () => {
    try {
      await signOut();
      setToast({ isVisible: true, message: 'Berhasil logout. Sampai jumpa!', type: 'success', title: 'Logout Berhasil' });
    } catch (error) {
      setToast({ isVisible: true, message: 'Gagal logout. Silakan coba lagi.', type: 'error', title: 'Error' });
    }
  };
  
  // Force light mode for admin on mount and on route change
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    localStorage.setItem('theme', 'light');
    if (theme !== 'light' && setTheme) setTheme('light');
    // eslint-disable-next-line
  }, [location.pathname]);
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Dashboard';
      case '/admin/talents':
        return 'Talent Management';
      case '/admin/upload':
        return 'Upload Performance';
      case '/admin/bonus':
        return 'Bonus Calculator';
      default:
        return 'Admin Panel';
    }
  };
  return (
    <div className={`flex min-h-screen transition-colors duration-500 bg-white font-display text-meta-black`}>
      <AdminSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-[240px]' : 'ml-[80px]'}`}>
        <header className={`flex items-center justify-between h-16 px-6 border-b sticky top-0 z-30 backdrop-blur bg-white/80 border-meta-gray-200 transition-colors duration-500`}>
          <h1 className={`text-xl font-bold text-meta-black font-display`}>{getPageTitle()}</h1>
          <div className="flex items-center space-x-4">
            {/* Theme toggle is hidden/disabled in admin */}
            <button
              onClick={handleLogout}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-meta-gray-600 hover:text-red-500 hover:bg-meta-gray-100 transition-colors`}
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        </header>
        <main className={`flex-1 transition-colors duration-500 bg-gradient-to-br from-white via-meta-gray-100 to-white overflow-y-auto font-display text-meta-black`}>
          {children}
        </main>
      </div>
      
      {/* Toast Notifications */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          isVisible={toast.isVisible}
          onClose={() => setToast(t => ({ ...t, isVisible: false }))}
          duration={3000}
          position="top-right"
        />
      )}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { theme } = useThemeStore();

  return (
    <ErrorBoundary>
      {!isAdminRoute && <Navbar />}
      <div className={`${!isAdminRoute ? `min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-white text-meta-black'}` : ''}`}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/articles" element={<PublicArticles />} />
            <Route path="/bonus" element={<BonusContent />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/login" element={
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            } />
            <Route path="/auth-test" element={
              <ErrorBoundary>
                <AuthTest />
              </ErrorBoundary>
            } />
            <Route path="/old-login" element={
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="talent">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="talents" element={<TalentManagement />} />
                    <Route path="upload" element={<PerformanceUpload />} />
                    <Route path="bonus" element={<BonusCalculator />} />
                    <Route path="articles" element={<AdminArticles />} />
                    <Route path="talent-search" element={<TalentSearch />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      {!isAdminRoute && <Footer />}
      <ScrollToTop />
    </ErrorBoundary>
  );
}

export default AppRoutes; 