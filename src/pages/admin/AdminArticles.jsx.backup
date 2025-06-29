import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    type: 'article',
    access: 'public',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    published_at: null
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(articles.length / pageSize);
  const paginatedArticles = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    setCurrentPage(1);
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'seo_keywords') {
      setForm(prev => ({
        ...prev,
        [name]: value.split(',').map(k => k.trim()).filter(k => k)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedCategories(selected);
  };

  const handleCreate = () => {
    setForm({
      title: '',
      excerpt: '',
      content: '',
      type: 'article',
      access: 'public',
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      published_at: null
    });
    setSelectedCategories([]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = async (article) => {
    setForm({
      ...article,
      seo_keywords: article.seo_keywords || []
    });
    
    // Fetch and set selected categories
    const { data: categoryRelations } = await supabase
      .from('article_category_relations')
      .select('category_id')
      .eq('article_id', article.id);
      
    setSelectedCategories(categoryRelations?.map(rel => rel.category_id) || []);
    setEditingId(article.id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let result;
    // Only include fields that actually exist in the articles table
    const {
      title,
      excerpt,
      content,
      type,
      access,
      seo_title,
      seo_description,
      seo_keywords,
      published_at
    } = form;

    const articleData = {
      title,
      excerpt,
      content,
      type,
      access,
      seo_title,
      seo_description,
      seo_keywords,
      published_at
    };
    
    if (editingId) {
      // Update article
      result = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingId);
        
      if (!result.error) {
        // Update categories
        await supabase
          .from('article_category_relations')
          .delete()
          .eq('article_id', editingId);
          
        if (selectedCategories.length > 0) {
          await supabase
            .from('article_category_relations')
            .insert(
              selectedCategories.map(categoryId => ({
                article_id: editingId,
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
      setNotification({ message: result.error.message, type: 'error', isVisible: true });
    } else {
      setNotification({ message: 'Article saved successfully.', type: 'success', isVisible: true });
      setShowForm(false);
      fetchArticles();
    }
    setLoading(false);
  };

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm(f => ({ ...f, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && form.content !== editor.getHTML()) {
      editor.commands.setContent(form.content || '');
    }
    // eslint-disable-next-line
  }, [showForm]);

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-500">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <motion.div className={`rounded-xl shadow-lg p-8 mb-8 transition-colors duration-500`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Articles</h2>
          <Button onClick={handleCreate} variant="primary">New Article</Button>
        </div>
        {loading ? <LoadingSpinner size="md" /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Title</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Categories</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Status</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Published</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map((article) => (
                  <tr key={article.id} className="bg-white">
                    <td className="px-4 py-2">{article.title}</td>
                    <td className="px-4 py-2">
                      {article.categories?.map(c => c.category.name).join(', ')}
                    </td>
                    <td className="px-4 py-2">{article.published_at ? 'Published' : 'Draft'}</td>
                    <td className="px-4 py-2">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(article)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(article.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              onSubmit={handleSubmit}
              className="w-full max-w-4xl rounded-2xl shadow-2xl p-8 bg-white border border-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto m-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                {editingId ? 'Edit Article' : 'New Article'}
              </h3>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Title</label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Main headline"
                    className="w-full"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Categories</label>
                  <select
                    multiple
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                    className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple categories
                  </span>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t pt-6 mt-2">
                <h4 className="text-lg font-semibold mb-4">SEO Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">SEO Title</label>
                    <Input
                      name="seo_title"
                      value={form.seo_title || ''}
                      onChange={handleFormChange}
                      placeholder="SEO-optimized title (optional)"
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">
                      Leave blank to use the main title
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">Keywords</label>
                    <Input
                      name="seo_keywords"
                      value={form.seo_keywords?.join(', ') || ''}
                      onChange={handleFormChange}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">
                      Separate keywords with commas
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="font-semibold text-gray-700">
                    Meta Description
                  </label>
                  <Textarea
                    name="seo_description"
                    value={form.seo_description || ''}
                    onChange={handleFormChange}
                    placeholder="Brief description for search engines"
                    className="w-full"
                    rows={2}
                  />
                  <span className="text-xs text-gray-500">
                    Recommended length: 150-160 characters
                  </span>
                </div>
              </div>

              {/* Content Fields */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Content</h4>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Excerpt</label>
                  <Textarea
                    name="excerpt"
                    value={form.excerpt || ''}
                    onChange={handleFormChange}
                    placeholder="Brief summary (1-2 sentences)"
                    className="w-full"
                    rows={2}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="font-semibold text-gray-700">Content</label>
                  <div className="border rounded-lg bg-gray-50">
                    <div className="flex flex-wrap gap-2 p-2 border-b bg-white rounded-t-lg">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`px-2 py-1 rounded ${
                          editor?.isActive('bold')
                            ? 'bg-blue-100 text-blue-700 font-bold'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`px-2 py-1 rounded ${
                          editor?.isActive('italic')
                            ? 'bg-blue-100 text-blue-700 italic'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-2 py-1 rounded ${
                          editor?.isActive('heading', { level: 2 })
                            ? 'bg-blue-100 text-blue-700 font-bold'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`px-2 py-1 rounded ${
                          editor?.isActive('bulletList')
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`px-2 py-1 rounded ${
                          editor?.isActive('orderedList')
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        1. List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter image URL');
                          if (url) editor?.chain().focus().setImage({ src: url }).run();
                        }}
                        className="px-2 py-1 rounded hover:bg-gray-200"
                      >
                        Img
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter link URL');
                          if (url) editor?.chain().focus().toggleLink({ href: url }).run();
                        }}
                        className="px-2 py-1 rounded hover:bg-gray-200"
                      >
                        Link
                      </button>
                    </div>
                    <EditorContent
                      editor={editor}
                      className="p-3 min-h-[300px] bg-white rounded-b-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Publishing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">Status</label>
                    <Select
                      name="published_at"
                      value={form.published_at ? 'published' : 'draft'}
                      onChange={(e) => {
                        setForm(prev => ({
                          ...prev,
                          published_at: e.target.value === 'published' ? new Date().toISOString() : null
                        }));
                      }}
                      className="w-full"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">Access</label>
                    <Select
                      name="access"
                      value={form.access}
                      onChange={handleFormChange}
                      className="w-full"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700">Type</label>
                    <Select
                      name="type"
                      value={form.type}
                      onChange={handleFormChange}
                      className="w-full"
                    >
                      <option value="article">Article</option>
                      <option value="news">News</option>
                      <option value="tutorial">Tutorial</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminArticles; 