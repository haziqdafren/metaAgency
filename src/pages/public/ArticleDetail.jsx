import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { Helmet } from 'react-helmet';
import { Calendar, Tag, Eye } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { theme } = useThemeStore();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError('');
      let data = null;
      let error = null;

      console.log('🔍 Fetching article with slug/id:', slug);

      if (!slug) {
        setError('No article identifier provided.');
        setLoading(false);
        return;
      }

      try {
        // First try by slug
        console.log('📝 Trying to fetch by slug:', slug);
        const slugResult = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .not('published_at', 'is', null)
          .eq('access', 'public')
          .maybeSingle();
        
        console.log('📝 Slug result:', slugResult);
        
        if (slugResult.data) {
          data = slugResult.data;
          console.log('✅ Found article by slug:', data.title);
        } else {
          // If slug fetch failed, try by ID (fallback for old URLs or UUID slugs)
          console.log('🔄 Slug not found, trying by ID:', slug);
          const idResult = await supabase
            .from('articles')
            .select('*')
            .eq('id', slug)
            .not('published_at', 'is', null)
            .eq('access', 'public')
            .maybeSingle();
          
          console.log('🆔 ID result:', idResult);
          
          if (idResult.data) {
            data = idResult.data;
            console.log('✅ Found article by ID:', data.title);
          } else {
            console.log('❌ Article not found by slug or ID');
            error = idResult.error || 'Article not found';
          }
        }

        // If we found an article, fetch its category separately
        if (data && data.category_id) {
          console.log('🔄 Fetching category for article...');
          const { data: categoryData, error: categoryError } = await supabase
            .from('article_categories')
            .select('*')
            .eq('id', data.category_id)
            .maybeSingle();
          
          if (categoryData && !categoryError) {
            data.category = categoryData;
            console.log('✅ Added category to article:', categoryData.name);
          } else {
            console.warn('⚠️ Could not fetch category:', categoryError);
            data.category = null;
          }
        }

        if (data) {
          setArticle(data);
          // Increment view count
          try {
            await supabase
              .from('articles')
              .update({ view_count: (data.view_count || 0) + 1 })
              .eq('id', data.id);
            console.log('📈 View count updated for:', data.title);
          } catch (viewError) {
            console.warn('⚠️ Failed to update view count:', viewError);
          }
        } else {
          setError('Article not found or not published.');
        }
      } catch (fetchError) {
        console.error('❌ Error fetching article:', fetchError);
        setError('Error loading article. Please try again.');
      }
      
      setLoading(false);
    };
    
    fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-meta-blue"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-500 py-12">{error}</div>
  );
  
  if (!article) return null;

  return (
    <>
      <Helmet>
        <title>{article.seo_title || article.title} | Meta Agency</title>
        <meta name="description" content={article.seo_description || article.excerpt} />
        {article.seo_keywords?.length > 0 && (
          <meta name="keywords" content={article.seo_keywords.join(', ')} />
        )}
        <meta property="og:title" content={article.seo_title || article.title} />
        <meta property="og:description" content={article.seo_description || article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {article.featured_image && <meta property="og:image" content={article.featured_image} />}
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen pt-24 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-meta-black text-white' : 'bg-white text-meta-black'
        }`}
      >
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-6">
            <Link 
              to="/articles" 
              className="text-meta-blue hover:underline inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2"
            >
              &larr; Back to Articles
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            {article.featured_image && (
              <div className="relative h-[400px] mb-8 rounded-2xl overflow-hidden">
                <img 
                  src={article.featured_image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-meta-gray-500 dark:text-meta-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.view_count || 0} views</span>
              </div>

              {article.type && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="capitalize">{article.type}</span>
                </div>
              )}
            </div>

            {/* Category */}
            {article.category && (
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${theme === 'dark' 
                      ? 'bg-meta-blue/20 text-meta-blue' 
                      : 'bg-meta-blue/10 text-meta-blue'
                    }`}
                >
                  {article.category.name}
                </span>
              </div>
            )}
          </header>

          {/* Article Content */}
          {article.excerpt && (
            <div className={`text-lg mb-8 font-medium
              ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}
            >
              {article.excerpt}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`prose max-w-none mb-12
              ${theme === 'dark' 
                ? 'prose-invert prose-p:text-meta-gray-300 prose-headings:text-white' 
                : 'prose-p:text-meta-gray-600 prose-headings:text-meta-black'
              }
              prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl
              prose-a:text-meta-blue prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </motion.div>
    </>
  );
};

export default ArticleDetail; 