import React from 'react';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadSection = ({ onFileUpload, loading, selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  return (
    <motion.div 
      className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Bonus Calculator</h2>
          <p className="text-gray-400">Upload Task Excel to calculate and manage monthly bonuses</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black"
            />
          </div>
        </div>
      </div>
      
      <label className="cursor-pointer block">
        <div className="text-center">
          <Calculator className="mx-auto mb-2 text-gray-400" size={48} />
          <span className="text-meta-black font-medium">Upload Task Excel from TikTok Backstage</span>
          <p className="text-sm text-gray-500 mt-1">Only eligible creators will be shown</p>
          <div className="mt-2 text-xs text-gray-400">
            Expected columns: Creator ID, Creator nickname, Handle, Diamonds, Valid days(d), LIVE duration(h), Estimated bonus
          </div>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
          disabled={loading}
        />
      </label>
      
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600 mt-2">Processing file...</p>
        </div>
      )}
    </motion.div>
  );
};

export default UploadSection; 