import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Notification from '../../components/common/Notification';
import { AnimatePresence } from 'framer-motion';
import EnhancedArticlesTable from '../../components/admin/EnhancedArticlesTable';
import EnhancedArticleForm from '../../components/admin/EnhancedArticleForm';
import CompactCard from '../../components/admin/CompactCard';
import { generateUniqueSlug } from '../../utils/slugUtils';

const AdminArticles = () => {
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
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories:article_category_relations(
          category:article_categories(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) setNotification({ message: error.message, type: 'error', isVisible: true });
    else setArticles(data);
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
    // Fetch full article data with categories
    const { data: fullArticle } = await supabase
      .from('articles')
      .select(`
        *,
        categories:article_category_relations(
          category_id,
          category:article_categories(*)
        )
      `)
      .eq('id', article.id)
      .single();
    
    setEditingArticle(fullArticle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    setLoading(true);
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) setNotification({ message: error.message, type: 'error', isVisible: true });
    else {
      setNotification({ message: 'Article deleted.', type: 'success', isVisible: true });
      fetchArticles();
    }
    setLoading(false);
  };

  // Handler for bulk actions from Enhanced DataTable
  const handleBulkAction = async (action, selectedData, selectedIds) => {
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
  };

  const handleFormSave = async (formData) => {
    setFormLoading(true);
    
    try {
      const { selectedCategories, ...articleData } = formData;
      
      // Generate slug if not provided
      if (!articleData.slug && articleData.title) {
        articleData.slug = await generateUniqueSlug(articleData.title, editingArticle?.id, supabase);
      }
      
      let result;
      
      if (editingArticle) {
        // Update existing article
        result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
          
        if (!result.error) {
          // Update categories
          await supabase
            .from('article_category_relations')
            .delete()
            .eq('article_id', editingArticle.id);
            
          if (selectedCategories.length > 0) {
            await supabase
              .from('article_category_relations')
              .insert(
                selectedCategories.map(categoryId => ({
                  article_id: editingArticle.id,
                  category_id: categoryId
                }))
              );
          }
        }
      } else {
        // Create new article
        result = await supabase
          .from('articles')
          .insert([articleData])
          .select();
          
        if (!result.error && result.data?.[0]?.id && selectedCategories.length > 0) {
          await supabase
            .from('article_category_relations')
            .insert(
              selectedCategories.map(categoryId => ({
                article_id: result.data[0].id,
                category_id: categoryId
              }))
            );
        }
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
  };

  // Editor logic moved to EnhancedArticleForm component

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-500">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      
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

      {/* Enhanced Article Form */}
      <AnimatePresence>
        {showForm && (
          <EnhancedArticleForm
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