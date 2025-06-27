import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import useAuthStore from '../../store/authStore';

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

const TalentManagement = () => {
  const [talents, setTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    followersMin: 0,
    followersMax: 5000000,
    category: '',
    games: '',
    status: 'all',
    validDaysMin: 0
  });
  const [usernameChanges, setUsernameChanges] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredTalents.length / pageSize);
  const paginatedTalents = filteredTalents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const { profile } = useAuthStore();

  useEffect(() => {
    loadTalents();
    loadUsernameChanges();
    setCurrentPage(1);
  }, []);

  const loadTalents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select(`*,creator_performance (diamonds,valid_days,live_hours,period_month,period_year)`)
        .order('followers_count', { ascending: false });
      if (error) throw error;
      const processedData = data.map(talent => {
        const latestPerf = talent.creator_performance?.[0] || {};
        return {
          ...talent,
          latestDiamonds: latestPerf.diamonds || 0,
          latestValidDays: latestPerf.valid_days || 0,
          latestLiveHours: latestPerf.live_hours || 0
        };
      });
      setTalents(processedData);
      setFilteredTalents(processedData);
    } catch (error) {
      setNotification({ message: 'Error loading talents.', type: 'error', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  const loadUsernameChanges = async () => {
    try {
      const { data } = await supabase
        .from('username_history')
        .select(`*,creators (username_tiktok)`)
        .order('changed_at', { ascending: false })
        .limit(10);
      setUsernameChanges(data || []);
    } catch (error) {
      setNotification({ message: 'Error loading username changes.', type: 'error', isVisible: true });
    }
  };

  const handleManageCreatorsUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      setNotification({ message: 'Unauthorized: Only admins can import data.', type: 'error', isVisible: true });
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

          // Check for existing creator and handle username changes
          let existing = null;
          if (creatorData.creator_id) {
            const { data: existingData, error: selectError } = await supabase
              .from('creators')
              .select('id, username_tiktok')
              .eq('creator_id', creatorData.creator_id)
              .single();
              
            if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found"
              console.error('Supabase select error:', selectError, creatorData);
            } else if (existingData) {
              existing = existingData;
            }
          }
          
          // If no creator_id, try to find by username_tiktok
          if (!existing && creatorData.username_tiktok) {
            const { data: existingByUsername, error: selectByUsernameError } = await supabase
              .from('creators')
              .select('id, username_tiktok, creator_id')
              .eq('username_tiktok', creatorData.username_tiktok)
              .single();
              
            if (selectByUsernameError && selectByUsernameError.code !== 'PGRST116') {
              console.error('Supabase select by username error:', selectByUsernameError, creatorData);
            } else if (existingByUsername) {
              existing = existingByUsername;
            }
          }
          
          if (existing && existing.username_tiktok !== creatorData.username_tiktok) {
            const { error: historyError } = await supabase
              .from('username_history')
              .insert({
                creator_id: existing.id,
                old_username: existing.username_tiktok,
                new_username: creatorData.username_tiktok
              });
            if (historyError) {
              console.error('Supabase username_history insert error:', historyError, creatorData);
            }
          }

          // Upsert the creator data - use id for conflict resolution if we have an existing record
          let upsertError = null;
          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from('creators')
              .update(creatorData)
              .eq('id', existing.id);
            upsertError = error;
          } else {
            // Insert new record
            const { error } = await supabase
              .from('creators')
              .insert(creatorData);
            upsertError = error;
          }

          if (upsertError) {
            console.error('Supabase upsert error:', upsertError, creatorData);
            invalidRows.push({ 
              rowNumber: index + 2, 
              row: row, 
              errors: [upsertError.message],
              processedData: creatorData 
            });
          } else {
            validCount++;
          }
        } catch (rowError) {
          console.error(`Error processing row ${index + 2}:`, rowError, row);
          invalidRows.push({ 
            rowNumber: index + 2, 
            row: row, 
            errors: [rowError.message || 'Unknown error'],
            processedData: null 
          });
        }
      }

      // Log audit
      await supabase.from('talent_audit_log').insert({
        admin_id: profile.id,
        action: 'import',
        details: { 
          fileName: file.name, 
          totalRows: processedRows,
          importedCount: validCount, 
          invalidRows: invalidRows.length,
          invalidDetails: invalidRows.slice(0, 10) // Limit to first 10 for storage
        },
      });

      // Show detailed notification
      let notificationMessage = `Processed ${processedRows} rows. Imported ${validCount} creators.`;
      if (invalidRows.length > 0) {
        notificationMessage += ` ${invalidRows.length} rows failed validation.`;
        if (invalidRows.length <= 5) {
          notificationMessage += ` Check console for details.`;
        } else {
          notificationMessage += ` First 5 errors: ${invalidRows.slice(0, 5).map(r => `Row ${r.rowNumber}: ${r.errors.join(', ')}`).join('; ')}`;
        }
      }
      
      setNotification({ 
        message: notificationMessage, 
        type: invalidRows.length > 0 ? 'warning' : 'success', 
        isVisible: true 
      });
      
      // Log detailed errors to console for debugging
      if (invalidRows.length > 0) {
        console.group('Import Validation Errors');
        invalidRows.forEach((invalid, idx) => {
          console.group(`Row ${invalid.rowNumber} (${idx + 1}/${invalidRows.length})`);
          console.log('Original row data:', invalid.row);
          console.log('Processed data:', invalid.processedData);
          console.log('Errors:', invalid.errors);
          console.groupEnd();
        });
        console.groupEnd();
        
        // Set validation summary for UI display
        setValidationSummary({
          totalRows: processedRows,
          validCount,
          invalidCount: invalidRows.length,
          errors: invalidRows.slice(0, 10), // Show first 10 errors
          timestamp: new Date().toISOString()
        });
      } else {
        setValidationSummary(null);
      }
      
      loadTalents();
      loadUsernameChanges();
    } catch (error) {
      console.error('General file error:', error);
      setNotification({ message: 'Error processing file. Please check the format.', type: 'error', isVisible: true });
    } finally {
      setLoading(false);
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

  const extractGames = (notes) => {
    const games = [];
    const gameKeywords = ['PUBG', 'Mobile Legends', 'Free Fire', 'COD', 'Valorant'];
    gameKeywords.forEach(game => {
      if (notes.toLowerCase().includes(game.toLowerCase())) {
        games.push(game);
      }
    });
    return games.join(', ');
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      // Handle various date formats
      let cleaned = dateStr.toString().trim();
      
      // Remove common Excel artifacts
      cleaned = cleaned.replace(/[()]/g, '').split(' ')[0];
      
      // Handle different date separators
      if (cleaned.includes('/')) {
        const parts = cleaned.split('/');
        if (parts.length === 3) {
          // Assume MM/DD/YYYY or DD/MM/YYYY format
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
          cleaned = `${year}-${month}-${day}`;
        }
      } else if (cleaned.includes('-')) {
        // Already in YYYY-MM-DD format or similar
        cleaned = cleaned.replace(/:/g, '-');
      } else if (cleaned.includes('.')) {
        // Handle DD.MM.YYYY format
        const parts = cleaned.split('.');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
          cleaned = `${year}-${month}-${day}`;
        }
      }
      
      // Validate the date
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateStr, '->', cleaned);
        return null;
      }
      
      return cleaned;
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
      return null;
    }
  };

  const handleSearch = () => {
    let filtered = talents;
    if (searchTerm) {
      filtered = filtered.filter(talent =>
        talent.username_tiktok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.creator_id?.includes(searchTerm)
      );
    }
    filtered = filtered.filter(talent =>
      talent.followers_count >= filters.followersMin &&
      talent.followers_count <= filters.followersMax
    );
    if (filters.category) {
      filtered = filtered.filter(talent =>
        talent.konten_kategori === filters.category
      );
    }
    if (filters.games) {
      filtered = filtered.filter(talent =>
        talent.game_preference?.toLowerCase().includes(filters.games.toLowerCase())
      );
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(talent =>
        talent.status === filters.status
      );
    }
    if (filters.validDaysMin > 0) {
      filtered = filtered.filter(talent =>
        (talent.latestValidDays || 0) >= filters.validDaysMin
      );
    }
    setFilteredTalents(filtered);
  };

  const saveSearch = () => {
    if (!searchName) {
      setNotification({ message: 'Please enter a name for this search', type: 'error', isVisible: true });
      return;
    }
    const searchCriteria = {
      searchTerm,
      filters,
      timestamp: new Date().toISOString()
    };
    const newSearch = {
      id: Date.now(),
      name: searchName,
      criteria: searchCriteria
    };
    setSavedSearches([...savedSearches, newSearch]);
    setSearchName('');
    setNotification({ message: 'Search saved!', type: 'success', isVisible: true });
  };

  const loadSavedSearch = (search) => {
    setSearchTerm(search.criteria.searchTerm || '');
    setFilters(search.criteria.filters);
    setTimeout(handleSearch, 100);
  };

  const exportResults = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredTalents.map(talent => ({
      'Creator ID': talent.creator_id,
      'Username': talent.username_tiktok,
      'Followers': talent.followers_count,
      'Category': talent.konten_kategori,
      'Games': talent.game_preference,
      'Status': talent.status,
      'Days Since Joining': talent.days_since_joining,
      'Latest Diamonds': talent.latestDiamonds,
      'Latest Valid Days': talent.latestValidDays,
      'WhatsApp': talent.nomor_wa || '',
      'TikTok Link': talent.link_tiktok || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Talents');
    XLSX.writeFile(wb, `Talent_Search_Results_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const generateEndorsementList = () => {
    const endorsementText = filteredTalents
      .slice(0, 10)
      .map((talent, idx) => 
        `${idx + 1}. @${talent.username_tiktok}\n   - Followers: ${talent.followers_count.toLocaleString('id-ID')}\n   - Category: ${talent.konten_kategori}\n   - Games: ${talent.game_preference || 'N/A'}\n   - Recent Performance: ${talent.latestDiamonds.toLocaleString('id-ID')} diamonds\n   - Contact: ${talent.nomor_wa || 'N/A'}`
      ).join('\n\n');
    const fullText = `🎯 TALENT RECOMMENDATIONS FOR ENDORSEMENT\n\nBased on your criteria, here are the top matching creators:\n\n${endorsementText}\n\nTotal matching creators: ${filteredTalents.length}\n\nGenerated by Meta Agency Talent Search`;
    navigator.clipboard.writeText(fullText);
    setNotification({ message: 'Endorsement list copied to clipboard!', type: 'success', isVisible: true });
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
    setNotification({ message: 'Sample template downloaded!', type: 'success', isVisible: true });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <motion.div className="rounded-xl shadow-md p-8 mb-8 bg-white border border-gray-200" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-6">Talent Management & Search</h2>
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
        </div>
        
        {/* Validation Summary */}
        {validationSummary && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
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
        
        {usernameChanges.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Recent Username Changes</span>
            </div>
            <div className="space-y-1 text-sm">
              {usernameChanges.slice(0, 3).map((change, idx) => (
                <div key={idx} className="text-gray-700">
                  {change.old_username} → {change.new_username}
                  <span className="text-gray-500 ml-2">({new Date(change.changed_at).toLocaleDateString('id-ID')})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-semibold">{filteredTalents.length}</span> talents found
            {searchTerm && <span className="text-gray-600 ml-2">for "{searchTerm}"</span>}
          </div>
          <div className="flex gap-2">
            <Button onClick={exportResults} variant="primary" disabled={filteredTalents.length === 0}>Export Results</Button>
            <Button onClick={generateEndorsementList} variant="secondary" disabled={filteredTalents.length === 0}>Generate Endorsement List</Button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="p-2 border rounded-lg bg-gray-50 text-meta-black">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="p-2 border rounded-lg bg-gray-50 text-meta-black">
              <option value="">All</option>
              <option value="gaming">Gaming</option>
              <option value="entertainment">Entertainment</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="education">Education</option>
              <option value="music">Music</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Followers Min</label>
            <label className="block text-xs font-medium text-gray-500 mb-1">Followers Max</label>
            <input type="number" value={filters.followersMin} onChange={e => setFilters(f => ({ ...f, followersMin: parseInt(e.target.value) || 0 }))} className="p-2 border rounded-lg bg-gray-50 text-meta-black" />
            <input type="number" value={filters.followersMax} onChange={e => setFilters(f => ({ ...f, followersMax: parseInt(e.target.value) || 5000000 }))} className="p-2 border rounded-lg bg-gray-50 text-meta-black" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Followers</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Games</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recent Performance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTalents.map((talent) => (
                <tr key={talent.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedTalent(talent)}>
                  <td className="px-4 py-2 text-sm font-medium">
                    <a 
                      href={talent.link_tiktok || `https://www.tiktok.com/@${talent.username_tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      @{talent.username_tiktok}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-sm">{talent.followers_count?.toLocaleString('id-ID') || 0}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{talent.konten_kategori || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">{talent.game_preference || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${talent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{talent.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {talent.latestDiamonds > 0 && (
                      <div className="text-xs">💎 {talent.latestDiamonds.toLocaleString('id-ID')}<br />📅 {talent.latestValidDays}d | ⏱️ {talent.latestLiveHours}h</div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {talent.nomor_wa && (
                      <a 
                        href={`https://wa.me/${talent.nomor_wa.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Prev</button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
        {selectedTalent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
              <h4 className="font-bold mb-2">Talent Profile: @{selectedTalent.username_tiktok}</h4>
              <div className="mb-2 text-xs text-gray-500">Creator ID: {selectedTalent.creator_id}</div>
              <div className="mb-4 text-xs text-gray-500">Joined: {selectedTalent.joined_date || '-'}</div>
              <div className="mb-4">
                <h5 className="font-semibold mb-1">Profile</h5>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedTalent, null, 2)}</pre>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setSelectedTalent(null)} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TalentManagement; 