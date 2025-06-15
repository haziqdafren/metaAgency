import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Calendar, BookOpen, Eye, ArrowRight } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useThemeStore();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('access_level', 'public')
        .order('published_at', { ascending: false });

      console.log('Public Articles Query Result:', { data, error });

      if (error) {
        console.error('Error fetching articles:', error);
        setError(error.message);
      } else {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Articles</h1>
          <p className="text-lg text-meta-gray-600 dark:text-meta-gray-400">
            Discover insights and tips for content creators
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-meta-blue"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-8">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-meta-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      article.content_type === 'article' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {article.content_type}
                    </span>
                    <span className="text-sm text-meta-gray-500 dark:text-meta-gray-400">
                      {new Date(article.published_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-meta-black dark:text-white">
                    {article.judul}
                  </h2>
                  <p className="text-meta-gray-600 dark:text-meta-gray-400 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-meta-gray-500" />
                      <span className="text-sm text-meta-gray-500">
                        {article.view_count} views
                      </span>
                    </div>
                    <Link
                      to={`/articles/${article.slug}`}
                      className="text-meta-blue hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Articles; 