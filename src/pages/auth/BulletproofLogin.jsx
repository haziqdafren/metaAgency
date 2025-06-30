import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserCheck, AlertTriangle, CheckCircle, Bug, RefreshCw } from 'lucide-react';
import useNewAuthStore from '../../store/newAuthStore';
import useThemeStore from '../../store/themeStore';

const BulletproofLogin = () => {
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
  const [showPassword, setShowPassword] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { signIn, profile, user, runDiagnostics, debugMode, toggleDebug } = useNewAuthStore();
  const { theme } = useThemeStore();

  // Debug console
  const log = useCallback((message, data = null) => {
    console.log(`🔐 LOGIN: ${message}`, data || '');
  }, []);

  // Check if already logged in
  useEffect(() => {
    if (user && profile) {
      log('User already logged in, redirecting...', { role: profile.role });
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'talent') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, navigate, log]);

  // Auto-redirect on successful login
  useEffect(() => {
    if (loginSuccess && profile) {
      log('Login successful, redirecting immediately', { role: profile.role });
      
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'talent') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [loginSuccess, profile, navigate, log]);

  // Load saved credentials
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
  }, []);

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
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  }, [validationErrors, error]);

  // Quick fill buttons for testing (using actual admin credentials)
  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@metaagency.com',
      password: '@Adminmeta',
      rememberMe: false
    });
  };

  const fillAdmin2Credentials = () => {
    setFormData({
      email: 'admin@metaagency1.com',
      password: '@Adminmeta1',
      rememberMe: false
    });
  };

  // Run diagnostics
  const handleRunDiagnostics = async () => {
    log('Running comprehensive diagnostics...');
    setIsLoading(true);
    try {
      const results = await runDiagnostics();
      setDiagnostics(results);
      setShowDiagnostics(true);
      log('Diagnostics complete', results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    log('Form submission started', { email: formData.email });
    
    if (!validateForm()) {
      log('❌ Form validation failed');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      log('🔑 Attempting sign in...');
      
      const { success, error: authError } = await signIn(formData.email, formData.password);
      
      if (success) {
        log('✅ Sign in successful');
        
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
        log('❌ Sign in failed', { error: authError });
        setError(authError || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      log('💥 Login error', { error: err.message });
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
            Meta Agency Login
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-sm transition-colors duration-500 ${
              theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'
            }`}
          >
            Sign in to access your dashboard
          </motion.p>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">Debug Mode</span>
              <button
                onClick={toggleDebug}
                className="text-blue-600 hover:text-blue-800"
              >
                Hide
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={fillAdminCredentials}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600"
              >
                Fill Admin 1 (admin@metaagency.com)
              </button>
              
              <button
                onClick={fillAdmin2Credentials}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
              >
                Fill Admin 2 (admin@metaagency1.com)
              </button>
              
              <button
                onClick={handleRunDiagnostics}
                disabled={isLoading}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded text-sm hover:bg-purple-600 flex items-center justify-center space-x-2"
              >
                <Bug className="w-4 h-4" />
                <span>Run Diagnostics</span>
              </button>
            </div>
            
            {diagnostics && (
              <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Login Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Error Display */}
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
                  <span className="text-red-600">{error}</span>
                </div>
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
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
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
                placeholder="Enter your password"
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

          {/* Remember Me */}
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
                Remember me
              </span>
            </label>

            {!debugMode && (
              <button
                type="button"
                onClick={toggleDebug}
                className="text-sm text-meta-blue hover:text-meta-blue-dark flex items-center space-x-1"
              >
                <Bug className="w-4 h-4" />
                <span>Debug</span>
              </button>
            )}
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5" />
                <span>Sign In</span>
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
          <p>Meta Agency - Presentation Ready Authentication</p>
          <div className="text-xs space-y-1">
            <div>Admin 1: admin@metaagency.com / @Adminmeta</div>
            <div>Admin 2: admin@metaagency1.com / @Adminmeta1</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BulletproofLogin;