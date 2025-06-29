import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, FileText, Calendar, Users, ExternalLink, Tag } from 'lucide-react';
import EnhancedDataTable from './EnhancedDataTable';
import { columnHelpers, exportHelpers } from './DataTableHelpers';
import Button from '../common/Button';

const EnhancedArticlesTable = ({
  articles = [],
  categories = [],
  loading = false,
  onArticleClick = null,
  onEditArticle = null,
  onDeleteArticle = null,
  onBulkAction = null,
  onCreateNew = null,
  onRefresh = null
}) => {
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Define columns configuration
  const columns = useMemo(() => [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 line-clamp-2">
            {value}
          </div>
          {row.excerpt && (
            <div className="text-sm text-gray-500 line-clamp-1 mt-1">
              {row.excerpt}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'categories',
      title: 'Categories',
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterOptions: categories.map(cat => ({
        value: cat.slug,
        label: cat.name
      })),
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {row.category ? (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {row.category.name}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">No category</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' }
      ],
      render: (value, row) => {
        const isPublished = !!row.published_at;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        );
      }
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'article', label: 'Article' },
        { value: 'news', label: 'News' },
        { value: 'tutorial', label: 'Tutorial' }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'article' ? 'bg-blue-100 text-blue-800' :
          value === 'news' ? 'bg-red-100 text-red-800' :
          value === 'tutorial' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Article'}
        </span>
      )
    },
    columnHelpers.dateColumn('published_at', 'Published', {
      render: (value) => value ? (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString('id-ID')}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">Draft</span>
      )
    }),
    columnHelpers.numberColumn('view_count', 'Views', {
      render: (value) => (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="font-medium">
            {value ? value.toLocaleString('id-ID') : '0'}
          </span>
        </div>
      )
    }),
    {
      key: 'seo_score',
      title: 'SEO Score',
      sortable: true,
      filterable: false,
      render: (value, row) => {
        // Calculate SEO score based on available data
        let score = 0;
        if (row.seo_title) score += 25;
        if (row.seo_description) score += 25;
        if (row.seo_keywords?.length > 0) score += 25;
        if (row.excerpt) score += 25;
        
        const getScoreColor = (score) => {
          if (score >= 75) return 'bg-green-500';
          if (score >= 50) return 'bg-yellow-500';
          return 'bg-red-500';
        };
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getScoreColor(score)}`}>
              {score}
            </div>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        );
      }
    },
    {
      key: 'access',
      title: 'Access',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'public' ? (
            <>
              <Users className="w-3 h-3 inline mr-1" />
              Public
            </>
          ) : (
            'Private'
          )}
        </span>
      )
    }
  ], [categories]);

  // Search configuration
  const searchConfig = {
    searchableColumns: ['title', 'excerpt', 'content'],
    placeholder: "Search articles by title, excerpt, or content...",
    advancedFilters: true
  };

  // Bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      icon: '📊',
      variant: 'primary',
      handler: async (selectedData, selectedIds) => {
        const result = await exportHelpers.exportToExcel(
          selectedData,
          columns.filter(col => col.key !== 'actions'),
          `selected_articles_${selectedIds.length}`
        );
        if (result.success) {
          console.log(`Exported ${selectedIds.length} articles to ${result.filename}`);
        }
      }
    },
    {
      label: 'Bulk Publish',
      icon: '📢',
      variant: 'secondary',
      handler: (selectedData, selectedIds) => {
        const draftArticles = selectedData.filter(article => !article.published_at);
        if (draftArticles.length > 0) {
          onBulkAction && onBulkAction('publish', draftArticles, selectedIds);
        }
      }
    },
    {
      label: 'Bulk Unpublish',
      icon: '📝',
      variant: 'secondary',
      handler: (selectedData, selectedIds) => {
        const publishedArticles = selectedData.filter(article => article.published_at);
        if (publishedArticles.length > 0) {
          onBulkAction && onBulkAction('unpublish', publishedArticles, selectedIds);
        }
      }
    },
    {
      label: 'Change Category',
      icon: '🏷️',
      variant: 'secondary',
      handler: (selectedData, selectedIds) => {
        onBulkAction && onBulkAction('change_category', selectedData, selectedIds);
      }
    },
    {
      label: 'Delete Selected',
      icon: '🗑️',
      variant: 'danger',
      handler: (selectedData, selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} articles? This action cannot be undone.`)) {
          onBulkAction && onBulkAction('delete', selectedData, selectedIds);
        }
      }
    }
  ];

  // Export options
  const exportOptions = ['excel', 'csv'];

  // Enhanced data with additional properties for filtering
  const enhancedArticles = useMemo(() => 
    articles.map(article => ({
      ...article,
      // Add computed fields for better filtering/sorting
      status: article.published_at ? 'published' : 'draft',
      seo_score: [
        article.seo_title,
        article.seo_description,
        article.seo_keywords?.length > 0,
        article.excerpt
      ].filter(Boolean).length * 25,
      category_names: article.category?.name || '',
      word_count: article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
      has_featured_image: !!article.featured_image,
      days_since_published: article.published_at 
        ? Math.floor((new Date() - new Date(article.published_at)) / (1000 * 60 * 60 * 24))
        : null
    })), 
    [articles]
  );

  // Row click handler
  const handleRowClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  // Add custom actions to each row
  const articlesWithActions = useMemo(() => 
    enhancedArticles.map(article => ({
      ...article,
      actions: [
        {
          icon: <Eye className="w-4 h-4" />,
          title: 'Preview Article',
          variant: 'ghost',
          onClick: (article) => {
            console.log('👁️ Eye button clicked for article:', article);
            
            if (article.published_at) {
              // Always use slug if it exists and is not empty, otherwise use ID
              const hasValidSlug = article.slug && article.slug.trim() && article.slug.length > 2;
              const articlePath = hasValidSlug ? article.slug : article.id;
              const articleUrl = `/articles/${articlePath}`;
              
              console.log(`🔗 Opening article URL: ${articleUrl}`);
              console.log(`🏷️ Using ${hasValidSlug ? 'slug' : 'ID'}: ${articlePath}`);
              
              window.open(articleUrl, '_blank');
            } else {
              // For draft articles, show preview modal or notification
              alert(`Preview for draft: "${article.title}"\n\nThis article is not published yet. You can edit it to add content and publish it.`);
            }
          }
        },
        {
          icon: <Edit className="w-4 h-4" />,
          title: 'Edit Article',
          variant: 'ghost',
          onClick: (article) => onEditArticle && onEditArticle(article)
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          title: 'Delete Article',
          variant: 'ghost',
          onClick: (article) => {
            if (window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
              onDeleteArticle && onDeleteArticle(article.id);
            }
          }
        },
        {
          icon: <ExternalLink className="w-4 h-4" />,
          title: 'Share Article',
          variant: 'ghost',
          onClick: async (article) => {
            if (article.published_at) {
              // Always use slug if it exists and is not empty, otherwise use ID
              const articlePath = (article.slug && article.slug.trim()) ? article.slug : article.id;
              const url = `${window.location.origin}/articles/${articlePath}`;
              
              try {
                await navigator.clipboard.writeText(url);
                // Show success notification with URL type
                const urlType = (article.slug && article.slug.trim()) ? 'SEO URL' : 'ID URL';
                alert(`✅ Article ${urlType} copied to clipboard!\n\n"${article.title}"\n\n${url}`);
              } catch (error) {
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                const urlType = (article.slug && article.slug.trim()) ? 'SEO URL' : 'ID URL';
                alert(`✅ Article ${urlType} copied to clipboard!\n\n"${article.title}"\n\n${url}`);
              }
            } else {
              alert(`⚠️ Cannot share unpublished article\n\n"${article.title}" is still a draft. Please publish it first to share.`);
            }
          }
        }
      ]
    })), 
    [enhancedArticles, onEditArticle, onDeleteArticle]
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
      <p className="text-gray-500 mb-6">Get started by creating your first article or adjusting your filters.</p>
      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={() => onCreateNew && onCreateNew()}>
          Create Article
        </Button>
        <Button variant="secondary" onClick={() => onRefresh && onRefresh()}>
          Refresh
        </Button>
      </div>
    </div>
  );

  // Custom toolbar actions
  const toolbarActions = (
    <div className="flex items-center gap-3 w-full">
      <Button variant="primary" onClick={() => onCreateNew && onCreateNew()}>
        <FileText className="w-4 h-4 mr-1" />
        New Article
      </Button>
      <Button variant="secondary" onClick={() => onRefresh && onRefresh()}>
        Refresh
      </Button>
      <Button variant="secondary" onClick={() => {
        const evt = new CustomEvent('openFilters');
        window.dispatchEvent(evt);
      }}>
        <span className="mr-1">🔍</span> Filters
      </Button>
      <div className="flex-1" />
    </div>
  );

  return (
    <EnhancedDataTable
      title="Articles Management"
      subtitle={`Managing ${articles.length} articles`}
      data={articlesWithActions}
      columns={columns}
      searchConfig={searchConfig}
      bulkActions={bulkActions}
      exportOptions={exportOptions}
      onRowClick={handleRowClick}
      selectable={true}
      sortable={true}
      filterable={true}
      loading={loading}
      emptyState={<EmptyState />}
      pagination={{
        pageSize: 10,
        showSizeSelector: true
      }}
      mobileOptimized={true}
      compact={false}
      // Custom toolbar can be added here
      customActions={toolbarActions}
    />
  );
};

export default EnhancedArticlesTable;