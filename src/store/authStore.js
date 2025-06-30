import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Professional Authentication Store - Production Ready
const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  // Initialize auth state - Clean and Simple
  initialize: async () => {
    try {
      console.log('🔐 Initializing authentication...');
      set({ loading: true, error: null });

      // Check for stored admin session
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        try {
          const sessionData = JSON.parse(adminSession);
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionAge < maxAge) {
            console.log('✅ Restoring admin session');
            set({
              user: sessionData.user,
              profile: sessionData.profile,
              loading: false
            });
            return;
          } else {
            localStorage.removeItem('adminSession');
          }
        } catch (e) {
          localStorage.removeItem('adminSession');
        }
      }

      // Check Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('✅ Supabase user found');
        const profile = {
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0] || 'User',
          role: 'user'
        };
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }

    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Sign in - Works with both admin and regular users
  signIn: async (email, password) => {
    try {
      console.log('🔐 Signing in:', email);
      set({ loading: true, error: null });

      // Try admin authentication first
      const { data: adminList, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email);

      if (!adminError && adminList && adminList.length > 0) {
        const admin = adminList[0];
        
        if (admin.password_hash === password) {
          console.log('✅ Admin login successful');
          
          const adminUser = {
            id: admin.id,
            email: admin.email
          };
          
          const adminProfile = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          };

          // Store session
          const sessionData = {
            user: adminUser,
            profile: adminProfile,
            timestamp: Date.now()
          };
          localStorage.setItem('adminSession', JSON.stringify(sessionData));

          set({
            user: adminUser,
            profile: adminProfile,
            loading: false
          });

          return { success: true };
        }
      }

      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.user) {
        console.log('✅ Supabase login successful');
        
        const profile = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split('@')[0] || 'User',
          role: 'user'
        };

        set({
          user: data.user,
          profile,
          loading: false
        });

        return { success: true };
      }

      // Authentication failed
      set({
        loading: false,
        error: 'Invalid email or password'
      });
      return { success: false, error: 'Invalid email or password' };

    } catch (error) {
      console.error('❌ Sign in error:', error);
      set({
        error: error.message,
        loading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('🚪 Signing out...');
      
      // Clear admin session
      localStorage.removeItem('adminSession');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      set({
        user: null,
        profile: null,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAuthStore;