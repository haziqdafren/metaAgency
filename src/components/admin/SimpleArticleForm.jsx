import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  X, Save, Bold, Italic, List, ListOrdered, 
  Heading2, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { supabase } from '../../lib/supabase';

const SimpleArticleForm = ({ 
  article = null, 
  categories = [], 
  onSave, 
  onClose, 
  loading = false 
}) => {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: null,
    featured_image: '',
    ...article
  });

  // Simple TipTap Editor
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

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Simple automatic slug generation (no complex validation)
  const generateSimpleSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Max 50 chars
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    // Automatically generate slug from title
    const autoSlug = generateSimpleSlug(form.title);
    
    const formData = {
      ...form,
      slug: autoSlug,
      type: 'article',
      access: 'public',
      published_at: new Date().toISOString() // Auto-publish
    };

    onSave && onSave(formData);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {article ? 'Edit Article' : 'Create New Article'}
            </h2>
            <p className="text-gray-600 mt-1">
              Simple and easy article creation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <Input
                value={form.title}
                onChange={handleFormChange}
                name="title"
                placeholder="Enter your article title..."
                className="text-lg font-medium"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={form.category_id || ''}
                onChange={handleFormChange}
                name="category_id"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category (optional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL (optional)
              </label>
              <Input
                value={form.featured_image}
                onChange={handleFormChange}
                name="featured_image"
                placeholder="https://example.com/image.jpg"
              />
              {form.featured_image && (
                <img
                  src={form.featured_image}
                  alt="Preview"
                  className="mt-2 max-w-xs rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <Textarea
                value={form.excerpt}
                onChange={handleFormChange}
                name="excerpt"
                placeholder="Brief summary of your article..."
                rows={3}
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Article Content *
              </label>
              
              {/* Simple Editor Toolbar */}
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
                  className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {article ? 'Update Article' : 'Create Article'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SimpleArticleForm;