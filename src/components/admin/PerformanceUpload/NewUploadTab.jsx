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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('🔴 No file selected');
      return;
    }
    
    console.log('🔵 Starting file upload:', file.name, file.size, 'bytes');
    
    setLoading(true);
    setUploadError('');
    setUploadSuccess('');
    setCreatorData([]); // Clear previous data
    
    try {
      console.log('🔵 Validating file...');
      // Validate file first
      validateFile(file);
      console.log('✅ File validation passed');
      
      console.log('🔵 Loading XLSX library...');
      const XLSX = await import('xlsx');
      console.log('✅ XLSX library loaded');
      
      console.log('🔵 Reading file data...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('✅ File parsed, found', rows.length, 'rows');

      // Find the header row
      console.log('🔵 Finding header row...');
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
      console.log('✅ Header row found at index:', headerRowIdx);
      
      const headers = rows[headerRowIdx];
      const dataRows = rows.slice(headerRowIdx + 1);
      console.log('🔵 Processing', dataRows.length, 'data rows...');

      const processedData = dataRows
        .map((rowArr, index) => {
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = rowArr[idx];
          });
          
          const processed = {
            creator_id: row['Creator ID:'] || '',
            username_tiktok: row["Creator's username"] || row["Creator username"] || '',
            followers_count: parseInt(row['Followers'] || row['Followers Count'] || '0', 10),
            konten_kategori: mapCategory(row['Group'] || row['Category'] || ''),
            game_preference: extractGames(row['Notes'] || ''),
            joined_date: parseDate(row['Joined time'] || row['Join Date'] || ''),
            days_since_joining: parseInt(row['Days since joining'] || '0', 10),
            graduation_status: row['Graduation status'] || '',
            status: row['Relationship status'] === 'Effective' ? 'active' : 'inactive',
            diamonds: parseInt(row['Diamonds'] || '0', 10),
            validDays: parseInt(row['Valid go LIVE days'] || '0', 10),
            liveDuration: row['LIVE duration'] || '',
            newFollowers: parseInt(row['New followers'] || '0', 10),
            liveStreams: parseInt(row['LIVE streams'] || '0', 10),
            diamondsVsLastMonth: row['Diamonds - Vs. last month'] || '0%',
            durationVsLastMonth: row['LIVE duration - Vs. last month'] || '0%',
            followersVsLastMonth: row['New followers - Vs. last month'] || '0%',
            diamondsAchieved: row['Diamonds - Percentage achieved'] || '0%',
            durationAchieved: row['LIVE duration - Percentage achieved'] || '0%',
            validDaysAchieved: row['Valid go LIVE days - Percentage achieved'] || '0%',
            subscriptionRevenue: parseFloat(row['Subscription revenue'] || '0'),
            period: row['Data period'] || '',
            graduationStatus: row['Graduation status'] || '',
            creatorNetworkManager: row['Creator Network manager'] || ''
          };
          
          if (index < 3) {
            console.log(`Sample processed row ${index}:`, processed);
          }
          
          return processed;
        })
        // Only include creators managed by the specified email
        .filter((creator, index) => {
          const validManager = creator.creatorNetworkManager === 'mediaentertainmenttalentagency@gmail.com';
          if (!validManager && index < 5) {
            console.log(`🔴 Filtered out row (not correct manager) ${index}:`, creator);
          }
          return validManager;
        })
        // Remove empty rows
        .filter((creator, index) => {
          const valid = creator.username_tiktok && creator.username_tiktok.trim() !== '';
          if (!valid && index < 5) {
            console.log(`🔴 Filtered out row (empty username) ${index}:`, creator);
          }
          return valid;
        });

      console.log('✅ Data processing complete. Valid creators:', processedData.length);

      if (processedData.length === 0) {
        console.log('🔴 No valid data found after processing');
        throw new Error('No valid creator data found. Please check your Excel file format.');
      }

      console.log('🔵 Setting creator data state...');
      setCreatorData(processedData);
      console.log('✅ Creator data state set. Length:', processedData.length);
      
      const successMsg = `✅ Successfully parsed ${processedData.length} creators! Period: ${processedData[0]?.period || 'Unknown'}`;
      console.log('🔵 Setting success message:', successMsg);
      setUploadSuccess(successMsg);
      
      // Generate basic messages for the Messages tab
      console.log('🔵 Generating messages...');
      const generatedMessages = processedData.map(creator => ({
        username: creator.username_tiktok,
        message: `📊 Performance Report for @${creator.username_tiktok}\n💎 Diamonds: ${creator.diamonds.toLocaleString('id-ID')}\n📅 Valid Days: ${creator.validDays}\n⏱️ Live Duration: ${creator.liveDuration}`
      }));
      
      console.log('✅ Messages generated:', generatedMessages.length);
      
      // Notify parent about upload completion
      if (onUploadComplete) {
        console.log('🔵 Notifying parent component...');
        onUploadComplete(processedData, generatedMessages);
        console.log('✅ Parent component notified');
      }
      
      console.log('🎉 FILE UPLOAD COMPLETE! CreatorData should now have', processedData.length, 'items');
      
    } catch (error) {
      console.error('🔴 Upload error:', error);
      setUploadError('Error processing file: ' + error.message);
    } finally {
      console.log('🔵 Cleaning up, setting loading to false');
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
    activeCreators: creatorData.filter(c => c.validDays >= 20).length,
    totalDiamonds: creatorData.reduce((sum, c) => sum + c.diamonds, 0),
    topPerformer: creatorData.length > 0 ? creatorData.reduce((max, c) => c.diamonds > max.diamonds ? c : max, creatorData[0]) : null
  };

  const paginatedData = creatorData.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize);
  const totalPages = Math.ceil(creatorData.length / previewPageSize);

  return (
    <div className="space-y-6">
      {/* Debug Panel - ALWAYS VISIBLE */}
      <div className="bg-gray-100 p-3 rounded text-xs font-mono">
        <div><strong>Debug:</strong> creatorData.length = {creatorData.length}</div>
        <div><strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}</div>
        <div><strong>uploadSuccess:</strong> {uploadSuccess ? 'Yes' : 'No'}</div>
        <div><strong>Has data for save button:</strong> {creatorData.length > 0 ? 'YES - SHOULD SHOW SAVE BUTTON' : 'NO'}</div>
      </div>

      {/* Upload Success Message */}
      {creatorData.length > 0 && (
        <div className="bg-green-100 border-2 border-green-500 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">✅ Upload Complete!</h3>
              <p className="text-green-700 text-sm">Found {creatorData.length} creators. Go to Messages & Export tab to save to database.</p>
            </div>
          </div>
        </div>
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
                <h4 className="font-semibold text-gray-900 mb-1">Next Steps</h4>
                <p className="text-sm text-gray-600">
                  Data uploaded successfully! Go to the Messages & Export tab to save to database and generate messages.
                </p>
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
                    <CompactTable.Cell>{creator.validDays}</CompactTable.Cell>
                    <CompactTable.Cell>{creator.liveDuration}</CompactTable.Cell>
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