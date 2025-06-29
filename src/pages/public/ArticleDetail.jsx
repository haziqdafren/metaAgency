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
      let data = null;
      let error = null;

      // Try to fetch by slug first
      if (slug) {
        const result = await supabase
          .from('articles')
          .select(`
            *,
            categories:article_category_relations(
              category:article_categories(*)
            )
          `)
          .eq('slug', slug)
          .not('published_at', 'is', null)
          .eq('access', 'public')
          .single();
        
        data = result.data;
        error = result.error;
      }

      // If slug fetch failed, try by ID (fallback for articles without slugs)
      if (!data && slug) {
        const result = await supabase
          .from('articles')
          .select(`
            *,
            categories:article_category_relations(
              category:article_categories(*)
            )
          `)
          .eq('id', slug)
          .not('published_at', 'is', null)
          .eq('access', 'public')
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        setError('Article not found.');
      } else {
        setArticle(data);
        // Increment view count
        await supabase
          .from('articles')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
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
        {article.image_url && <meta property="og:image" content={article.image_url} />}
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
            {article.image_url && (
              <div className="relative h-[400px] mb-8 rounded-2xl overflow-hidden">
                <img 
                  src={article.image_url} 
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

            {/* Categories */}
            {article.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.categories.map(({ category }) => (
                  <Link
                    key={category.id}
                    to={`/articles?category=${category.id}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2
                      ${theme === 'dark' 
                        ? 'bg-meta-blue/20 text-meta-blue hover:bg-meta-blue/30' 
                        : 'bg-meta-blue/10 text-meta-blue hover:bg-meta-blue/20'
                      }`}
                  >
                    {category.name}
                  </Link>
                ))}
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