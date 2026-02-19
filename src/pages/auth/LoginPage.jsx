import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserCheck, AlertTriangle, CheckCircle, Mail, Lock, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signIn, profile, user } = useAuthStore();
  const { theme } = useThemeStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  // Handle successful login redirect
  useEffect(() => {
    if (loginSuccess && profile) {
      const timer = setTimeout(() => {
        if (profile.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, profile, navigate]);

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

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
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
        setError(authError || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (loginSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
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
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Login Successful!
            </h2>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Redirecting to your dashboard...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-meta-black via-meta-gray-900 to-meta-black' 
        : 'bg-gradient-to-br from-meta-gray-50 via-meta-white to-meta-gray-100'
    }`}>
      <div className="max-w-md w-full">
        {/* Card Container */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`${
            theme === 'dark' 
              ? 'bg-meta-gray-800/95 border-meta-gray-700/50' 
              : 'bg-meta-white/95 border-meta-gray-200/50'
          } backdrop-blur-xl rounded-2xl shadow-2xl border p-8 space-y-8`}
        >
          {/* Logo & Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-meta-blue to-cyan-400 flex items-center justify-center shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-meta-blue/80 to-cyan-400/80"></div>
              <Shield className="w-10 h-10 text-meta-white relative z-10" />
            </motion.div>
            
            <div>
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-display font-bold ${
                  theme === 'dark' ? 'text-meta-white' : 'text-meta-black'
                }`}
              >
                Meta Agency
              </motion.h1>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`mt-2 text-sm font-medium ${
                  theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'
                }`}
              >
                Admin Portal Access
              </motion.p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-red-900/30 border-red-500/30' 
                      : 'bg-red-50 border-red-200'
                  } border rounded-xl p-4 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-500'
                      }`} />
                    </div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-red-300' : 'text-red-800'
                    }`}>
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {/* Email Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="email" className={`block text-sm font-display font-semibold mb-3 ${
                  theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-meta-gray-500' : 'text-meta-gray-400'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className={`block w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent transition-all duration-200 font-medium ${
                      theme === 'dark' 
                        ? 'bg-meta-gray-800/50 border-meta-gray-600 text-meta-white placeholder-meta-gray-500' 
                        : 'bg-meta-white border-meta-gray-300 text-meta-black placeholder-meta-gray-400 shadow-sm'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="password" className={`block text-sm font-display font-semibold mb-3 ${
                  theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-meta-gray-500' : 'text-meta-gray-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className={`block w-full pl-12 pr-14 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent transition-all duration-200 font-medium ${
                      theme === 'dark' 
                        ? 'bg-meta-gray-800/50 border-meta-gray-600 text-meta-white placeholder-meta-gray-500' 
                        : 'bg-meta-white border-meta-gray-300 text-meta-black placeholder-meta-gray-400 shadow-sm'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center rounded-r-xl transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'hover:bg-meta-gray-700/50' 
                        : 'hover:bg-meta-gray-50'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-meta-gray-400 hover:text-meta-gray-300' : 'text-meta-gray-400 hover:text-meta-gray-600'
                      }`} />
                    ) : (
                      <Eye className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-meta-gray-400 hover:text-meta-gray-300' : 'text-meta-gray-400 hover:text-meta-gray-600'
                      }`} />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Remember me */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange('rememberMe')}
                  className="h-4 w-4 text-meta-blue focus:ring-meta-blue border-meta-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className={`ml-3 block text-sm font-medium ${
                  theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'
                }`}>
                  Keep me signed in for 24 hours
                </label>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-display font-semibold rounded-xl text-meta-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meta-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] ${
                  isLoading 
                    ? 'bg-meta-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-meta-blue to-cyan-400 hover:from-meta-blue/90 hover:to-cyan-400/90 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5" />
                    <span>Access Admin Portal</span>
                  </div>
                )}
              </button>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <p className={`text-xs ${
                theme === 'dark' ? 'text-meta-gray-500' : 'text-meta-gray-500'
              }`}>
                Protected by Meta Agency Security
              </p>
            </motion.div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className={`rounded-xl border p-4 ${
                theme === 'dark'
                  ? 'bg-meta-blue/5 border-meta-blue/20'
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <p className={`text-xs font-semibold mb-2 ${
                theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'
              }`}>
                Demo Credentials
              </p>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  email: 'admin@metaagency.id',
                  password: 'admin123'
                }))}
                className={`w-full text-left text-xs font-mono rounded-lg px-3 py-2 transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-meta-gray-300'
                    : 'bg-white hover:bg-gray-50 text-meta-gray-700 border border-gray-200'
                }`}
              >
                <span className={`block ${theme === 'dark' ? 'text-meta-gray-500' : 'text-meta-gray-400'}`}>Email</span>
                admin@metaagency.id
                <span className={`block mt-1 ${theme === 'dark' ? 'text-meta-gray-500' : 'text-meta-gray-400'}`}>Password</span>
                admin123
                <span className={`block mt-1.5 text-meta-blue`}>Click to auto-fill →</span>
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;