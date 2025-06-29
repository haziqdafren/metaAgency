import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  X, Save, Eye, Upload, Link as LinkIcon, Bold, Italic, 
  List, ListOrdered, Heading2, Image as ImageIcon, ExternalLink,
  Search, FileText, Settings, Check, AlertCircle, Copy
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { supabase } from '../../lib/supabase';
import { generateUniqueSlug, validateSlug, previewSlugUrl } from '../../utils/slugUtils';

const EnhancedArticleForm = ({ 
  article = null, 
  categories = [], 
  onSave, 
  onClose, 
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    type: 'article',
    access: 'public',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    published_at: null,
    category_id: null,
    featured_image: '',
    ...article
  });
  const [slugStatus, setSlugStatus] = useState({ valid: true, unique: true, checking: false, message: '' });
  const [imageUploadMode, setImageUploadMode] = useState('url'); // 'url' or 'upload'
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Initialize form when article changes
  useEffect(() => {
    if (article) {
      setForm({ ...form, ...article });
      // Handle category relationship
      if (article.category_id) {
        setForm(prev => ({ ...prev, category_id: article.category_id }));
      }
    }
    // eslint-disable-next-line
  }, [article]);

  // Update editor content when form changes
  useEffect(() => {
    if (editor && form.content !== editor.getHTML()) {
      editor.commands.setContent(form.content || '');
    }
    // eslint-disable-next-line
  }, [form.content, editor]);

  // Generate slug from title
  const handleTitleChange = async (e) => {
    const title = e.target.value;
    setForm(prev => ({ ...prev, title }));

    // Auto-generate slug if it's empty or matches the previous title's slug
    if (!form.slug || form.slug === generateSlugFromTitle(form.title)) {
      const newSlug = await generateUniqueSlug(title, article?.id, supabase);
      setForm(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle slug validation
  const handleSlugChange = async (e) => {
    const slug = e.target.value.toLowerCase().trim();
    setForm(prev => ({ ...prev, slug }));
    
    console.log('🏷️ Validating slug:', slug);
    
    if (slug.length === 0) {
      setSlugStatus({ valid: true, unique: true, checking: false, message: '' });
      return;
    }
    
    if (slug.length >= 3) {
      setSlugStatus({ valid: true, unique: true, checking: true, message: 'Checking...' });
      
      const isValid = validateSlug(slug);
      console.log('✓ Slug validation result:', isValid);
      
      if (!isValid) {
        setSlugStatus({ 
          valid: false, 
          unique: true, 
          checking: false, 
          message: 'Slug must be 3+ chars, only letters, numbers, and hyphens' 
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title')
          .eq('slug', slug)
          .neq('id', article?.id || '');
        
        if (error) {
          console.error('❌ Error checking slug uniqueness:', error);
          setSlugStatus({ valid: true, unique: false, checking: false, message: 'Error checking uniqueness' });
          return;
        }
        
        const isUnique = data.length === 0;
        console.log('🔍 Slug uniqueness check:', { slug, isUnique, conflicts: data });
        
        setSlugStatus({ 
          valid: true, 
          unique: isUnique, 
          checking: false, 
          message: isUnique ? 'Available' : `Already used by: ${data[0]?.title}` 
        });
      } catch (error) {
        console.error('❌ Error in slug validation:', error);
        setSlugStatus({ valid: true, unique: false, checking: false, message: 'Error checking slug' });
      }
    } else {
      setSlugStatus({ 
        valid: false, 
        unique: true, 
        checking: false, 
        message: 'Slug must be at least 3 characters' 
      });
    }
  };

  // Handle form field changes
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

  // Handle category selection (single category as per current schema)
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value || null;
    setForm(prev => ({ ...prev, category_id: categoryId }));
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      setForm(prev => ({ ...prev, featured_image: data.publicUrl }));
      alert('✅ Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Editor toolbar actions
  const editorActions = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic')
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 })
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList')
    },
    {
      icon: ImageIcon,
      label: 'Insert Image',
      action: () => {
        const url = prompt('Enter image URL:');
        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
      }
    },
    {
      icon: LinkIcon,
      label: 'Insert Link',
      action: () => {
        const url = prompt('Enter link URL:');
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run();
        }
      }
    }
  ];

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!form.slug.trim()) {
      const slug = await generateUniqueSlug(form.title, article?.id, supabase);
      setForm(prev => ({ ...prev, slug }));
    }
    
    if (!slugStatus.valid || !slugStatus.unique) {
      alert('Please fix the slug before saving');
      return;
    }

    onSave && onSave(form);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {article ? 'Edit Article' : 'New Article'}
            </h2>
            <p className="text-gray-600 mt-1">
              {form.title || 'Create engaging content for your audience'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r flex flex-col">
            <nav className="flex-1 p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Action Buttons */}
            <div className="p-4 border-t space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                loading={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Article
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Article Title *
                        </label>
                        <Input
                          value={form.title}
                          onChange={handleTitleChange}
                          placeholder="Enter a compelling title..."
                          className="text-lg font-medium"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Slug
                        </label>
                        <div className="relative">
                          <Input
                            value={form.slug}
                            onChange={handleSlugChange}
                            placeholder="article-url-slug"
                            className={`pr-10 ${
                              !slugStatus.valid ? 'border-red-500' : 
                              !slugStatus.unique ? 'border-yellow-500' : 
                              'border-green-500'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {slugStatus.checking ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : slugStatus.valid && slugStatus.unique ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        {form.slug && (
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                URL: /articles/{form.slug}
                              </span>
                              <button
                                onClick={() => navigator.clipboard.writeText(previewSlugUrl(form.slug))}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {slugStatus.message && (
                              <p className={`text-xs mt-1 ${
                                !slugStatus.valid ? 'text-red-600' : 
                                !slugStatus.unique ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                {slugStatus.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt
                      </label>
                      <Textarea
                        value={form.excerpt}
                        onChange={handleFormChange}
                        name="excerpt"
                        placeholder="Brief summary of your article (1-2 sentences)..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will appear in article previews and search results
                      </p>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={form.category_id || ''}
                        onChange={handleCategoryChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Article Content
                      </label>
                      
                      {/* Editor Toolbar */}
                      <div className="border border-gray-200 rounded-lg">
                        <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gray-50">
                          {editorActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={action.action}
                                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                                  action.isActive?.() ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                                }`}
                                title={action.label}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Editor Content */}
                        <EditorContent
                          editor={editor}
                          className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <motion.div
                    key="media"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                      
                      {/* Image Upload Tabs */}
                      <div className="flex mb-4">
                        <button
                          onClick={() => setImageUploadMode('url')}
                          className={`px-4 py-2 rounded-l-lg font-medium ${
                            imageUploadMode === 'url'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2 inline" />
                          Image URL
                        </button>
                        <button
                          onClick={() => setImageUploadMode('upload')}
                          className={`px-4 py-2 rounded-r-lg font-medium ${
                            imageUploadMode === 'upload'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <Upload className="w-4 h-4 mr-2 inline" />
                          Upload File
                        </button>
                      </div>

                      {imageUploadMode === 'url' ? (
                        <div>
                          <Input
                            value={form.featured_image}
                            onChange={handleFormChange}
                            name="featured_image"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Click to upload an image</p>
                          <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="hidden"
                          />
                        </div>
                      )}

                      {/* Image Preview */}
                      {form.featured_image && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                          <img
                            src={form.featured_image}
                            alt="Featured"
                            className="max-w-md rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <motion.div
                    key="seo"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Optimization</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Title
                          </label>
                          <Input
                            value={form.seo_title}
                            onChange={handleFormChange}
                            name="seo_title"
                            placeholder="Leave blank to use article title"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended: 50-60 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                          </label>
                          <Textarea
                            value={form.seo_description}
                            onChange={handleFormChange}
                            name="seo_description"
                            placeholder="Brief description for search engines..."
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended: 150-160 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Keywords
                          </label>
                          <Input
                            value={form.seo_keywords?.join(', ')}
                            onChange={handleFormChange}
                            name="seo_keywords"
                            placeholder="keyword1, keyword2, keyword3"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Separate keywords with commas
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={form.published_at ? 'published' : 'draft'}
                            onChange={(e) => {
                              setForm(prev => ({
                                ...prev,
                                published_at: e.target.value === 'published' ? new Date().toISOString() : null
                              }));
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access
                          </label>
                          <select
                            value={form.access}
                            onChange={handleFormChange}
                            name="access"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={form.type}
                            onChange={handleFormChange}
                            name="type"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="article">Article</option>
                            <option value="news">News</option>
                            <option value="tutorial">Tutorial</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedArticleForm;