import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Enable session persistence and auto-refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Listen for auth state changes and update the store if needed
supabase.auth.onAuthStateChange((event, session) => {
  // Optionally, you can trigger a global event or update zustand store here
  // For example: window.dispatchEvent(new CustomEvent('supabase-auth', { detail: { event, session } }));
});

// Auth helpers
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Centralized Creator Management System
// This ensures consistent TikTok Creator ID handling across all modules
export const findOrCreateCreator = async (creatorData) => {
  const { creator_id, username_tiktok, ...otherData } = creatorData;
  
  try {
    let dbCreator = null;
    
    // CRITICAL: Ensure we have either TikTok Creator ID or username
    if (!creator_id && !username_tiktok) {
      throw new Error('Must provide either creator_id or username_tiktok');
    }
    
    // Step 1: Try to find by TikTok Creator ID (most reliable)
    if (creator_id) {
      try {
        const { data: foundById, error: errById } = await supabase
          .from('creators')
          .select('*')
          .eq('creator_id', creator_id)
          .maybeSingle(); // Use maybeSingle to handle no results gracefully
        
        if (foundById && !errById) {
          dbCreator = foundById;
          console.log(`✅ Found creator by TikTok ID: ${creator_id} (UUID: ${dbCreator.id})`);
        } else if (errById) {
          console.warn(`⚠️ Error searching by TikTok ID ${creator_id}:`, errById);
        }
      } catch (error) {
        console.warn(`⚠️ Supabase error searching by TikTok ID ${creator_id}:`, error);
      }
    }
    
    // Step 2: If not found by ID, try to find by username
    if (!dbCreator && username_tiktok) {
      try {
        const { data: foundByUsername, error: errByUsername } = await supabase
          .from('creators')
          .select('*')
          .eq('username_tiktok', username_tiktok)
          .maybeSingle(); // Use maybeSingle to handle no results gracefully
        
        if (foundByUsername && !errByUsername) {
          dbCreator = foundByUsername;
          console.log(`✅ Found creator by username: ${username_tiktok} (UUID: ${dbCreator.id})`);
          
          // CRITICAL: If we found by username but creator_id is NULL or different, update it
          if (creator_id && (!dbCreator.creator_id || dbCreator.creator_id !== creator_id)) {
            console.log(`🔄 Updating TikTok Creator ID from ${dbCreator.creator_id} to ${creator_id}`);
            const { error: updateError } = await supabase
              .from('creators')
              .update({ creator_id })
              .eq('id', dbCreator.id);
            
            if (!updateError) {
              dbCreator.creator_id = creator_id;
            } else {
              console.error('❌ Failed to update creator_id:', updateError);
            }
          }
        } else if (errByUsername) {
          console.warn(`⚠️ Error searching by username ${username_tiktok}:`, errByUsername);
        }
      } catch (error) {
        console.warn(`⚠️ Supabase error searching by username ${username_tiktok}:`, error);
      }
    }
    
    // Step 3: If still not found, create new creator
    if (!dbCreator) {
      // Handle creators without TikTok Creator ID (for performance upload)
      if (!creator_id) {
        if (!username_tiktok) {
          throw new Error('Cannot create creator without both TikTok Creator ID and username');
        }
        
        console.warn(`⚠️ Creating creator without TikTok Creator ID: ${username_tiktok}`);
        
        // Generate a temporary placeholder TikTok Creator ID
        const placeholderCreatorId = `TEMP_${username_tiktok}_${Date.now()}`;
        
        const insertData = {
          creator_id: placeholderCreatorId, // Temporary placeholder
          username_tiktok: username_tiktok,
          status: 'needs_tiktok_id', // Flag for missing TikTok Creator ID
          ...otherData
        };
        
        // Remove undefined values
        Object.keys(insertData).forEach(key => {
          if (insertData[key] === undefined) {
            delete insertData[key];
          }
        });
        
        const { data: newCreator, error: insertError } = await supabase
          .from('creators')
          .insert(insertData)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Error creating new creator with placeholder ID:', insertError);
          throw new Error(`Failed to create creator: ${insertError.message}`);
        }
        
        dbCreator = newCreator;
        console.log(`⚠️ Created creator with placeholder TikTok ID: ${username_tiktok} (Placeholder: ${placeholderCreatorId}, UUID: ${dbCreator.id})`);
      } else {
        // Normal creation with TikTok Creator ID
        const insertData = {
          creator_id: creator_id,
          username_tiktok: username_tiktok || null,
          ...otherData
        };
        
        // Remove undefined values
        Object.keys(insertData).forEach(key => {
          if (insertData[key] === undefined) {
            delete insertData[key];
          }
        });
        
        const { data: newCreator, error: insertError } = await supabase
          .from('creators')
          .insert(insertData)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Error creating new creator:', insertError);
          throw new Error(`Failed to create creator: ${insertError.message}`);
        }
        
        dbCreator = newCreator;
        console.log(`✅ Created new creator: ${username_tiktok} (TikTok ID: ${creator_id}, UUID: ${dbCreator.id})`);
      }
    }
    
    // Step 4: Update username if it changed
    if (dbCreator && username_tiktok && dbCreator.username_tiktok !== username_tiktok) {
      console.log(`🔄 Username changed: ${dbCreator.username_tiktok} → ${username_tiktok}`);
      
      // Log to username_history
      await supabase.from('username_history').insert({
        creator_id: dbCreator.id,
        old_username: dbCreator.username_tiktok,
        new_username: username_tiktok,
        changed_at: new Date().toISOString()
      });
      
      // Update creators table
      const { error: updateError } = await supabase
        .from('creators')
        .update({ username_tiktok })
        .eq('id', dbCreator.id);
      
      if (!updateError) {
        dbCreator.username_tiktok = username_tiktok;
      }
    }
    
    // Step 5: Update other fields if provided
    if (dbCreator && Object.keys(otherData).length > 0) {
      const updateData = { ...otherData };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('creators')
          .update(updateData)
          .eq('id', dbCreator.id);
        
        if (!updateError) {
          Object.assign(dbCreator, updateData);
        }
      }
    }
    
    // FINAL VALIDATION: Warn if creator has placeholder TikTok Creator ID
    if (dbCreator.creator_id && dbCreator.creator_id.startsWith('TEMP_')) {
      console.warn(`⚠️ Creator ${dbCreator.username_tiktok} has placeholder TikTok Creator ID: ${dbCreator.creator_id}`);
    }
    
    console.log(`🎯 FINAL RESULT: Creator ${dbCreator.username_tiktok} | TikTok ID: ${dbCreator.creator_id} | UUID: ${dbCreator.id}`);
    
    return { creator: dbCreator, error: null };
    
  } catch (error) {
    console.error('❌ Error in findOrCreateCreator:', error);
    return { creator: null, error };
  }
};

// Helper function to get creator by TikTok ID
export const getCreatorByTikTokId = async (creatorId) => {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('creator_id', creatorId)
    .single();
  
  return { creator: data, error };
};

// Helper function to get creator by username
export const getCreatorByUsername = async (username) => {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('username_tiktok', username)
    .single();
  
  return { creator: data, error };
};

// Helper function to get all creators with performance data
export const getCreatorsWithPerformance = async (limit = 100) => {
  const { data, error } = await supabase
    .from('creators')
    .select(`
      *,
      creator_performance (
        diamonds,
        valid_days,
        live_hours,
        period_month,
        period_year
      ),
      bonus_calculations (
        bonus_amount_idr,
        payment_status,
        month,
        year
      )
    `)
    .order('followers_count', { ascending: false })
    .limit(limit);
  
  return { creators: data, error };
};

// Database helpers
export const getPublicTalents = async (filters = {}) => {
  let query = supabase
    .from('talent_profiles')
    .select('*, users!inner(email)')
    .eq('status', 'active');

  if (filters.category) {
    query = query.eq('konten_kategori', filters.category);
  }

  if (filters.minFollowers) {
    query = query.gte('followers_count', filters.minFollowers);
  }

  if (filters.searchTerm) {
    query = query.ilike('username_tiktok', `%${filters.searchTerm}%`);
  }

  const { data, error } = await query.order('followers_count', { ascending: false });
  return { data, error };
};

export const getArticles = async (filters = {}) => {
  let query = supabase
    .from('articles')
    .select(`
      *,
      categories:article_category_relations(
        category:article_categories(*)
      )
    `)
    .not('published_at', 'is', null)
    .eq('access', 'public');

  if (filters.category) {
    query = query.contains('categories', [{ category: { slug: filters.category } }]);
  }

  if (filters.searchTerm) {
    query = query.or(`title.ilike.%${filters.searchTerm}%,excerpt.ilike.%${filters.searchTerm}%`);
  }

  const { data, error } = await query.order('published_at', { ascending: false });
  return { data, error };
};

export const getTalentPerformance = async (talentId, limit = 12) => {
  const { data, error } = await supabase
    .from('talent_performance')
    .select(`
      *,
      report:performance_reports(*)
    `)
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

export const submitRegistration = async (formData) => {
  const { data, error } = await supabase
    .from('registrations')
    .insert([formData])
    .select()
    .single();

  return { data, error };
};

// Real-time subscriptions
export const subscribeToArticles = (callback) => {
  const subscription = supabase
    .channel('public:articles')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'articles',
      filter: 'status=eq.published'
    }, callback)
    .subscribe();

  return subscription;
};

export const subscribeToTalentUpdates = (talentId, callback) => {
  const subscription = supabase
    .channel(`talent:${talentId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'talent_performance',
      filter: `talent_id=eq.${talentId}`
    }, callback)
    .subscribe();

  return subscription;
};

// Database cleanup function to fix inconsistent creator IDs
export const cleanupCreatorIds = async () => {
  try {
    console.log('🧹 Starting creator ID cleanup...');
    
    // Step 1: Find creators with duplicate TikTok IDs
    const { data: duplicateCreators, error: duplicateError } = await supabase
      .from('creators')
      .select('creator_id, username_tiktok, id')
      .not('creator_id', 'is', null)
      .order('creator_id');
    
    if (duplicateError) {
      console.error('Error finding duplicates:', duplicateError);
      return { error: duplicateError };
    }
    
    // Group by creator_id to find duplicates
    const duplicates = {};
    duplicateCreators?.forEach(creator => {
      if (!duplicates[creator.creator_id]) {
        duplicates[creator.creator_id] = [];
      }
      duplicates[creator.creator_id].push(creator);
    });
    
    // Step 2: Merge duplicate creators
    let mergedCount = 0;
    for (const [creatorId, creators] of Object.entries(duplicates)) {
      if (creators.length > 1) {
        console.log(`🔄 Merging ${creators.length} creators with TikTok ID: ${creatorId}`);
        
        // Keep the first creator, merge others into it
        const primaryCreator = creators[0];
        const duplicateCreators = creators.slice(1);
        
        for (const duplicate of duplicateCreators) {
          // Update all references to use the primary creator's TikTok ID
          await supabase
            .from('bonus_calculations')
            .update({ creator_id: primaryCreator.creator_id })
            .eq('creator_id', duplicate.creator_id);
          
          await supabase
            .from('creator_performance')
            .update({ creator_id: primaryCreator.creator_id })
            .eq('creator_id', duplicate.creator_id);
          
          await supabase
            .from('username_history')
            .update({ creator_id: primaryCreator.id })
            .eq('creator_id', duplicate.id);
          
          // Delete the duplicate creator
          await supabase
            .from('creators')
            .delete()
            .eq('id', duplicate.id);
          
          mergedCount++;
        }
      }
    }
    
    // Step 3: Find creators with NULL TikTok IDs but have usernames
    const { data: nullIdCreators, error: nullError } = await supabase
      .from('creators')
      .select('id, username_tiktok, creator_id')
      .is('creator_id', null)
      .not('username_tiktok', 'is', null);
    
    if (nullError) {
      console.error('Error finding null ID creators:', nullError);
      return { error: nullError };
    }
    
    // Step 4: Try to find TikTok IDs for creators with NULL IDs
    let updatedCount = 0;
    for (const creator of nullIdCreators || []) {
      // Look for creators with the same username but different TikTok ID
      const { data: sameUsernameCreators } = await supabase
        .from('creators')
        .select('id, creator_id, username_tiktok')
        .eq('username_tiktok', creator.username_tiktok)
        .not('creator_id', 'is', null);
      
      if (sameUsernameCreators && sameUsernameCreators.length > 0) {
        const foundCreator = sameUsernameCreators[0];
        console.log(`🔄 Updating creator ${creator.username_tiktok} with TikTok ID: ${foundCreator.creator_id}`);
        
        // Update the NULL ID creator with the found TikTok ID
        await supabase
          .from('creators')
          .update({ creator_id: foundCreator.creator_id })
          .eq('id', creator.id);
        
        updatedCount++;
      }
    }
    
    console.log(`✅ Cleanup complete: Merged ${mergedCount} duplicates, Updated ${updatedCount} NULL IDs`);
    return { 
      success: true, 
      mergedCount, 
      updatedCount,
      message: `Cleanup complete: Merged ${mergedCount} duplicates, Updated ${updatedCount} NULL IDs`
    };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return { error };
  }
}; 