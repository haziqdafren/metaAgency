import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, XCircle, ChevronDown, Sheet, Send, X } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase'; // Import supabase

const PerformanceUpload = () => {
  const { theme } = useThemeStore();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [threshold, setThreshold] = useState(1000); // Default threshold for distribution
  const [loading, setLoading] = useState(false); // Add loading state
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [distributionType, setDistributionType] = useState(null);

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setUploadError('');
        // In a real application, you'd process the Excel file here
        // For now, we'll assume a successful read and use dummy data for preview
        simulateExcelRead(selectedFile);
      } else {
        setFile(null);
        setPreviewData(null);
        setUploadError('Invalid file type. Please upload an Excel (.xlsx) file.');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setUploadError('');
        simulateExcelRead(selectedFile);
      } else {
        setFile(null);
        setPreviewData(null);
        setUploadError('Invalid file type. Please upload an Excel (.xlsx) file.');
      }
    }
  };

  const simulateExcelRead = (file) => {
    // In a real application, you'd use a library like 'xlsx' to parse the file
    // For this dummy implementation, we'll create some mock data that matches our schema
    const dummyData = [
      { username_tiktok: 'talent_lisa', total_diamonds: 1500000, total_views: 1000000, total_interactions: 50000 },
      { username_tiktok: 'gamer_pro', total_diamonds: 800000, total_views: 600000, total_interactions: 30000 },
      { username_tiktok: 'beauty_guru', total_diamonds: 2000000, total_views: 1200000, total_interactions: 70000 },
      { username_tiktok: 'food_explorer', total_diamonds: 400000, total_views: 300000, total_interactions: 15000 },
    ];
    setPreviewData({ filename: file.name, data: dummyData });
    setUploadSuccess('');
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!selectedMonth || !selectedYear) {
      setUploadError('Please select a month and year.');
      return;
    }

    setLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // 1. Insert into performance_reports table
      const { data: reportData, error: reportError } = await supabase
        .from('performance_reports')
        .insert({
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear),
          total_diamonds: previewData.data.reduce((sum, row) => sum + row.total_diamonds, 0),
          total_views: previewData.data.reduce((sum, row) => sum + row.total_views, 0),
          total_interactions: previewData.data.reduce((sum, row) => sum + row.total_interactions, 0),
        })
        .select();

      if (reportError) throw reportError;
      const performanceReportId = reportData[0].id;

      // 2. Fetch talent_ids based on username_tiktok from talent_profiles
      const tiktokUsernames = previewData.data.map(row => row.username_tiktok);
      const { data: talents, error: talentsError } = await supabase
        .from('talent_profiles')
        .select('id, username_tiktok')
        .in('username_tiktok', tiktokUsernames);

      if (talentsError) throw talentsError;

      const talentMap = new Map(talents.map(talent => [talent.username_tiktok, talent.id]));

      // 3. Insert into talent_performance table
      const talentPerformanceInserts = previewData.data.map(row => ({
        talent_id: talentMap.get(row.username_tiktok),
        performance_report_id: performanceReportId,
        diamond_earned: row.total_diamonds,
        views_generated: row.total_views,
        interactions_generated: row.total_interactions,
      }));

      const { error: talentPerformanceError } = await supabase
        .from('talent_performance')
        .insert(talentPerformanceInserts);

      if (talentPerformanceError) throw talentPerformanceError;

      setUploadSuccess('Performance data uploaded successfully!');
      setFile(null);
      setPreviewData(null);
      setSelectedMonth('');
      setSelectedYear('');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDistributionClick = (type) => {
    if (!previewData) {
      setUploadError('Please upload and preview data first before distributing.');
      return;
    }
    setDistributionType(type);
    setIsDistributionModalOpen(true);
  };

  const confirmDistribution = () => {
    // This part would ideally trigger a Supabase Function or a backend service
    // to send out notifications/data to talents, e.g., via WhatsApp API.
    // For now, it remains a dummy alert.
    let message = '';
    if (distributionType === 'all') {
      message = 'Simulating sending performance data to all talents.';
    } else if (distributionType === 'threshold') {
      message = `Simulating sending performance data to talents with ${threshold}+ diamonds.`;
    } else if (distributionType === 'whatsapp') {
      message = 'Simulating generating WhatsApp format and preparing to send.';
    }
    setUploadSuccess(message);
    setIsDistributionModalOpen(false);
    setDistributionType(null);
  };

  const closeDistributionModal = () => {
    setIsDistributionModalOpen(false);
    setDistributionType(null);
    setUploadError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-gray-50 text-meta-black'}`}
    >
      <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Upload Monthly Performance Data</h1>

      {/* Upload Section */}
      <div className={`mb-8 p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Upload File</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="month-select" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Month</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
            >
              <option value="">Select Month</option>
              {months.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year-select" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Year</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
            >
              <option value="">Select Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'border-meta-gray-700 bg-meta-gray-800 hover:bg-meta-gray-700' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        >
          <UploadCloud className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`} />
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Drag & Drop or Click to Upload Excel File</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>.xlsx format only</p>
          <input
            type="file"
            id="file-input"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {file && (
          <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Selected file: <span className="font-medium">{file.name}</span></p>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {uploadError}
          </div>
        )}

        <button
          onClick={handleUpload}
          className="mt-6 bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!file || !selectedMonth || !selectedYear || loading}
        >
          {loading ? 'Uploading...' : <><Sheet className="w-5 h-5" /> <span>Upload Data</span></>}
        </button>
      </div>

      {/* Preview Section */}
      {previewData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`mb-8 p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Preview Data: {previewData.filename}</h2>
          <div className={`overflow-x-auto rounded-lg border ${theme === 'dark' ? 'border-meta-gray-700' : 'border-gray-200'}`}>
            <table className="min-w-full divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
              <thead className={`${theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>TikTok Username</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Total Diamonds</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Total Views</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Total Interactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
                {previewData.data.map((row, index) => (
                  <tr key={index} className={`${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{row.username_tiktok}</td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>{row.total_diamonds.toLocaleString()}</td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>{row.total_views.toLocaleString()}</td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>{row.total_interactions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Distribution Section */}
      <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Distribute Performance Reports</h2>
        
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-500 text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {uploadSuccess}
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => handleDistributionClick('all')}
            className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!previewData}
          >
            <Send className="w-5 h-5" />
            <span>Distribute to All Talents</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDistributionClick('threshold')}
              className="bg-purple-600 text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!previewData}
            >
              <Send className="w-5 h-5" />
              <span>Distribute to Talents with &gt;</span>
            </button>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className={`w-24 p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
              disabled={!previewData}
            />
            <span className={`${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}> Diamonds</span>
          </div>
          <button
            onClick={() => handleDistributionClick('whatsapp')}
            className="bg-green-600 text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!previewData}
          >
            <Sheet className="w-5 h-5" />
            <span>Generate WhatsApp Format</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isDistributionModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`relative w-full max-w-md mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-white text-meta-black'}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={closeDistributionModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Confirm Distribution</h2>
              <p className="mb-6">
                Are you sure you want to {distributionType === 'all' && 'distribute performance data to all talents'}
                {distributionType === 'threshold' && `distribute performance data to talents with > ${threshold} diamonds`}
                {distributionType === 'whatsapp' && 'generate WhatsApp format and prepare to send'}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeDistributionModal}
                  className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDistribution}
                  className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PerformanceUpload; 