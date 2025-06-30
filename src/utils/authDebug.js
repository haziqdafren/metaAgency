import { supabase } from '../lib/supabase';

// Comprehensive auth debugging utility
export const debugAuth = {
  // Test Supabase connection
  async testConnection() {
    console.log('🔍 Testing Supabase connection...');
    try {
      // Test with admins table since users table doesn't exist
      const { data, error } = await supabase.from('admins').select('count').limit(1);
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return { success: false, error: error.message };
      }
      console.log('✅ Supabase connection successful');
      return { success: true };
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      return { success: false, error: err.message };
    }
  },

  // Test admin table structure
  async testAdminTable() {
    console.log('🔍 Testing admin table...');
    try {
      const { data, error } = await supabase.from('admins').select('*').limit(5);
      if (error) {
        console.error('❌ Admin table access failed:', error);
        return { success: false, error: error.message, data: null };
      }
      console.log('✅ Admin table accessible, found', data?.length, 'records');
      console.log('Admin records:', data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Admin table test failed:', err);
      return { success: false, error: err.message, data: null };
    }
  },

  // Test regular Supabase auth
  async testSupabaseAuth(email, password) {
    console.log('🔍 Testing Supabase authentication for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Supabase auth failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Supabase auth successful:', data.user?.email);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('❌ Supabase auth test failed:', err);
      return { success: false, error: err.message };
    }
  },

  // Test admin credentials
  async testAdminCredentials(email, password) {
    console.log('🔍 Testing admin credentials for:', email);
    try {
      const { data: adminList, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email);

      if (error) {
        console.error('❌ Admin lookup failed:', error);
        return { success: false, error: error.message };
      }

      if (!adminList || adminList.length === 0) {
        console.error('❌ No admin found with email:', email);
        return { success: false, error: 'Admin not found' };
      }

      const adminData = adminList[0]; // Take first match
      console.log('📋 Admin found:', adminData);
      
      // Test password
      if (adminData.password_hash === password) {
        console.log('✅ Admin password correct');
        return { success: true, admin: adminData };
      } else {
        console.error('❌ Admin password incorrect');
        console.log('Expected:', adminData.password_hash);
        console.log('Provided:', password);
        return { success: false, error: 'Invalid password' };
      }
    } catch (err) {
      console.error('❌ Admin credentials test failed:', err);
      return { success: false, error: err.message };
    }
  },

  // Run comprehensive diagnostics
  async runDiagnostics() {
    console.log('🚀 Starting comprehensive auth diagnostics...');
    
    const results = {
      connection: await this.testConnection(),
      adminTable: await this.testAdminTable(),
    };

    // Test with actual admin credentials from database
    results.adminAuth1 = await this.testAdminCredentials('admin@metaagency.com', '@Adminmeta');
    results.adminAuth2 = await this.testAdminCredentials('admin@metaagency1.com', '@Adminmeta1');

    console.log('📊 Diagnostic Results:', results);
    return results;
  },

  // Create emergency admin user
  async createEmergencyAdmin() {
    console.log('🆘 Creating emergency admin user...');
    try {
      const adminData = {
        email: 'admin@metaagency.id',
        password_hash: 'admin123', // In production, this should be hashed
        name: 'Emergency Admin',
        role: 'admin',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('admins')
        .upsert(adminData, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.error('❌ Emergency admin creation failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Emergency admin created/updated:', data);
      return { success: true, admin: data };
    } catch (err) {
      console.error('❌ Emergency admin creation failed:', err);
      return { success: false, error: err.message };
    }
  }
};

export default debugAuth;