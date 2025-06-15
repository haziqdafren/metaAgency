import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
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
      author:users!author_id(email),
      categories:article_category_relations(
        category:article_categories(*)
      )
    `)
    .eq('status', 'published');

  if (filters.category) {
    query = query.contains('categories', [{ category: { slug: filters.category } }]);
  }

  if (filters.searchTerm) {
    query = query.or(`judul.ilike.%${filters.searchTerm}%,excerpt.ilike.%${filters.searchTerm}%`);
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