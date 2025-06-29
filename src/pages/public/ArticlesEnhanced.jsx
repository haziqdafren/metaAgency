import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getArticles } from '../../lib/supabase';
import { Calendar, Eye, ArrowRight, BookOpen, Search, Clock, Share2, Bookmark, Filter, X, ChevronDown } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const ArticlesEnhanced = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const { theme } = useThemeStore();
  
  const articlesPerPage = 9;

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('article_bookmarks');
    if (savedBookmarks) {
      setBookmarkedArticles(JSON.parse(savedBookmarks));
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await getArticles();
      if (error) {
        setError(error.message);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  // Get unique categories from articles
  const categories = useMemo(() => {
    const allCategories = articles.map(article => article.category?.name).filter(Boolean);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories;
  }, [articles]);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        article.category?.name === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort articles
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        break;
    }

    return filtered;
  }, [articles, searchTerm, selectedCategory, sortBy]);

  // Paginate articles
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    return filteredAndSortedArticles.slice(0, startIndex + articlesPerPage);
  }, [filteredAndSortedArticles, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedArticles.length / articlesPerPage);
  const hasMoreArticles = currentPage < totalPages;

  // Toggle bookmark
  const toggleBookmark = (articleId) => {
    const updatedBookmarks = bookmarkedArticles.includes(articleId)
      ? bookmarkedArticles.filter(id => id !== articleId)
      : [...bookmarkedArticles, articleId];
    
    setBookmarkedArticles(updatedBookmarks);
    localStorage.setItem('article_bookmarks', JSON.stringify(updatedBookmarks));
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return 5;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('latest');
    setCurrentPage(1);
  };

  // Load more articles
  const loadMoreArticles = () => {
    if (hasMoreArticles) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen pt-24 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Articles & Insights</h1>
          <p className="text-lg text-meta-gray-600 dark:text-meta-gray-400 mb-8">
            Discover insights, tips, and strategies for content creators
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900' : 'bg-white'}`}
        >
          {/* Main Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-meta-gray-400" />
            <input
              type="text"
              placeholder="Search articles, topics, or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-12 pr-4 py-4 text-lg rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-meta-blue focus:border-meta-blue ${
                theme === 'dark' 
                  ? 'bg-meta-gray-800 border-meta-gray-700 text-white placeholder-meta-gray-400' 
                  : 'bg-white border-gray-200 text-meta-black placeholder-meta-gray-500'
              }`}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-meta-gray-800 border-meta-gray-700 text-white hover:bg-meta-gray-700'
                    : 'bg-gray-50 border-gray-200 text-meta-black hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute top-full left-0 mt-2 p-4 rounded-lg shadow-lg border z-10 min-w-64 ${
                    theme === 'dark'
                      ? 'bg-meta-gray-900 border-meta-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={`w-full p-2 rounded border ${
                          theme === 'dark'
                            ? 'bg-meta-gray-800 border-meta-gray-700 text-white'
                            : 'bg-white border-gray-200 text-meta-black'
                        }`}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={`w-full p-2 rounded border ${
                          theme === 'dark'
                            ? 'bg-meta-gray-800 border-meta-gray-700 text-white'
                            : 'bg-white border-gray-200 text-meta-black'
                        }`}
                      >
                        <option value="latest">Latest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedCategory !== 'all' || sortBy !== 'latest') && (
              <div className="flex items-center gap-2">
                {searchTerm && (
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-meta-blue/20 text-meta-blue' : 'bg-meta-blue/10 text-meta-blue'
                  }`}>
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-meta-gray-500 hover:text-meta-gray-700 dark:hover:text-meta-gray-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Search Results Info */}
          <div className="text-sm text-meta-gray-500 dark:text-meta-gray-400">
            Showing {filteredAndSortedArticles.length} articles
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
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

        {/* Articles Grid */}
        {!loading && !error && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {paginatedArticles.map((article, index) => {
                const readingTime = calculateReadingTime(article.content || article.excerpt);
                const isBookmarked = bookmarkedArticles.includes(article.id);
                
                return (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`group rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      theme === 'dark' ? 'bg-meta-gray-900' : 'bg-white'
                    }`}
                  >
                    {/* Article Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-meta-blue to-cyan-500">
                      {article.featured_image ? (
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {article.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 text-meta-blue rounded-full text-xs font-medium">
                            {article.category.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Reading Time */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/50 text-white rounded-full text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readingTime} min read
                        </span>
                      </div>
                      
                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className={`absolute bottom-4 right-4 p-2 rounded-full transition-all duration-300 ${
                          isBookmarked 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Article Content */}
                    <div className="p-6">
                      <h2 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-meta-blue transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-meta-black'
                      }`}>
                        {article.title}
                      </h2>
                      
                      <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${
                        theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'
                      }`}>
                        {article.excerpt}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-meta-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {(article.view_count || 0).toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : '-'}
                          </span>
                        </div>
                        
                        {/* Social Sharing Preview */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Tags - Simplified since we only have one category per article */}
                      {article.category && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span 
                            className={`px-2 py-1 text-xs rounded ${
                              theme === 'dark' ? 'bg-meta-gray-800 text-meta-gray-300' : 'bg-gray-100 text-meta-gray-600'
                            }`}
                          >
                            {article.category.name}
                          </span>
                        </div>
                      )}
                      
                      {/* CTA Button */}
                      <Button
                        as={Link}
                        to={`/articles/${(article.slug && article.slug.trim()) ? article.slug : article.id}`}
                        variant="primary"
                        className="w-full group-hover:bg-meta-blue group-hover:shadow-lg transition-all duration-300"
                      >
                        Baca Selengkapnya
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
            
            {/* Load More / Pagination */}
            {filteredAndSortedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                {hasMoreArticles ? (
                  <Button
                    onClick={loadMoreArticles}
                    variant="secondary"
                    size="lg"
                    className="px-8 py-3"
                  >
                    Load More Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <p className="text-meta-gray-500 dark:text-meta-gray-400">
                    You've reached the end! 🎉
                  </p>
                )}
                
                <p className="text-sm text-meta-gray-500 dark:text-meta-gray-400 mt-4">
                  Showing {paginatedArticles.length} of {filteredAndSortedArticles.length} articles
                </p>
              </motion.div>
            )}
            
            {/* No Results */}
            {filteredAndSortedArticles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <BookOpen className="w-16 h-16 text-meta-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
                <p className="text-meta-gray-500 dark:text-meta-gray-400 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters} variant="primary">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesEnhanced;