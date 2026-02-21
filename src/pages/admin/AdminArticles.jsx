import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Notification from '../../components/common/Notification';
import ConfirmModal from '../../components/common/ConfirmModal';
import { AnimatePresence } from 'framer-motion';
import EnhancedArticlesTable from '../../components/admin/EnhancedArticlesTable';
import SimpleArticleForm from '../../components/admin/SimpleArticleForm';
import CompactCard from '../../components/admin/CompactCard';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useConfirm } from '../../hooks/useConfirm';
// Removed generateUniqueSlug import - now handled in SimpleArticleForm

const AdminArticles = () => {
  const { withDemoCheck } = useDemoMode();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  // Categories are now handled in EnhancedArticleForm
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    
    console.log('🔄 Fetching articles for admin...');
    
    try {
      // Fetch articles and categories separately to avoid relationship conflicts
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (articlesError) {
        throw articlesError;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('article_categories')
        .select('*');

      if (categoriesError) {
        throw categoriesError;
      }

      // Manually join the data
      const processedData = articlesData?.map(article => {
        const category = categoriesData?.find(cat => cat.id === article.category_id);
        return {
          ...article,
          category: category || null
        };
      }) || [];

      console.log(`✅ Successfully fetched ${processedData.length} articles with categories`);
      setArticles(processedData);

    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      setNotification({ message: error.message, type: 'error', isVisible: true });
    }
    
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('name');
    if (!error) setCategories(data);
  };

  // Simplified form handling for the new enhanced form

  const handleCreate = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEdit = async (article) => {
    // Fetch full article data
    const { data: fullArticle } = await supabase
      .from('articles')
      .select('*')
      .eq('id', article.id)
      .single();
    
    setEditingArticle(fullArticle);
    setShowForm(true);
  };

  const handleDelete = async (article) => {
    const confirmed = await confirm({
      title: 'Delete Article',
      message: `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    const performDelete = withDemoCheck(async () => {
      setLoading(true);
      const { error } = await supabase.from('articles').delete().eq('id', article.id);
      if (error) setNotification({ message: error.message, type: 'error', isVisible: true });
      else {
        setNotification({ message: 'Article deleted.', type: 'success', isVisible: true });
        fetchArticles();
      }
      setLoading(false);
    });

    await performDelete();
  };

  // Handler for bulk actions from Enhanced DataTable
  const handleBulkAction = withDemoCheck(async (action, selectedData, selectedIds) => {
    switch(action) {
      case 'publish':
        setLoading(true);
        try {
          const { error } = await supabase
            .from('articles')
            .update({ published_at: new Date().toISOString() })
            .in('id', selectedIds);
          
          if (error) throw error;
          
          setNotification({ 
            message: `Published ${selectedIds.length} articles`, 
            type: 'success', 
            isVisible: true 
          });
          fetchArticles();
        } catch (error) {
          setNotification({ 
            message: 'Error publishing articles: ' + error.message, 
            type: 'error', 
            isVisible: true 
          });
        } finally {
          setLoading(false);
        }
        break;
        
      case 'unpublish':
        setLoading(true);
        try {
          const { error } = await supabase
            .from('articles')
            .update({ published_at: null })
            .in('id', selectedIds);
          
          if (error) throw error;
          
          setNotification({ 
            message: `Unpublished ${selectedIds.length} articles`, 
            type: 'success', 
            isVisible: true 
          });
          fetchArticles();
        } catch (error) {
          setNotification({ 
            message: 'Error unpublishing articles: ' + error.message, 
            type: 'error', 
            isVisible: true 
          });
        } finally {
          setLoading(false);
        }
        break;
        
      case 'delete':
        // Delete action will be handled with confirmation in the component that calls this
        // This is a placeholder - actual confirmation should happen before calling handleBulkAction
        setLoading(true);
        try {
          const { error } = await supabase
            .from('articles')
            .delete()
            .in('id', selectedIds);

          if (error) throw error;

          setNotification({
            message: `Deleted ${selectedIds.length} articles`,
            type: 'success',
            isVisible: true
          });
          fetchArticles();
        } catch (error) {
          setNotification({
            message: 'Error deleting articles: ' + error.message,
            type: 'error',
            isVisible: true
          });
        } finally {
          setLoading(false);
        }
        break;
        
      default:
        console.log('Unknown bulk action:', action);
    }
  });

  const handleFormSave = withDemoCheck(async (formData) => {
    setFormLoading(true);
    
    try {
      // Prepare simple article data
      const articleData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || null,
        type: formData.type || 'article',
        access: formData.access || 'public',
        published_at: formData.published_at || new Date().toISOString(),
        category_id: formData.category_id || null,
        featured_image: formData.featured_image || null
      };
      
      let result;
      
      if (editingArticle) {
        // Update existing article
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
      } else {
        // Create new article
        result = await supabase
          .from('articles')
          .insert([articleData])
          .select();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setNotification({ 
        message: `Article ${editingArticle ? 'updated' : 'created'} successfully!`, 
        type: 'success', 
        isVisible: true 
      });
      setShowForm(false);
      setEditingArticle(null);
      fetchArticles();
      
    } catch (error) {
      setNotification({ 
        message: `Error: ${error.message}`, 
        type: 'error', 
        isVisible: true 
      });
    } finally {
      setFormLoading(false);
    }
  });

  // Editor logic moved to EnhancedArticleForm component

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-500">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        loading={confirmState.loading}
      />

      {/* Enhanced Articles Table */}
      <CompactCard 
        title="Articles Management"
        subtitle={`Managing ${articles.length} articles with enhanced search and bulk operations`}
        compact
      >
        <EnhancedArticlesTable 
          articles={articles}
          categories={categories}
          loading={loading}
          onEditArticle={handleEdit}
          onDeleteArticle={handleDelete}
          onBulkAction={handleBulkAction}
          onCreateNew={handleCreate}
          onRefresh={fetchArticles}
        />
      </CompactCard>

      {/* Simple Article Form */}
      <AnimatePresence>
        {showForm && (
          <SimpleArticleForm
            article={editingArticle}
            categories={categories}
            onSave={handleFormSave}
            onClose={() => {
              setShowForm(false);
              setEditingArticle(null);
            }}
            loading={formLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminArticles; 