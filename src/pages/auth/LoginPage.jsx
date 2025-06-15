import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, profile, user } = useAuthStore();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (loginSuccess && profile) {
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'talent') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [loginSuccess, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { success, error } = await signIn(email, password);
      if (success) {
        setLoginSuccess(true);
      } else {
        setError(error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
            Masuk ke Akun Anda
          </h2>
          <p className={`mt-2 text-center text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
            Atau{' '}
            <Link to="/join" className="font-medium text-meta-blue hover:text-cyan-500">
              daftar sebagai talent baru
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm ${theme === 'dark' ? 'text-red-500' : 'text-red-600'}`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-meta-blue' : 'bg-white border-meta-gray-200 text-meta-blue'}`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
                Ingat saya
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-meta-blue hover:text-cyan-500">
                Lupa password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 px-4 text-base font-medium"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage; 