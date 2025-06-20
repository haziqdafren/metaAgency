import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useSidebarStore from './store/sidebarStore';
import { Sun, Moon, LogOut } from 'lucide-react';

// Public Pages
import Home from './pages/public/Home';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import PublicArticles from './pages/public/Articles';
import JoinPage from './pages/public/JoinPage';
import ContactPage from './pages/public/ContactPage';
import FAQ from './pages/public/FAQ';
import Careers from './pages/public/Careers';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Disclaimer from './pages/public/Disclaimer';
import LoginPage from './pages/auth/LoginPage';
import NotFound from './pages/public/NotFound';
import BonusContent from './pages/public/BonusContent';
import ArticleDetail from './pages/public/ArticleDetail';

// Protected Pages
import Dashboard from './pages/talent/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSidebar from './components/admin/AdminSidebar';
import TalentManagement from './pages/admin/TalentManagement';
import PerformanceUpload from './pages/admin/PerformanceUpload';
import BonusCalculator from './pages/admin/BonusCalculator';
import AdminArticles from './pages/admin/AdminArticles';
import TalentSearch from './pages/admin/TalentSearch';

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
  const { theme, toggleTheme } = useThemeStore();
  const { signOut } = useAuthStore();
  const { isOpen } = useSidebarStore();
  const location = useLocation();

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
    <div className={`flex min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black' : 'bg-white'}`}>
      <AdminSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-[240px]' : 'ml-[80px]'}`}>
        <header className={`flex items-center justify-between h-16 px-6 border-b sticky top-0 z-30 backdrop-blur ${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800' : 'bg-white/80 border-meta-gray-200'} transition-colors duration-500`}>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{getPageTitle()}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`rounded-full p-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-yellow-400 hover:bg-meta-gray-700' : 'bg-meta-gray-100 text-meta-blue hover:bg-meta-gray-200'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={signOut}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'text-meta-gray-300 hover:text-red-500 hover:bg-meta-gray-800' : 'text-meta-gray-600 hover:text-red-500 hover:bg-meta-gray-100'} transition-colors`}
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        </header>

        <main className={`flex-1 transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-br from-meta-black via-meta-gray-900/80 to-meta-black/90' : 'bg-gradient-to-br from-white via-meta-gray-100 to-white'} overflow-y-auto`}>
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
      </div>
      {!isAdminRoute && <Footer />}
      <ScrollToTop />
    </>
  );
}

export default AppRoutes; 