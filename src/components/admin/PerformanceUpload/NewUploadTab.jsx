import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Users, TrendingUp, Target, FileText } from 'lucide-react';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';
import CompactCard from '../CompactCard';
import CompactTable from '../CompactTable';

const NewUploadTab = ({ onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [creatorData, setCreatorData] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const previewPageSize = 10;

  // Helper functions
  const extractGames = (notes) => {
    const games = [];
    const gameKeywords = ['PUBG', 'Mobile Legends', 'Free Fire', 'COD', 'Valorant'];
    gameKeywords.forEach(game => {
      if (notes && notes.toLowerCase().includes(game.toLowerCase())) {
        games.push(game);
      }
    });
    return games.join(', ');
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const cleaned = dateStr.replace(/[()]/g, '').split(' ')[0];
      return cleaned.replace(/:/g, '-');
    } catch {
      return null;
    }
  };

  const mapCategory = (group) => {
    const categoryMap = {
      'G': 'gaming',
      'E': 'entertainment',
      'L': 'lifestyle',
      'ED': 'education',
      'M': 'music'
    };
    return categoryMap[group] || 'other';
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a valid Excel file (.xlsx or .xls)');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
  };

  // Helper to get a value from row by possible column names (case-insensitive, trimmed)
  const getColumnValue = (row, possibleNames) => {
    for (const key of Object.keys(row)) {
      for (const name of possibleNames) {
        if (key.trim().toLowerCase() === name.trim().toLowerCase()) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    // Set upload active state to extend session timeout
    localStorage.setItem('adminUploadActive', 'true');
    localStorage.setItem('adminLastActivity', Date.now().toString());
    
    setLoading(true);
    setUploadError('');
    setUploadSuccess('');
    setCreatorData([]); // Clear previous data
    
    try {
      // Validate file first
      validateFile(file);
      
      const XLSX = await import('xlsx');
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Find the header row
      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        if (
          rows[i].includes('Creator ID') &&
          (rows[i].includes("Creator's username") || rows[i].includes("Creator username"))
        ) {
          headerRowIdx = i;
          break;
        }
      }
      
      const headers = rows[headerRowIdx];
      
      // Enhanced auto-detection of Creator ID column with more patterns
      const creatorIdColumn = headers.find(header => {
        if (!header) return false;
        const headerLower = header.toLowerCase().trim();
        return (
          headerLower.includes('creator id') ||
          headerLower.includes('creatorid') ||
          headerLower.includes('creator_id') ||
          headerLower === 'id' ||
          headerLower === 'creator id:' ||
          headerLower.includes('tiktok id') ||
          headerLower.includes('tiktokid') ||
          headerLower.includes('user id') ||
          headerLower.includes('userid') ||
          (headerLower.startsWith('id') && headerLower.length <= 5)
        );
      });
      
      const dataRows = rows.slice(headerRowIdx + 1);

      const processedData = dataRows
        .map((rowArr, index) => {
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = rowArr[idx];
          });
          
          // Enhanced Creator ID extraction with multiple fallback strategies
          let creatorId = '';
          
          // Strategy 1: Use auto-detected column
          if (creatorIdColumn && row[creatorIdColumn]) {
            creatorId = String(row[creatorIdColumn]).trim();
          }
          
          // Strategy 2: Try exact column name matches
          if (!creatorId) {
            const fallbackColumns = [
              'Creator ID:', 'Creator ID', 'CreatorID', 'creator_id', 'ID',
              'TikTok ID', 'TikTokID', 'tiktok_id', 'User ID', 'UserID',
              'Creator ID ', ' Creator ID', 'creator id', 'CREATOR ID'
            ];
            
            for (const col of fallbackColumns) {
              if (row[col]) {
                creatorId = String(row[col]).trim();
                break;
              }
            }
          }
          
          // Strategy 3: Search all columns for numeric IDs
          if (!creatorId) {
            for (const [key, value] of Object.entries(row)) {
              if (key && key.toLowerCase().includes('id') && value) {
                const strValue = String(value).trim();
                // Check if it looks like a TikTok Creator ID (long numeric string)
                if (/^\d{10,}$/.test(strValue)) {
                  creatorId = strValue;
                  break;
                }
              }
            }
          }
          
          // Robust mapping for valid_days and live_duration
          const validDays = parseInt(
            getColumnValue(row, [
              'Valid go LIVE days',
              'Valid days',
              'Valid days(d)',
              'Valid go LIVE days ',
              'Valid go LIVE days'.trim(),
              'Valid go LIVE days last month',
              'Valid go LIVE days - Percentage achieved',
            ]) || 0
          );
          const liveDuration =
            getColumnValue(row, [
              'LIVE duration',
              'Live duration',
              'LIVE duration(h)',
              'LIVE duration (hours)',
              'LIVE duration (hours) last month',
              'LIVE duration - Percentage achieved',
            ]) || '0h 0m';

          // Process the data
          const processed = {
            creator_id: creatorId,
            username_tiktok: row["Creator's username"] || row["Creator username"] || row["Username"] || row["Creator nickname"] || '',
            followers_count: parseInt(row["Followers count"] || row["Followers"] || 0),
            konten_kategori: mapCategory(row["Content category"] || row["Category"] || row["Group"] || ''),
            game_preference: extractGames(row["Notes"] || row["Description"] || ''),
            joined_date: parseDate(row["Joined date"] || row["Join date"] || ''),
            days_since_joining: parseInt(row["Days since joining"] || 0),
            graduation_status: row["Graduation status"] || row["Status"] || 'active',
            status: row["Status"] || 'active',
            link_tiktok: row["TikTok link"] || row["Link"] || '',
            nomor_wa: row["WhatsApp number"] || row["Phone"] || '',
            diamonds: parseInt(row["Diamonds"] || 0),
            valid_days: validDays,
            live_duration: liveDuration,
            new_followers: parseInt(row["New followers"] || 0),
            diamonds_vs_last_month: row["Diamonds vs last month"] || '0%',
            live_streams: parseInt(row["Live streams"] || 0),
            subscription_revenue: parseFloat(row["Subscription revenue"] || 0),
            period: row["Period"] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
            raw_data: row
          };
          
          return processed;
        })
        .filter(creator => {
          // Filter out invalid entries
          if (!creator.username_tiktok || creator.username_tiktok.trim() === '') {
            return false;
          }
          return true;
        });

      if (processedData.length === 0) {
        throw new Error('No valid creator data found in the file.');
      }

      setCreatorData(processedData);
      
      const successMsg = `✅ Successfully parsed ${processedData.length} creators! Period: ${processedData[0]?.period || 'Unknown'}`;
      setUploadSuccess(successMsg);
      
      // Generate messages for the uploaded data
      const generatedMessages = processedData.map(creator => ({
        username: creator.username_tiktok,
        message: `Hi @${creator.username_tiktok}, your performance data has been uploaded successfully!`
      }));
      
      if (onUploadComplete) {
        onUploadComplete(processedData, generatedMessages);
      }
      
    } catch (error) {
      setUploadError(error.message);
    } finally {
      // Clear upload active state when done (but keep it if user goes to save)
      // Don't remove here - let the save operation handle it
      setLoading(false);
    }
  };


  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files: [files[0]] } };
      handleFileUpload(fakeEvent);
    }
  };

  const stats = {
    totalCreators: creatorData.length,
    activeCreators: creatorData.filter(c => c.valid_days >= 20).length,
    totalDiamonds: creatorData.reduce((sum, c) => sum + c.diamonds, 0),
    topPerformer: creatorData.length > 0 ? creatorData.reduce((max, c) => c.diamonds > max.diamonds ? c : max, creatorData[0]) : null
  };

  const paginatedData = creatorData.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize);
  const totalPages = Math.ceil(creatorData.length / previewPageSize);

  return (
    <div className="space-y-6">
      {/* Upload Success Message */}
      {creatorData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border-2 border-green-500 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">✅ Upload Complete!</h3>
              <p className="text-green-700 text-sm">
                Found {creatorData.length} creators from period: <strong>{creatorData[0]?.period || 'Unknown'}</strong>
              </p>
              <p className="text-green-600 text-xs mt-1">
                🔒 Session timeout extended for upload operations. Go to Messages & Export tab to save to database.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Section */}
      <CompactCard title="Upload Performance Data" compact>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Upload Creator Data Excel (from TikTok Backstage)
            </span>
            <div 
              className={`mt-2 border-2 border-dashed rounded-lg transition-all ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${loading ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className={`flex justify-center px-6 pt-5 pb-6 w-full h-full ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="space-y-1 text-center">
                  {isDragOver ? (
                    <FileText className="mx-auto h-12 w-12 text-blue-500" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      {isDragOver ? 'Drop your file here' : 'Upload a file'}
                    </span>
                    {!isDragOver && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isDragOver ? 'Release to upload' : 'XLSX, XLS up to 10MB'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="sr-only"
                  disabled={loading}
                />
              </label>
            </div>
          </label>
          
          {loading && (
            <div className="flex justify-center items-center py-4">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-sm text-gray-600">Parsing file...</span>
            </div>
          )}
          
          {uploadError && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              {uploadError}
            </div>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              {uploadSuccess}
            </div>
          )}
        </div>
      </CompactCard>

      {/* Quick Stats & Action Panel */}
      {creatorData.length > 0 && (
        <CompactCard title="Upload Summary & Actions" compact>
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalCreators}</div>
                    <div className="text-sm text-blue-600">Total Creators</div>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </motion.div>
              
              <motion.div
                className="bg-green-50 rounded-lg p-4 border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700">{stats.activeCreators}</div>
                    <div className="text-sm text-green-600">Active (20+ days)</div>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </motion.div>
              
              <motion.div
                className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-purple-700">
                      {stats.totalDiamonds.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-purple-600">Total Diamonds</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </motion.div>
              
              <motion.div
                className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-yellow-700">
                      {stats.topPerformer?.username_tiktok || '-'}
                    </div>
                    <div className="text-sm text-yellow-600">Top Performer</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </motion.div>
            </div>

            {/* Next Steps Info */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
                    Go to <strong>Messages & Export</strong> tab
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
                    Click <strong>Save to Database</strong> to store performance data
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                    Generate and copy WhatsApp messages
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CompactCard>
      )}

      {/* Compact Preview Table */}
      {creatorData.length > 0 && (
        <CompactCard 
          title={`Data Preview (${creatorData.length} creators)`} 
          subtitle={`Period: ${creatorData[0]?.period || 'Unknown'}`}
          compact
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-4">
            <CompactTable compact>
              <CompactTable.Head>
                <CompactTable.Row>
                  <CompactTable.Header>Username</CompactTable.Header>
                  <CompactTable.Header>Diamonds</CompactTable.Header>
                  <CompactTable.Header>Valid Days</CompactTable.Header>
                  <CompactTable.Header>Live Duration</CompactTable.Header>
                  <CompactTable.Header>Status</CompactTable.Header>
                </CompactTable.Row>
              </CompactTable.Head>
              <CompactTable.Body>
                {paginatedData.map((creator, idx) => (
                  <CompactTable.Row key={idx}>
                    <CompactTable.Cell className="font-medium">
                      @{creator.username_tiktok}
                    </CompactTable.Cell>
                    <CompactTable.Cell>
                      {creator.diamonds.toLocaleString('id-ID')}
                    </CompactTable.Cell>
                    <CompactTable.Cell>{creator.valid_days}</CompactTable.Cell>
                    <CompactTable.Cell>{creator.live_duration}</CompactTable.Cell>
                    <CompactTable.Cell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        creator.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {creator.status}
                      </span>
                    </CompactTable.Cell>
                  </CompactTable.Row>
                ))}
              </CompactTable.Body>
            </CompactTable>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setPreviewPage(p => Math.max(1, p - 1))} 
                  disabled={previewPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {previewPage} of {totalPages}
                </span>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))} 
                  disabled={previewPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CompactCard>
      )}
    </div>
  );
};

export default NewUploadTab;