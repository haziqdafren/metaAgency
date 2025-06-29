import React, { useState } from 'react';
import { supabase, findOrCreateCreator } from '../../../lib/supabase';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';
import useAuthStore from '../../../store/authStore';
import * as Yup from 'yup';
import { CheckCircle, AlertCircle } from 'lucide-react';

const creatorSchema = Yup.object().shape({
  username_tiktok: Yup.string().nullable().transform((value) => value || null),
  creator_id: Yup.string().nullable().transform((value) => value || null),
  link_tiktok: Yup.string().nullable().transform((value) => value || null),
  nomor_wa: Yup.string().nullable().transform((value) => value || null),
  followers_count: Yup.number()
    .transform((value) => (isNaN(value) || value === null || value === undefined) ? 0 : value)
    .min(0, 'Followers count must be >= 0')
    .default(0),
  konten_kategori: Yup.string().nullable().transform((value) => value || null),
  game_preference: Yup.string().nullable().transform((value) => value || null),
  status: Yup.string().nullable().transform((value) => value || 'active'),
  joined_date: Yup.date().nullable().transform((value) => {
    if (!value || value === 'Invalid Date') return null;
    return value;
  }),
  days_since_joining: Yup.number()
    .nullable()
    .transform((value) => (isNaN(value) || value === null || value === undefined) ? 0 : value),
  graduation_status: Yup.string().nullable().transform((value) => value || null),
});

const UploadSection = ({ onUploadComplete, onNotification }) => {
  // Basic loading state
  const [loading, setLoading] = useState(false);
  
  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Save to database states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Debug and validation states
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  
  const { profile } = useAuthStore();

  const mapCategory = (group) => {
    const categoryMap = {
      'G': 'gaming',
      'E': 'entertainment',
      'L': 'lifestyle',
      'ED': 'education',
      'M': 'music',
      'O': 'other'
    };
    return categoryMap[group?.toUpperCase()] || 'other';
  };

  const extractGames = (notes) => {
    if (!notes) return null;
    const gameKeywords = ['PUBG', 'Mobile Legends', 'Free Fire', 'Genshin Impact', 'Valorant', 'CS:GO', 'Dota 2', 'League of Legends'];
    const foundGames = gameKeywords.filter(game => notes.toUpperCase().includes(game.toUpperCase()));
    return foundGames.length > 0 ? foundGames.join(', ') : null;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Handle various date formats
      if (typeof dateStr === 'string') {
        // Try dd/mm/yyyy format first
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return new Date(year, month - 1, day);
        }
        // Try yyyy-mm-dd format
        if (dateStr.includes('-')) {
          return new Date(dateStr);
        }
        // Try other formats
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleManageCreatorsUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      onNotification({ message: 'Unauthorized: Only admins can import data.', type: 'error', isVisible: true });
      return;
    }
    
    // Reset all states
    setLoading(true);
    setUploadProgress({ current: 0, total: 0 });
    setUploadError('');
    setUploadSuccess('');
    setSaveError('');
    setSaveSuccess('');
    setIsSaved(false);
    setProcessedData([]);
    setValidationSummary(null);
    setDebugInfo(null);
    
    let validCount = 0;
    let invalidRows = [];
    let processedRows = 0;
    let filteredData = [];
    
    try {
      // Step 1: Parse Excel file
      setUploadProgress({ current: 0, total: 100 });
      onNotification({ message: '📁 Reading Excel file...', type: 'info', isVisible: true });
      
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      setUploadProgress({ current: 20, total: 100 });
      
      console.log('Excel rows found:', rows.length);
      console.log('First row (metadata):', rows[0]);
      console.log('Second row (headers):', rows[1]);
      console.log('Third row (sample data):', rows[2]);
      
      // Handle 3-row structure: metadata, headers, data
      let headerRow = 1; // Second row (index 1) contains headers
      let dataStartRow = 2; // Third row (index 2) starts data
      
      // Check if first row is metadata (contains "Exported at")
      if (rows.length > 0 && rows[0] && rows[0][0] && rows[0][0].toString().toLowerCase().includes('exported at')) {
        console.log('✅ Detected metadata row, using row 2 as headers');
        headerRow = 1;
        dataStartRow = 2;
      } else {
        console.log('⚠️ No metadata row detected, assuming row 1 is headers');
        headerRow = 0;
        dataStartRow = 1;
      }
      
      const headers = rows[headerRow];
      const dataRows = rows.slice(dataStartRow);
      
      setUploadProgress({ current: 40, total: 100 });
      
      console.log('Headers:', headers);
      console.log('Data rows to process:', dataRows.length);
      
      // Capture debug info
      setDebugInfo({
        totalRows: dataRows.length,
        columns: headers,
        sampleRow: dataRows[0],
        timestamp: new Date().toISOString(),
        headerRow: headerRow,
        dataStartRow: dataStartRow
      });
      
      // Step 2: Process each data row with progress tracking
      for (const [index, rowArr] of dataRows.entries()) {
        processedRows++;
        
        // Update progress every 10 rows or at the end
        if (index % 10 === 0 || index === dataRows.length - 1) {
          const progress = 40 + Math.round((index / dataRows.length) * 40);
          setUploadProgress({ current: progress, total: 100 });
        }
        
        // Convert array to object using headers
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = rowArr[idx];
        });
        
        try {
          // Check Creator Network manager filter
          const networkManager = row['Creator Network manager'] || row['Creator Network Manager'] || row['Network Manager'] || '';
          if (networkManager !== 'mediaentertainmenttalentagency@gmail.com') {
            console.log(`⏭️ Skipping row ${index + dataStartRow + 1}: Wrong network manager (${networkManager})`);
            continue;
          }
          
          // Enhanced field mapping with multiple fallbacks
          const creatorData = {
            creator_id: row['Creator ID:'] || row['Creator ID'] || row['creator_id'] || row['CreatorID'] || row['ID'] || null,
            username_tiktok: row["Creator's username"] || row['Creator username'] || row['Username'] || row['username_tiktok'] || row['Creator Username'] || row['Creator nickname'] || null,
            followers_count: parseInt(row['Followers']) || parseInt(row['followers_count']) || parseInt(row['Followers Count']) || parseInt(row['Followers count']) || 0,
            konten_kategori: mapCategory(row['Group'] || row['Category'] || row['konten_kategori'] || row['Content category'] || ''),
            game_preference: extractGames(row['Notes'] || row['Game Preference'] || row['game_preference'] || row['Description'] || ''),
            joined_date: parseDate(row['Joined time'] || row['Joined Date'] || row['joined_date'] || row['Join date']),
            days_since_joining: parseInt(row['Days since joining']) || parseInt(row['days_since_joining']) || 0,
            graduation_status: row['Graduation status'] || row['graduation_status'] || row['Status'] || null,
            status: (row['Relationship status'] || row['Status'] || '').toLowerCase() === 'effective' ? 'active' : 'inactive',
            link_tiktok: row['TikTok Link'] || row['link_tiktok'] || row['Link'] || row['TikTok link'] || null,
            nomor_wa: row['WhatsApp'] || row['nomor_wa'] || row['WhatsApp Number'] || row['Phone'] || null,
          };

          // Normalize empty strings to null for all optional fields
          Object.keys(creatorData).forEach(key => {
            if (typeof creatorData[key] === 'string' && creatorData[key].trim() === '') {
              creatorData[key] = null;
            }
          });

          console.log(`🔍 Processing row ${index + dataStartRow + 1}:`, {
            username: creatorData.username_tiktok,
            networkManager: networkManager,
            creatorId: creatorData.creator_id
          });

          // Enhanced validation with detailed error messages
          const validationErrors = [];
          
          // Require username_tiktok (TikTok username) for every row
          if (!creatorData.username_tiktok) {
            validationErrors.push('Username TikTok ("Creator\'s username") is required and cannot be empty');
          }
          // Only validate that if creator_id is provided, it's not empty
          if (creatorData.creator_id !== null && creatorData.creator_id !== undefined && creatorData.creator_id.toString().trim() === '') {
            validationErrors.push('Creator ID cannot be empty if provided');
          }
          // Validate followers_count is a valid number if provided
          if (creatorData.followers_count !== null && creatorData.followers_count !== undefined && (isNaN(creatorData.followers_count) || creatorData.followers_count < 0)) {
            validationErrors.push('Followers count must be a valid number >= 0');
          }
          
          if (validationErrors.length > 0) {
            invalidRows.push({ 
              rowNumber: index + dataStartRow + 1,
              row: row, 
              errors: validationErrors,
              processedData: creatorData 
            });
            continue;
          }

          // Try to validate with Yup schema
          try {
            await creatorSchema.validate(creatorData, { abortEarly: false });
          } catch (yupError) {
            invalidRows.push({ 
              rowNumber: index + dataStartRow + 1,
              row: row, 
              errors: yupError.errors,
              processedData: creatorData 
            });
            continue;
          }

          // Add to filtered data for saving
          filteredData.push(creatorData);
          validCount++;
          
        } catch (error) {
          invalidRows.push({ 
            rowNumber: index + dataStartRow + 1,
            row: row, 
            errors: [`Processing error: ${error.message}`],
            processedData: null 
          });
        }
      }
      
      setUploadProgress({ current: 90, total: 100 });
      onNotification({ message: '✅ File processing complete!', type: 'success', isVisible: true });
      
      // Store processed data for saving
      setProcessedData(filteredData);
      
      // Set validation summary
      setValidationSummary({
        totalRows: processedRows,
        validCount,
        invalidCount: invalidRows.length,
        errors: invalidRows.slice(0, 5) // Show first 5 errors
      });

      const successMessage = `✅ Upload complete: ${validCount} valid creators found, ${invalidRows.length} failed validation.`;
      setUploadSuccess(successMessage);
      onNotification({ 
        message: successMessage, 
        type: invalidRows.length === 0 ? 'success' : 'warning', 
        isVisible: true 
      });
      
      setUploadProgress({ current: 100, total: 100 });
      
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = 'Error processing file: ' + error.message;
      setUploadError(errorMessage);
      onNotification({ message: errorMessage, type: 'error', isVisible: true });
    } finally {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const downloadSampleTemplate = async () => {
    const XLSX = await import('xlsx');
    const sampleData = [
      {
        'Creator ID:': 'CREATOR001',
        "Creator's username": 'sample_creator',
        'Followers': 50000,
        'Group': 'G',
        'Notes': 'PUBG, Mobile Legends',
        'Joined time': '15/01/2024',
        'Days since joining': 30,
        'Graduation status': 'Active',
        'Relationship status': 'Effective',
        'TikTok Link': 'https://www.tiktok.com/@sample_creator',
        'WhatsApp': '+6281234567890',
        'Creator Network manager': 'mediaentertainmenttalentagency@gmail.com'
      },
      {
        'Creator ID:': '',
        "Creator's username": 'another_creator',
        'Followers': 75000,
        'Group': 'E',
        'Notes': 'Entertainment content',
        'Joined time': '01/02/2024',
        'Days since joining': 15,
        'Graduation status': 'Active',
        'Relationship status': 'Effective',
        'TikTok Link': 'https://www.tiktok.com/@another_creator',
        'WhatsApp': '+6281234567891',
        'Creator Network manager': 'mediaentertainmenttalentagency@gmail.com'
      },
      {
        'Creator ID:': 'CREATOR003',
        "Creator's username": '',
        'Followers': '',
        'Group': 'L',
        'Notes': '',
        'Joined time': '',
        'Days since joining': '',
        'Graduation status': '',
        'Relationship status': 'Inactive',
        'TikTok Link': '',
        'WhatsApp': '',
        'Creator Network manager': 'mediaentertainmenttalentagency@gmail.com'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Template');
    XLSX.writeFile(wb, 'Talent_Import_Template.xlsx');
    onNotification({ message: 'Sample template downloaded!', type: 'success', isVisible: true });
  };

  // Save to database function with progress tracking
  const saveToDatabase = async () => {
    if (processedData.length === 0) {
      setSaveError('No valid data to save. Please upload a file first.');
      return;
    }
    
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    setSaveProgress({ current: 0, total: processedData.length });
    setIsSaved(false);
    
    let savedCount = 0;
    let errorCount = 0;
    
    try {
      onNotification({ message: '💾 Starting database save...', type: 'info', isVisible: true });
      
      for (const [idx, creatorData] of processedData.entries()) {
        try {
          // Update progress
          setSaveProgress({ current: idx + 1, total: processedData.length });
          
          // Use centralized creator management
          const { creator: existingCreator, error: findError } = await findOrCreateCreator({
            creator_id: creatorData.creator_id,
            username_tiktok: creatorData.username_tiktok,
            followers_count: creatorData.followers_count,
            konten_kategori: creatorData.konten_kategori,
            game_preference: creatorData.game_preference,
            joined_date: creatorData.joined_date,
            days_since_joining: creatorData.days_since_joining,
            graduation_status: creatorData.graduation_status,
            status: creatorData.status,
            link_tiktok: creatorData.link_tiktok,
            nomor_wa: creatorData.nomor_wa
          });
          
          if (findError) {
            console.error(`Error managing creator ${creatorData.username_tiktok}:`, findError);
            errorCount++;
            continue;
          }
          
          if (existingCreator) {
            savedCount++;
            console.log(`✅ Updated creator: ${creatorData.username_tiktok} (TikTok ID: ${creatorData.creator_id})`);
          } else {
            savedCount++;
            console.log(`✅ Created new creator: ${creatorData.username_tiktok} (TikTok ID: ${creatorData.creator_id})`);
          }
          
          // Update notification every 10 creators or at the end
          if ((idx + 1) % 10 === 0 || idx === processedData.length - 1) {
            onNotification({ 
              message: `💾 Saving progress: ${idx + 1}/${processedData.length} creators processed...`, 
              type: 'info', 
              isVisible: true 
            });
          }
          
        } catch (error) {
          console.error(`Error processing ${creatorData.username_tiktok}:`, error);
          errorCount++;
        }
      }
      
      setIsSaved(true);
      const successMessage = `🎉 Successfully saved ${savedCount} creators to database!${errorCount > 0 ? ` (${errorCount} errors)` : ''}`;
      setSaveSuccess(successMessage);
      onNotification({ message: successMessage, type: 'success', isVisible: true });
      
      // Clear success message after delay
      setTimeout(() => {
        setSaveSuccess('');
      }, 5000);
      
      // Trigger refresh of talents list
      if (onUploadComplete) {
        onUploadComplete();
      }
      
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = 'Error saving to database: ' + error.message;
      setSaveError(errorMessage);
      onNotification({ message: errorMessage, type: 'error', isVisible: true });
    } finally {
      setSaveLoading(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  const resetSave = () => {
    setIsSaved(false);
    setSaveError('');
    setSaveSuccess('');
  };

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">Import/Update Talent Data</h3>
      
      {/* Upload Section */}
      <div className="space-y-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleManageCreatorsUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          disabled={loading}
        />
        
        {/* Upload Progress */}
        {loading && uploadProgress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing file... {uploadProgress.current}%</span>
              <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {loading && <div className="flex justify-center mt-4"><LoadingSpinner size="md" /></div>}
        
        {/* Upload Success Message */}
        {uploadSuccess && (
          <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            {uploadSuccess}
          </div>
        )}
        
        {/* Upload Error Message */}
        {uploadError && (
          <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {uploadError}
          </div>
        )}
      </div>
      
      {/* Save to Database Section */}
      {processedData.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">💾 Save to Database</h4>
              <p className="text-sm text-blue-700">
                {processedData.length} valid creators ready to save to database.
              </p>
            </div>
            <div className="flex gap-2">
              {!isSaved ? (
                <Button 
                  onClick={saveToDatabase} 
                  variant="primary" 
                  loading={saveLoading}
                  disabled={processedData.length === 0}
                  size="sm"
                >
                  💾 Save to Database
                </Button>
              ) : (
                <Button onClick={resetSave} variant="secondary" size="sm">
                  🔄 Reset Save
                </Button>
              )}
            </div>
          </div>
          
          {/* Save Progress Bar */}
          {saveLoading && saveProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Saving creator {saveProgress.current} of {saveProgress.total}...</span>
                <span>{Math.round((saveProgress.current / saveProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Save Success Message */}
          {saveSuccess && (
            <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              {saveSuccess}
            </div>
          )}
          
          {/* Save Error Message */}
          {saveError && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              {saveError}
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-600 mt-2">Upload "Manage creators" Excel to update talent database</p>
      
      {/* Database Structure Info */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-800 mb-2">Database Structure:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Required:</strong> Username TikTok ("Creator's username")</div>
          <div><strong>Filter:</strong> Only processes rows where "Creator Network manager" = "mediaentertainmenttalentagency@gmail.com"</div>
          <div><strong>Auto-generated:</strong> ID (UUID), created_at, updated_at</div>
          <div><strong>Defaults:</strong> followers_count = 0, status = 'active'</div>
          <div><strong>Date format:</strong> dd/mm/yyyy (will be converted automatically)</div>
          <div><strong>Excel structure:</strong> Row 1 = metadata, Row 2 = headers, Row 3+ = data</div>
        </div>
      </div>
      
      {/* Sample Template Download */}
      <div className="mt-3">
        <button
          onClick={downloadSampleTemplate}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Download Sample Template
        </button>
        <span className="text-xs text-gray-500 ml-2">to see the expected format</span>
      </div>
      
      {/* Debug Panel */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Debug Information</h4>
            <button 
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showDebugPanel ? 'Hide' : 'Show'} Details
            </button>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Total rows: {debugInfo.totalRows} | Columns: {debugInfo.columns.length} | 
            Header row: {debugInfo.headerRow + 1} | Data starts: {debugInfo.dataStartRow + 1} |
            Timestamp: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
          {showDebugPanel && (
            <div className="space-y-2 text-xs">
              <div>
                <strong>Headers found:</strong>
                <div className="bg-white p-2 rounded mt-1 font-mono">
                  {debugInfo.columns.join(', ')}
                </div>
              </div>
              <div>
                <strong>Sample row:</strong>
                <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-xs">
                  {JSON.stringify(debugInfo.sampleRow, null, 2)}
                </pre>
              </div>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                <strong>Filter Applied:</strong> Only processing rows where "Creator Network manager" = "mediaentertainmenttalentagency@gmail.com"
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Validation Summary */}
      {validationSummary && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-red-800">Import Validation Summary</h4>
            <button 
              onClick={() => setValidationSummary(null)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
          <div className="text-sm text-red-700 mb-3">
            <div>Total rows processed: {validationSummary.totalRows}</div>
            <div>Successfully imported: {validationSummary.validCount}</div>
            <div>Failed validation: {validationSummary.invalidCount}</div>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-red-800">Error Details (showing first {validationSummary.errors.length}):</h5>
            {validationSummary.errors.map((error, idx) => (
              <div key={idx} className="bg-white p-2 rounded border border-red-200 text-xs">
                <div className="font-medium text-red-800">Row {error.rowNumber}:</div>
                <div className="text-red-600 mt-1">
                  {error.errors.map((err, errIdx) => (
                    <div key={errIdx}>• {err}</div>
                  ))}
                </div>
                {error.processedData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-600">Show processed data</summary>
                    <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(error.processedData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection; 