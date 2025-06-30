import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { debugAuth } from '../utils/authDebug';

// Bulletproof authentication store for presentation
const useNewAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  debugMode: true, // Enable for presentation debugging

  // Debug logging
  log: (message, data = null) => {
    if (get().debugMode) {
      console.log(`🔐 AUTH: ${message}`, data || '');
    }
  },

  // Initialize auth state - BULLETPROOF VERSION
  initialize: async () => {
    const { log } = get();
    log('Starting initialization...');
    
    try {
      set({ loading: true, error: null });

      // Step 1: Test connection first
      const connectionTest = await debugAuth.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Database connection failed: ${connectionTest.error}`);
      }
      log('✅ Database connection verified');

      // Step 2: Check for existing admin session
      const adminSession = localStorage.getItem('adminSessionStart');
      const adminEmail = localStorage.getItem('adminEmail');
      const adminId = localStorage.getItem('adminId');
      const adminName = localStorage.getItem('adminName');

      if (adminSession && adminEmail && adminId) {
        const sessionAge = Date.now() - parseInt(adminSession);
        const maxAge = 8 * 60 * 60 * 1000; // 8 hours for presentation
        
        if (sessionAge < maxAge) {
          log('🔑 Restoring admin session');
          
          const adminUser = {
            id: adminId,
            email: adminEmail,
            role: 'admin'
          };
          
          const adminProfile = {
            id: adminId,
            user_id: adminId,
            name: adminName || 'Admin',
            email: adminEmail,
            role: 'admin',
            created_at: new Date().toISOString()
          };
          
          set({ user: adminUser, profile: adminProfile, loading: false });
          log('✅ Admin session restored');
          return;
        } else {
          log('⏰ Admin session expired, clearing...');
          localStorage.removeItem('adminSessionStart');
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminId');
          localStorage.removeItem('adminName');
        }
      }

      // Step 3: Check Supabase auth for regular users
      log('🔍 Checking Supabase auth...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        log('✅ Supabase user found, fetching profile...');
        await get().fetchProfile(user.id);
      } else {
        log('ℹ️ No authenticated user found');
      }
      
      set({ user, loading: false });
      
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch user profile - FIXED for your Supabase setup
  fetchProfile: async (userId) => {
    const { log } = get();
    
    try {
      log('Fetching profile for user:', userId);
      
      // Since users table doesn't exist, try to get profile directly from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        log('❌ No authenticated user found');
        return;
      }

      // For Supabase auth users, create a basic profile
      const profile = {
        id: user.id,
        user_id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email,
        role: 'talent', // Default role for Supabase users
        created_at: user.created_at
      };

      set({ profile });
      log('✅ Profile created for Supabase user:', profile?.role);
      
    } catch (error) {
      log('❌ Profile fetch error:', error.message);
      // Don't set error for profile fetch failures
      log('ℹ️ Continuing without profile...');
    }
  },

  // BULLETPROOF SIGN IN - FIXED for your setup
  signIn: async (email, password) => {
    const { log } = get();
    log('Starting sign in for:', email);
    
    try {
      set({ loading: true, error: null });

      // Step 1: Try admin authentication first (with your actual data)
      log('🔍 Checking admin credentials...');
      
      try {
        const { data: adminList, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email);

        if (!adminError && adminList && adminList.length > 0) {
          const adminData = adminList[0];
          
          if (adminData.password_hash === password) {
            log('✅ Admin authentication successful');
            
            const adminUser = {
              id: adminData.id,
              email: adminData.email,
              role: 'admin'
            };
            
            const adminProfile = {
              id: adminData.id,
              user_id: adminData.id,
              name: adminData.name,
              email: adminData.email,
              role: 'admin',
              created_at: adminData.created_at
            };

            // Store session data
            const timestamp = Date.now().toString();
            localStorage.setItem('adminSessionStart', timestamp);
            localStorage.setItem('adminEmail', adminData.email);
            localStorage.setItem('adminName', adminData.name);
            localStorage.setItem('adminId', adminData.id);
            
            log('💾 Admin session stored');

            set({ 
              user: adminUser, 
              profile: adminProfile, 
              loading: false 
            });
            
            return { success: true };
          }
        }
      } catch (adminErr) {
        log('⚠️ Admin auth check failed:', adminErr.message);
      }

      // Step 2: Try regular Supabase auth
      log('🔍 Trying Supabase authentication...');
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!error && data.user) {
          log('✅ Supabase authentication successful');
          
          await get().fetchProfile(data.user.id);
          set({ user: data.user, loading: false });
          
          return { success: true };
        }
        
        if (error) {
          log('❌ Supabase auth failed:', error.message);
        }
      } catch (supabaseErr) {
        log('⚠️ Supabase auth error:', supabaseErr.message);
      }

      // All authentication methods failed
      const errorMsg = `Authentication failed for ${email}`;
      log('❌', errorMsg);
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
      
    } catch (error) {
      const errorMsg = `Sign in error: ${error.message}`;
      log('❌', errorMsg);
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Sign out
  signOut: async () => {
    const { log } = get();
    log('Starting sign out...');
    
    try {
      set({ loading: true });
      
      // Clear admin session data
      localStorage.removeItem('adminSessionStart');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');
      
      // Clear remember me data
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
      
      // Sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'User not logged in') {
          log('⚠️ Supabase signout warning:', error.message);
        }
      } catch (supabaseError) {
        log('ℹ️ Supabase signout skipped (admin user)');
      }
      
      set({ user: null, profile: null, loading: false, error: null });
      log('✅ Sign out successful');
      return { success: true };
      
    } catch (error) {
      log('❌ Sign out error:', error.message);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Run diagnostics (for debugging)
  runDiagnostics: async () => {
    const { log } = get();
    log('Running diagnostics...');
    
    const results = await debugAuth.runDiagnostics();
    log('Diagnostic results:', results);
    return results;
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Toggle debug mode
  toggleDebug: () => set(state => ({ debugMode: !state.debugMode })),
}));

export default useNewAuthStore;