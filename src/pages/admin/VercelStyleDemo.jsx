import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useThemeStore from '../../store/themeStore';
import { Upload } from 'lucide-react';

const VercelStyleDemo = () => {
  const { theme } = useThemeStore();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`min-h-screen p-8 flex items-center justify-center ${theme === 'dark' ? 'bg-[#111112]' : 'bg-gray-50'}`}>
      <motion.div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#18181b] text-white' : 'bg-white text-[#18181b]'}`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold mb-2">Vercel-Style Demo Card</h2>
        <p className="text-gray-400 mb-8">A modern, minimalist admin card for testing.</p>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" placeholder="Enter your name" />
            <Input label="Email" placeholder="Enter your email" type="email" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-500">Upload File</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                dragActive
                  ? theme === 'dark'
                    ? 'border-accent bg-[#232324]/80'
                    : 'border-accent bg-gray-100'
                  : theme === 'dark'
                  ? 'border-gray-700 bg-[#232324] hover:bg-[#232324]/80'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('vercel-demo-file').click()}
            >
              <Upload className="w-8 h-8 mb-2 text-accent" />
              <span className="text-sm text-gray-400">Drag & drop or click to upload</span>
              {file && <span className="mt-2 text-sm text-accent">{file.name}</span>}
              <input
                id="vercel-demo-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary">Submit</Button>
          </div>
        </form>
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Sample Table</h3>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-meta-gray-700 bg-meta-gray-900 text-white' : 'divide-gray-200 bg-white text-meta-black'}`}>
              <thead className={theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Name</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Email</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className={theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2">Jane Doe</td>
                  <td className="px-4 py-2">jane@demo.com</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">Active</span>
                  </td>
                </tr>
                <tr className={theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2">John Smith</td>
                  <td className="px-4 py-2">john@demo.com</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-300/20 text-gray-500">Inactive</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VercelStyleDemo; 