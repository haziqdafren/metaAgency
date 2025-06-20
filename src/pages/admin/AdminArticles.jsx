import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';

const AdminArticles = () => {
  const { theme } = useThemeStore();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    judul: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    access_level: 'public',
    image_url: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    if (error) setNotification({ message: error.message, type: 'error', isVisible: true });
    else setArticles(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('article_categories').select('*').order('name');
    if (!error) setCategories(data);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    setForm({ judul: '', slug: '', excerpt: '', content: '', category_id: '', status: 'draft', access_level: 'public', image_url: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (article) => {
    setForm({ ...article });
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
    if (editingId) {
      result = await supabase.from('articles').update(form).eq('id', editingId);
    } else {
      result = await supabase.from('articles').insert([{ ...form }]);
    }
    if (result.error) setNotification({ message: result.error.message, type: 'error', isVisible: true });
    else {
      setNotification({ message: 'Article saved.', type: 'success', isVisible: true });
      setShowForm(false);
      fetchArticles();
    }
    setLoading(false);
  };

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
                  <th className="px-4 py-2 text-xs font-medium uppercase">Status</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Published</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="bg-white">
                    <td className="px-4 py-2">{a.judul}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2">{a.published_at ? new Date(a.published_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(a)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form onSubmit={handleSubmit} className={`w-full max-w-lg rounded-xl shadow-lg p-8 transition-colors duration-500`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Article' : 'New Article'}</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Title</label>
                <Input name="judul" value={form.judul} onChange={handleFormChange} className="w-full p-2 rounded border" required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Slug</label>
                <Input name="slug" value={form.slug} onChange={handleFormChange} className="w-full p-2 rounded border" required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Excerpt</label>
                <Textarea name="excerpt" value={form.excerpt} onChange={handleFormChange} className="w-full p-2 rounded border" rows={2} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Content</label>
                <Textarea name="content" value={form.content} onChange={handleFormChange} className="w-full p-2 rounded border" rows={6} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Category</label>
                <Select name="category_id" value={form.category_id} onChange={handleFormChange} className="w-full p-2 rounded border" required>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Status</label>
                  <Select name="status" value={form.status} onChange={handleFormChange} className="w-full p-2 rounded border">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Access</label>
                  <Select name="access_level" value={form.access_level} onChange={handleFormChange} className="w-full p-2 rounded border">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </Select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Image URL</label>
                <Input name="image_url" value={form.image_url} onChange={handleFormChange} className="w-full p-2 rounded border" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={loading}>{editingId ? 'Update' : 'Create'}</Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminArticles; 