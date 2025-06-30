import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, AlertTriangle, CheckCircle, Loader2, UserCheck, Zap, Globe } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import EnhancedInput from '../../components/common/EnhancedInput';
import Toast from '../../components/common/Toast';

const EnhancedLoginPage = () => {
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
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info', title: '' });

  // Hooks
  const navigate = useNavigate();
  const { signIn, profile, user } = useAuthStore();
  const { theme } = useThemeStore();

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRemember) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }

    // Check session expiry
    const adminSessionStart = localStorage.getItem('adminSessionStart');
    if (adminSessionStart) {
      const sessionAge = Date.now() - parseInt(adminSessionStart);
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours
      if (sessionAge < maxAge) {
        setSessionExpiry(new Date(parseInt(adminSessionStart) + maxAge));
      }
    }

    // Check if user is blocked
    const blockEnd = localStorage.getItem('loginBlockEnd');
    if (blockEnd && Date.now() < parseInt(blockEnd)) {
      setIsBlocked(true);
      setBlockTime(parseInt(blockEnd));
    }
  }, []);

  // Block timer
  useEffect(() => {
    if (isBlocked && blockTime) {
      const timer = setInterval(() => {
        if (Date.now() >= blockTime) {
          setIsBlocked(false);
          setBlockTime(0);
          setAttempts(0);
          localStorage.removeItem('loginBlockEnd');
          localStorage.removeItem('loginAttempts');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTime]);

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

  // Handle failed login attempts
  const handleFailedAttempt = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts.toString());
    
    if (newAttempts >= 5) {
      const blockEnd = Date.now() + (15 * 60 * 1000); // 15 minutes
      setIsBlocked(true);
      setBlockTime(blockEnd);
      localStorage.setItem('loginBlockEnd', blockEnd.toString());
      setError('Too many failed attempts. Please try again in 15 minutes.');
    }
  }, [attempts]);

  // Main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) {
      showToast('Account temporarily blocked. Please wait.', 'error', 'Blocked');
      return;
    }
    if (!validateForm()) {
      showToast('Please fix the form errors.', 'error', 'Validation Error');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { success, error: authError } = await signIn(formData.email, formData.password);
      if (success) {
        setAttempts(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockEnd');
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        setLoginSuccess(true);
        showToast('Login successful! Redirecting...', 'success', 'Success');
      } else {
        handleFailedAttempt();
        showToast(authError || 'Invalid email or password. Please try again.', 'error', 'Login Failed');
      }
    } catch (err) {
      handleFailedAttempt();
      showToast('An unexpected error occurred. Please try again.', 'error', 'Error');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get remaining block time
  const getRemainingBlockTime = () => {
    if (!isBlocked || !blockTime) return '';
    const remaining = Math.ceil((blockTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
              Login Successful!
            </h2>
            <p className={`mt-2 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
              Redirecting to {profile?.role === 'admin' ? 'admin' : 'your'} dashboard...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const showToast = useCallback((message, type = 'info', title = '') => {
    setToast({ isVisible: true, message, type, title });
  }, []);

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
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-sm transition-colors duration-500 ${
              theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'
            }`}
          >
            Sign in to access your Meta Agency dashboard
          </motion.p>
        </div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Session Status */}
          {sessionExpiry && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <span className="font-medium text-blue-800">Active Session</span>
                <div className="text-blue-600">
                  Expires: {sessionExpiry.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Quick Admin Login */}
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
              Need quick access?
            </span>
            <button
              type="button"
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="text-sm text-meta-blue hover:text-meta-blue-dark font-medium transition-colors"
            >
              Admin Demo
            </button>
          </div>

          <AnimatePresence>
            {showQuickLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-r from-meta-blue/10 to-meta-blue/5 border border-meta-blue/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-meta-blue" />
                    <span className="font-medium text-meta-blue">Demo Admin Access</span>
                  </div>
                  <p className="text-sm text-meta-gray-600">
                    Click below to instantly login as admin for testing purposes
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast('Admin login functionality removed', 'info', 'Info')}
                    disabled={isLoading || isBlocked}
                    className="w-full bg-meta-blue text-white py-2 px-4 rounded-lg hover:bg-meta-blue-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Quick Admin Login</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Login Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Block Warning */}
          <AnimatePresence>
            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
              >
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Account Temporarily Blocked</h4>
                  <p className="text-sm text-red-600 mt-1">
                    Too many failed login attempts. Try again in {getRemainingBlockTime()}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error */}
          <AnimatePresence>
            {error && !isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`bg-red-50 border border-red-200 rounded-lg p-4 text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                {attempts > 0 && attempts < 5 && (
                  <div className="mt-2 text-xs text-red-500">
                    Failed attempts: {attempts}/5
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <EnhancedInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={validationErrors.email}
            placeholder="Enter your email"
            autoComplete="email"
            required
            disabled={isLoading || isBlocked}
            hint="Use admin@metaagency.id for demo access"
          />

          {/* Password Input */}
          <EnhancedInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={validationErrors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isLoading || isBlocked}
            hint="Use admin123 for demo access"
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                disabled={isLoading || isBlocked}
                className="h-4 w-4 rounded border-gray-300 text-meta-blue focus:ring-meta-blue transition-colors"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
                Remember me
              </span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-meta-blue hover:text-meta-blue-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || isBlocked}
            whileHover={{ scale: isLoading || isBlocked ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || isBlocked ? 1 : 0.98 }}
            className="w-full bg-meta-blue text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-meta-blue-dark focus:outline-none focus:ring-2 focus:ring-meta-blue/50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </motion.button>

          {/* Alternative Actions */}
          <div className="text-center space-y-4">
            <div className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/join" className="font-medium text-meta-blue hover:text-meta-blue-dark">
                Join as talent
              </Link>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Globe className="h-4 w-4 text-meta-gray-400" />
              <select className={`bg-transparent border-none text-sm ${
                theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'
              }`}>
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-meta-gray-400 space-y-2"
        >
          <p>Powered by Meta Agency</p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/privacy" className="hover:text-meta-blue transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-meta-blue transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          isVisible={toast.isVisible}
          onClose={() => setToast(t => ({ ...t, isVisible: false }))}
          duration={4000}
          position="top-right"
        />
      )}
    </div>
  );
};

export default EnhancedLoginPage;