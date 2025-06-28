import React, { useState } from 'react';
import { supabase, findOrCreateCreator } from '../../../lib/supabase';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';
import useAuthStore from '../../../store/authStore';
import * as Yup from 'yup';

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
  const [loading, setLoading] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);
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
    setLoading(true);
    let validCount = 0;
    let invalidRows = [];
    let processedRows = 0;
    
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Excel columns found:', Object.keys(jsonData[0] || {}));
      console.log('First row sample:', jsonData[0]);
      
      // Capture debug info
      setDebugInfo({
        totalRows: jsonData.length,
        columns: Object.keys(jsonData[0] || {}),
        sampleRow: jsonData[0],
        timestamp: new Date().toISOString()
      });
      
      // If the first row is metadata (e.g., starts with 'Exported at :'), skip it
      if (jsonData.length > 0 && Object.values(jsonData[0])[0]?.toString().toLowerCase().startsWith('exported at')) {
        jsonData.shift();
      }

      for (const [index, row] of jsonData.entries()) {
        processedRows++;
        try {
          // More flexible field mapping
          const creatorData = {
            creator_id: row['Creator ID:'] || row['Creator ID'] || row['creator_id'] || row['CreatorID'] || null,
            username_tiktok: row["Creator's username"] || row['Username'] || row['username_tiktok'] || row['Creator Username'] || null,
            followers_count: parseInt(row['Followers']) || parseInt(row['followers_count']) || parseInt(row['Followers Count']) || 0,
            konten_kategori: mapCategory(row['Group'] || row['Category'] || row['konten_kategori'] || ''),
            game_preference: extractGames(row['Notes'] || row['Game Preference'] || row['game_preference'] || ''),
            joined_date: parseDate(row['Joined time'] || row['Joined Date'] || row['joined_date']),
            days_since_joining: parseInt(row['Days since joining']) || parseInt(row['days_since_joining']) || 0,
            graduation_status: row['Graduation status'] || row['graduation_status'] || null,
            status: (row['Relationship status'] || row['Status'] || '').toLowerCase() === 'effective' ? 'active' : 'inactive',
            link_tiktok: row['TikTok Link'] || row['link_tiktok'] || null,
            nomor_wa: row['WhatsApp'] || row['nomor_wa'] || row['WhatsApp Number'] || null,
          };

          // Normalize empty strings to null for all optional fields
          Object.keys(creatorData).forEach(key => {
            if (typeof creatorData[key] === 'string' && creatorData[key].trim() === '') {
              creatorData[key] = null;
            }
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
              rowNumber: index + 2, // +2 because we may have skipped the first row
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
              rowNumber: index + 2, 
              row: row, 
              errors: yupError.errors,
              processedData: creatorData 
            });
            continue;
          }

          // Check if creator already exists and use centralized management
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
            invalidRows.push({ 
              rowNumber: index + 2, 
              row: row, 
              errors: [`Creator management failed: ${findError.message}`],
              processedData: creatorData 
            });
            continue;
          }
          
          if (existingCreator) {
            validCount++;
            console.log(`✅ Updated creator: ${creatorData.username_tiktok} (TikTok ID: ${creatorData.creator_id})`);
          } else {
            validCount++;
            console.log(`✅ Created new creator: ${creatorData.username_tiktok} (TikTok ID: ${creatorData.creator_id})`);
          }
        } catch (error) {
          invalidRows.push({ 
            rowNumber: index + 2, 
            row: row, 
            errors: [`Processing error: ${error.message}`],
            processedData: null 
          });
        }
      }

      // Set validation summary
      setValidationSummary({
        totalRows: processedRows,
        validCount,
        invalidCount: invalidRows.length,
        errors: invalidRows.slice(0, 5) // Show first 5 errors
      });

      onNotification({ 
        message: `Import completed: ${validCount} successful, ${invalidRows.length} failed.`, 
        type: invalidRows.length === 0 ? 'success' : 'warning', 
        isVisible: true 
      });

      // Trigger refresh of talents list
      onUploadComplete();
      
    } catch (error) {
      console.error('Error processing file:', error);
      onNotification({ message: 'Error processing file: ' + error.message, type: 'error', isVisible: true });
    } finally {
      setLoading(false);
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
        'WhatsApp': '+6281234567890'
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
        'WhatsApp': '+6281234567891'
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
        'WhatsApp': ''
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Template');
    XLSX.writeFile(wb, 'Talent_Import_Template.xlsx');
    onNotification({ message: 'Sample template downloaded!', type: 'success', isVisible: true });
  };

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">Import/Update Talent Data</h3>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleManageCreatorsUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        disabled={loading}
      />
      {loading && <div className="flex justify-center mt-4"><LoadingSpinner size="md" /></div>}
      <p className="text-xs text-gray-600 mt-2">Upload "Manage creators" Excel to update talent database</p>
      
      {/* Database Structure Info */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-800 mb-2">Database Structure:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Required:</strong> None (all fields are optional)</div>
          <div><strong>Auto-generated:</strong> ID (UUID), created_at, updated_at</div>
          <div><strong>Defaults:</strong> followers_count = 0, status = 'active'</div>
          <div><strong>Date format:</strong> dd/mm/yyyy (will be converted automatically)</div>
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
            Timestamp: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
          {showDebugPanel && (
            <div className="space-y-2 text-xs">
              <div>
                <strong>Columns found:</strong>
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