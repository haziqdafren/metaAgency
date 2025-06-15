import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const useAuth = (requireAuth = false) => {
  const navigate = useNavigate();
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await initialize();
    };

    initAuth();
  }, [initialize]);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/login', { replace: true });
      } else if (!requireAuth && user) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, requireAuth, navigate]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};

export default useAuth; 