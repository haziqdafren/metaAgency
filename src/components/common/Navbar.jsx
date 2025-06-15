import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang Kami', href: '/about' },
  {
    label: 'Layanan',
    href: '/services',
    children: [
      { label: 'Manajemen Talent', href: '/services#talent-management' },
      { label: 'Edukasi Creator', href: '/services#education' },
      { label: 'Fasilitasi Endorsement', href: '/services#endorsement' },
      { label: 'Analitik Performa', href: '/services#analytics' },
    ],
  },
  { label: 'Artikel', href: '/articles' },
  { label: 'Gabung Talent', href: '/join' },
  { label: 'Kontak', href: '/contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location]);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? theme === 'dark'
              ? 'bg-black/95 backdrop-blur-safari shadow-lg'
              : 'bg-white/95 backdrop-blur-safari shadow-lg'
            : theme === 'dark'
            ? 'bg-transparent'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-black font-black text-xl">M</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-meta-blue to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <div>
                <h1 className={`font-display font-black text-xl leading-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                  META
                </h1>
                <p className={`text-xs transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-800'}`}>AGENCY</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
              >
                Beranda
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
              >
                Tentang
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
              >
                Layanan
              </Link>
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'Artikel' ? null : 'Artikel')}
                  className={`flex items-center text-sm font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}
                  ${openDropdown === 'Artikel' ? (theme === 'dark' ? 'text-white' : 'text-meta-black') : ''}
                  `}
                >
                  Artikel <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${openDropdown === 'Artikel' ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'Artikel' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-black/95 text-white' : 'bg-white text-meta-black border border-gray-200'}`}
                    >
                      <Link
                        to="/articles"
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        Semua Artikel
                      </Link>
                      <Link
                        to="/bonus"
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        Bonus
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
              >
                Kontak
              </Link>
            </div>

            {/* Auth Section & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-meta-gray-300 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-safari rounded-lg shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to={profile?.role === 'talent' ? '/talent/dashboard' : '/admin'}
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-meta-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-meta-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/join"
                    className="btn btn-primary px-5 py-2.5 text-base shadow-md"
                  >
                    Gabung Sekarang
                  </Link>
                </>
              )}
              <button
                onClick={toggleTheme}
                className={`rounded-full p-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-yellow-400 hover:bg-meta-gray-700' : 'bg-meta-gray-100 text-meta-blue hover:bg-meta-gray-200'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden rounded-lg p-2 transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white hover:bg-meta-gray-800' : 'text-meta-gray-800 hover:text-meta-black hover:bg-meta-gray-100'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50' : 'bg-meta-gray-200/80'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-full backdrop-blur-safari transition-colors duration-500 ${theme === 'dark' ? 'bg-black/95' : 'bg-white/95'}`}>
              <div className="p-6 pt-24 space-y-4">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                          className={`flex items-center justify-between w-full text-left py-2 text-base font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}
                          ${openDropdown === item.label ? (theme === 'dark' ? 'text-white' : 'text-meta-black') : ''}
                          `}
                        >
                          {item.label}
                          <ChevronDown className={`ml-2 h-5 w-5 transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        <AnimatePresence>
                          {openDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 space-y-2 ml-4 border-l border-gray-400 pl-4"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  to={child.href}
                                  className={`block py-1 text-sm font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-gray-700 hover:text-meta-black'}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`block py-2 text-base font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                {user ? (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <Link
                      to={profile?.role === 'talent' ? '/dashboard' : '/admin'}
                      className={`flex items-center space-x-2 py-2 text-base font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className={`flex items-center space-x-2 w-full text-left py-2 text-base font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-red-500' : 'text-meta-gray-800 hover:text-red-500'}`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <Link
                      to="/join"
                      className="w-full text-center py-2.5 px-5 bg-meta-blue text-white rounded-lg text-base font-semibold shadow-md hover:bg-meta-blue/90 transition"
                    >
                      Gabung Sekarang
                    </Link>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-center rounded-full p-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-yellow-400 hover:bg-meta-gray-700' : 'bg-meta-gray-100 text-meta-blue hover:bg-meta-gray-200'}`}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 