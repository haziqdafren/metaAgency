import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await get().fetchProfile(user.id);
      }
      
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch user profile based on role
  fetchProfile: async (userId) => {
    try {
      // First get the user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let profile = null;

      if (userData.role === 'talent') {
        const { data, error } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        profile = { ...data, role: 'talent' };
      } else if (userData.role === 'admin' || userData.role === 'superadmin') {
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        profile = { ...data, role: userData.role };
      }

      set({ profile });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      // First check if it's an admin user
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (adminData) {
        // Admin user found - check password
        if (adminData.password_hash === password) {
          // Create a mock user object for admin
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

          // Set session timestamp for admin login
          localStorage.setItem('adminSessionStart', Date.now().toString());

          set({ 
            user: adminUser, 
            profile: adminProfile, 
            loading: false 
          });
          
          return { success: true };
        } else {
          throw new Error('Invalid password');
        }
      }

      // If not admin, try regular Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await get().fetchProfile(data.user.id);
      set({ user: data.user, loading: false });
      
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign up
  signUp: async (email, password, metadata = {}) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true });
      // Remove admin session timestamp on sign out
      localStorage.removeItem('adminSessionStart');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ user: null, profile: null, loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const { profile } = get();
      if (!profile) throw new Error('No profile found');

      const table = profile.role === 'talent' ? 'talent_profiles' : 'admin_profiles';
      
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: { ...profile, ...data } });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore; 