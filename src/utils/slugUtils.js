// Utility functions for generating and handling article slugs

export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace Indonesian characters
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-');
};

export const validateSlug = (slug) => {
  const validSlugPattern = /^[a-z0-9-]+$/;
  return validSlugPattern.test(slug) && slug.length >= 3;
};

export const isSlugUnique = async (slug, articleId = null, supabase) => {
  if (!slug || !supabase) return false;
  
  let query = supabase
    .from('articles')
    .select('id')
    .eq('slug', slug);
  
  // Exclude current article when editing
  if (articleId) {
    query = query.neq('id', articleId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking slug uniqueness:', error);
    return false;
  }
  
  return data.length === 0;
};

export const generateUniqueSlug = async (title, articleId = null, supabase) => {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await isSlugUnique(slug, articleId, supabase))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loops
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
};

export const previewSlugUrl = (slug) => {
  return `/articles/${slug}`;
};