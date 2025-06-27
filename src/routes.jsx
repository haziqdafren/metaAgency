import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useSidebarStore from './store/sidebarStore';
import { Sun, Moon, LogOut } from 'lucide-react';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const PublicArticles = lazy(() => import('./pages/public/Articles'));
const JoinPage = lazy(() => import('./pages/public/JoinPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const Careers = lazy(() => import('./pages/public/Careers'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Disclaimer = lazy(() => import('./pages/public/Disclaimer'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const BonusContent = lazy(() => import('./pages/public/BonusContent'));
const ArticleDetail = lazy(() => import('./pages/public/ArticleDetail'));

// Protected Pages
const Dashboard = lazy(() => import('./pages/talent/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSidebar = lazy(() => import('./components/admin/AdminSidebar'));
const TalentManagement = lazy(() => import('./pages/admin/TalentManagement'));
const PerformanceUpload = lazy(() => import('./pages/admin/PerformanceUpload'));
const BonusCalculator = lazy(() => import('./pages/admin/BonusCalculator'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
const TalentSearch = lazy(() => import('./pages/admin/TalentSearch'));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuthStore();
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AdminLayout({ children }) {
  const { theme, setTheme } = useThemeStore();
  const { signOut } = useAuthStore();
  const { isOpen } = useSidebarStore();
  const location = useLocation();
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
              onClick={signOut}
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
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { theme } = useThemeStore();

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div className={`${!isAdminRoute ? `min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-white text-meta-black'}` : ''}`}>
        <Suspense fallback={<div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
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
            <Route path="/login" element={<LoginPage />} />
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
    </>
  );
}

export default AppRoutes; 