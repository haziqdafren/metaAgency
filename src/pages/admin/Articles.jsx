import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit, Trash2, Search, Eye, X, CheckCircle } from 'lucide-react';

const Articles = () => {
  const { theme } = useThemeStore();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    image_url: '',
    category: '',
    content_type: 'article', // default
    status: 'published', // default
  });

  useEffect(() => {
    fetchArticles();
  }, [searchTerm]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('articles').select('*');

    if (searchTerm) {
      query = query.or(`judul.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    console.log('Admin Articles Query Result:', { data, error });

    if (error) {
      console.error('Error fetching articles:', error);
      setError(error.message);
    } else {
      setArticles(data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadSuccess('');

    try {
      const articleData = {
        judul: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: form.excerpt,
        konten: form.content,
        content_type: form.content_type,
        access_level: form.access_level,
        status: form.status,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
        author_id: '8b32b99c-ba46-465e-81aa-87e2f11e4c19', // Default author ID
      };

      if (currentArticle) {
        // Update article
        const { error } = await supabase.from('articles').update(articleData).eq('id', currentArticle.id);
        if (error) throw error;
      } else {
        // Create new article
        const { error } = await supabase.from('articles').insert(articleData);
        if (error) throw error;
      }
      setUploadSuccess('Article saved successfully!');
      fetchArticles();
      closeModal();
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentArticle(null);
    setForm({
      title: '',
      excerpt: '',
      content: '',
      content_type: 'article',
      access_level: 'public',
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (article) => {
    setCurrentArticle(article);
    setForm({
      title: article.judul,
      excerpt: article.excerpt,
      content: article.konten,
      content_type: article.content_type,
      access_level: article.access_level,
      status: article.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) throw error;
        fetchArticles();
      } catch (err) {
        console.error('Error deleting article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentArticle(null);
    setForm({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      image_url: '',
      category: '',
      content_type: 'article',
      status: 'published',
    });
    setUploadSuccess('');
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      className={`p-6 flex-1 overflow-y-auto transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-6">Articles Management</h1>

      {/* Controls and Search */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex-1 flex items-center space-x-2">
          <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-600'}`} />
          <input
            type="text"
            placeholder="Search articles by title or excerpt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-gray-100 text-meta-black placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
          />
        </div>
        <button
          onClick={openCreateModal}
          className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add New Article</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-meta-blue">Loading articles...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}

      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-500 text-sm"
        >
          <CheckCircle className="inline-block w-4 h-4 mr-2" />
          {uploadSuccess}
        </motion.div>
      )}

      {!loading && !error && (
        <div className={`overflow-x-auto rounded-lg shadow ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
          <table className="min-w-full divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Title</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Type</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Access</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Views</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <motion.tr 
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: article.id * 0.05 }}
                    className={`${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                      {article.judul}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {article.content_type}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {article.access_level}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {article.view_count}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openEditModal(article)}
                          className="text-meta-blue hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>No articles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`relative w-full max-w-2xl mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-white text-meta-black'}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">{currentArticle ? 'Edit Article' : 'Add New Article'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-1">Excerpt</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={form.content}
                    onChange={handleInputChange}
                    rows="8"
                    className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="content_type" className="block text-sm font-medium mb-1">Content Type</label>
                    <select
                      id="content_type"
                      name="content_type"
                      value={form.content_type}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    >
                      <option value="article">Article</option>
                      <option value="bonus">Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="access_level" className="block text-sm font-medium mb-1">Access Level</label>
                    <select
                      id="access_level"
                      name="access_level"
                      value={form.access_level}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    >
                      <option value="public">Public</option>
                      <option value="talent_only">Talent Only</option>
                      <option value="admin_only">Admin Only</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-700 border-meta-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Articles; 