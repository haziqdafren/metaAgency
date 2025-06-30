import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Loader2, UserCheck, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import EnhancedInput from '../../components/common/EnhancedInput';

// Debug log to help with chunk loading issues
console.log('LoginPage component loaded successfully');

const LoginPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { signIn, profile, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    console.log('LoginPage component mounted successfully');
    
    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRemember) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Navigation based on role
  useEffect(() => {
    if (loginSuccess && profile) {
      const timer = setTimeout(() => {
        if (profile.role === 'admin' || profile.role === 'superadmin') {
          navigate('/admin', { replace: true });
        } else if (profile.role === 'talent') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, profile, navigate]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  }, [validationErrors, error]);

  // Quick admin login
  const handleQuickAdminLogin = async () => {
    setFormData({
      email: 'admin@metaagency.id',
      password: 'admin123',
      rememberMe: false
    });
    
    // Auto-submit after setting values
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  // Main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { success, error: authError } = await signIn(formData.email, formData.password);
      
      if (success) {
        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        setLoginSuccess(true);
      } else {
        setAttempts(prev => prev + 1);
        setError(authError || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setAttempts(prev => prev + 1);
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login success animation
  if (loginSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
              Login Berhasil!
            </h2>
            <p className={`mt-2 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
              Mengarahkan ke dashboard {profile?.role === 'admin' ? 'admin' : 'Anda'}...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`text-3xl font-extrabold transition-colors duration-500 ${
              theme === 'dark' ? 'text-white' : 'text-meta-black'
            }`}
          >
            Masuk ke Akun Anda
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-sm transition-colors duration-500 ${
              theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'
            }`}
          >
            Atau{' '}
            <Link to="/join" className="font-medium text-meta-blue hover:text-cyan-500">
              daftar sebagai talent baru
            </Link>
          </motion.p>
        </div>

        {/* Main Login Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* General Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>
                    {error}
                  </span>
                </div>
                {attempts > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    Percobaan gagal: {attempts}/5
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
              theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="enter your email"
                autoComplete="email"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-meta-gray-800/50 border-meta-gray-700 text-white placeholder-meta-gray-500' 
                    : 'bg-white border-meta-gray-300 text-meta-black placeholder-meta-gray-400'
                } ${validationErrors.email 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : 'focus:border-meta-blue focus:ring-2 focus:ring-meta-blue/20'
                } focus:outline-none disabled:opacity-50`}
              />
            </div>
            {validationErrors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center space-x-1"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{validationErrors.email}</span>
              </motion.p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
              theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-meta-gray-800/50 border-meta-gray-700 text-white placeholder-meta-gray-500' 
                    : 'bg-white border-meta-gray-300 text-meta-black placeholder-meta-gray-400'
                } ${validationErrors.password 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : 'focus:border-meta-blue focus:ring-2 focus:ring-meta-blue/20'
                } focus:outline-none disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-meta-gray-500 hover:text-meta-gray-700" />
                ) : (
                  <Eye className="h-5 w-5 text-meta-gray-500 hover:text-meta-gray-700" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center space-x-1"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{validationErrors.password}</span>
              </motion.p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-meta-blue focus:ring-meta-blue transition-colors"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
                Ingat saya
              </span>
            </label>

          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full bg-meta-blue text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-meta-blue-dark focus:outline-none focus:ring-2 focus:ring-meta-blue/50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5" />
                <span>Masuk</span>
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-meta-gray-400 space-y-2"
        >
          <p>Powered by Meta Agency</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 