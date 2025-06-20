import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { theme } = useThemeStore();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error || !data) {
        setError('Article not found.');
      } else {
        setArticle(data);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center min-h-[300px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-meta-blue"></div></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!article) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen pt-24 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-white text-meta-black'}`}
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6">
          <Link to="/articles" className="text-meta-blue hover:underline">&larr; Back to Articles</Link>
        </div>
        {article.image_url && (
          <img src={article.image_url} alt={article.judul} className="w-full rounded-xl mb-6 object-cover max-h-96" />
        )}
        <h1 className="text-4xl font-bold mb-4">{article.judul}</h1>
        <div className="flex items-center gap-4 mb-6 text-sm text-meta-gray-500 dark:text-meta-gray-400">
          <span>{new Date(article.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {article.category_id && (
            <span className="px-3 py-1 rounded-full bg-meta-blue/10 text-meta-blue text-xs font-semibold">{article.category_id}</span>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </motion.div>
  );
};

export default ArticleDetail; 