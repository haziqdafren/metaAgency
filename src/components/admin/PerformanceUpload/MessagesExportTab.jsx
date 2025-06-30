import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '../../common/Button';
import Textarea from '../../common/Textarea';
import CompactCard from '../CompactCard';
import { supabase, findOrCreateCreator } from '../../../lib/supabase';
import EnhancedPerformanceTable from './EnhancedPerformanceTable';

const MANAGER_EMAIL = 'mediaentertainmenttalentagency@gmail.com';

const MessagesExportTab = ({ uploadedData, messages, onMessagesGenerated, onSaveComplete }) => {
  const [personalizedMessages, setPersonalizedMessages] = useState([]);
  const [groupSummaryMessage, setGroupSummaryMessage] = useState('');
  const [editingPersonalizedMessages, setEditingPersonalizedMessages] = useState([]);
  const [editingGroupSummaryMessage, setEditingGroupSummaryMessage] = useState('');
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('wa_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showManagerWarning, setShowManagerWarning] = useState(false);
  
  // Historical data viewing
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [showHistoricalView, setShowHistoricalView] = useState(false);

  // Debug log at the top
  console.debug('MessagesExportTab render', { uploadedData });

  // Helper to add debug log - MEMOIZED
  const addDebugLog = useCallback((msg, type = 'info') => {
    setDebugLogs(logs => [...logs, { msg, type, ts: new Date().toLocaleTimeString() }]);
    console.debug('[MessagesExportTab]', msg);
  }, []);

  // Notification helper - MEMOIZED
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 2000);
  }, []);

  // Robust manager filter - MEMOIZED to prevent infinite loops
  const filteredData = useMemo(() => {
    return uploadedData.filter(row => {
      const manager = row.raw_data && row.raw_data['Creator Network manager'];
      return manager && manager.trim().toLowerCase() === MANAGER_EMAIL;
    });
  }, [uploadedData]);
  
  const dataToUse = useMemo(() => {
    return filteredData.length > 0 ? filteredData : uploadedData;
  }, [filteredData, uploadedData]);
  
  useEffect(() => {
    setShowManagerWarning(filteredData.length === 0 && uploadedData.length > 0);
  }, [filteredData.length, uploadedData.length]);
  
  // Historical data functions - MUST BE DEFINED BEFORE USE
  const loadAvailablePeriods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('creator_performance')
        .select('period_identifier, period_type, period_duration_days, period_start_date, period_end_date')
        .not('period_identifier', 'is', null)
        .order('period_start_date', { ascending: false });
      
      if (error) throw error;
      
      // Group by period_identifier and get stats
      const periodsMap = {};
      data.forEach(row => {
        if (!periodsMap[row.period_identifier]) {
          periodsMap[row.period_identifier] = {
            period_identifier: row.period_identifier,
            period_type: row.period_type,
            period_duration_days: row.period_duration_days,
            period_start_date: row.period_start_date,
            period_end_date: row.period_end_date,
            creator_count: 0
          };
        }
        periodsMap[row.period_identifier].creator_count++;
      });
      
      setAvailablePeriods(Object.values(periodsMap));
    } catch (error) {
      console.error('Error loading periods:', error);
      showNotification('Failed to load available periods', 'error');
    }
  }, [showNotification]);
  
  const loadHistoricalData = useCallback(async (periodId) => {
    setHistoricalLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_performance_periods')
        .select('*')
        .eq('period_identifier', periodId)
        .order('diamonds', { ascending: false });
      
      if (error) throw error;
      
      setHistoricalData(data || []);
      setSelectedPeriod(periodId);
      addDebugLog(`Loaded ${data?.length || 0} creators for period ${periodId}`);
    } catch (error) {
      console.error('Error loading historical data:', error);
      showNotification('Failed to load historical data', 'error');
    } finally {
      setHistoricalLoading(false);
    }
  }, [addDebugLog, showNotification]);
  
  // Load available periods on component mount
  useEffect(() => {
    loadAvailablePeriods();
  }, [loadAvailablePeriods]);

  // Normalization for table and messages - MEMOIZED to prevent recreating on every render
  const normalizeCreator = useCallback((creator) => ({
    username_tiktok: creator.username_tiktok,
    diamonds: creator.diamonds,
    validDays: creator.valid_days,
    liveDuration: creator.live_duration,
    liveStreams: creator.live_streams,
    graduationStatus: creator.graduation_status,
    diamondsVsLastMonth: creator.diamonds_vs_last_month,
    durationVsLastMonth: creator.duration_vs_last_month,
    newFollowers: creator.new_followers,
    followersVsLastMonth: creator.followers_vs_last_month,
    subscriptionRevenue: creator.subscription_revenue,
    period: creator.period,
    creator_id: creator.creator_id,
    group: creator.konten_kategori || creator.group,
    joined_time: creator.joined_date,
    days_since_joining: creator.days_since_joining,
    status: creator.status,
    link_tiktok: creator.link_tiktok,
    nomor_wa: creator.nomor_wa,
    manager: creator.raw_data && creator.raw_data['Creator Network manager']
  }), []);

  // Stats for UI - MEMOIZED to prevent recalculation
  const tableData = useMemo(() => {
    return dataToUse.map((row, originalIndex) => {
      const norm = normalizeCreator(row);
      let liveHours = 0;
      if (typeof norm.liveDuration === 'string') {
        const hourMatch = norm.liveDuration.match(/(\d+)h/);
        const minMatch = norm.liveDuration.match(/(\d+)m/);
        liveHours = (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) / 60 : 0);
      } else {
        liveHours = Number(norm.liveDuration) || 0;
      }
      return {
        originalIndex, // Keep track of original index
        username: norm.username_tiktok,
        validDays: Number(norm.validDays) || 0,
        liveHours,
        diamonds: Number(norm.diamonds) || 0,
        newFollowers: Number(norm.newFollowers) || 0, // Add new followers
        grade: norm.grade || '-',
        breakdown: norm.breakdown || '-',
        paymentStatus: norm.paymentStatus || '-',
      };
    });
  }, [dataToUse, normalizeCreator]);
  
  const stats = useMemo(() => ({
    totalMessages: tableData.length,
    totalCreators: tableData.length,
    topPerformers: Math.min(10, tableData.length),
    templatesCount: templates ? templates.length : 0,
    isSaved: isSaved
  }), [tableData.length, templates, isSaved]);

  // Generate messages and group summary on data change - FIXED DEPENDENCIES
  useEffect(() => {
    if (dataToUse.length > 0) {
      // Generate personalized messages (top 10)
      const sorted = [...dataToUse].map(normalizeCreator).sort((a, b) => b.diamonds - a.diamonds);
      const top10 = sorted.slice(0, 10);
      const personalizedMsgs = top10.map((creator, idx) => `🎉 *CONGRATULATIONS @${creator.username_tiktok}!*

🏆 *Rank #${idx + 1}* in this month's performance!

📊 *PERFORMANCE REPORT ${creator.period}*

👤 *Creator:* @${creator.username_tiktok}
🎓 *Status:* ${creator.graduationStatus || '-'}

💎 *Diamonds:* ${Number(creator.diamonds).toLocaleString('id-ID')}
🎯 *Target Achieved:* -

📅 *Valid Days:* ${creator.validDays || 0} hari
⏱️ *Live Duration:* ${creator.liveDuration || '-'}

👥 *New Followers:* ${Number(creator.newFollowers)?.toLocaleString('id-ID') || '0'}
🎬 *Total Streams:* ${creator.liveStreams || 0}
💰 *Subscription Revenue:* $${creator.subscriptionRevenue || 0}

_Keep up the amazing work!_`);
      setPersonalizedMessages(personalizedMsgs);
      setEditingPersonalizedMessages(personalizedMsgs);
      // Group summary
      const groupSummary = sorted.map((creator, idx) => `${idx + 1}. @${creator.username_tiktok} - ${creator.diamonds.toLocaleString('id-ID')} 💎 | ${creator.validDays}d | ${creator.liveDuration}`);
      const groupMsg = `📊 *MONTHLY PERFORMANCE REPORT - ALL CREATORS*\n\n*${dataToUse[0]?.period || 'Current Period'}*\n\n${groupSummary.join('\n')}\n\n🏆 *Top 10 will receive personalized messages*\n\n_Great work everyone! Keep pushing forward!_ 🚀`;
      setGroupSummaryMessage(groupMsg);
      setEditingGroupSummaryMessage(groupMsg);
    } else {
      // Clear messages when no data
      setPersonalizedMessages([]);
      setEditingPersonalizedMessages([]);
      setGroupSummaryMessage('');
      setEditingGroupSummaryMessage('');
    }
  }, [uploadedData]); // Only depend on the original uploaded data

  // Helper to parse period string into components - IMPROVED LOGIC
  const parsePeriodString = useCallback((periodStr) => {
    if (!periodStr) {
      const now = new Date();
      const startDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate,
        endDate: startDate,
        periodIdentifier: `${startDate}_${startDate}`,
        durationDays: 1,
        periodType: 'daily'
      };
    }
    
    // Parse period like "2025-06-01 ~ 2025-06-28" or "2025-06-01 ~ 2025-06-17"
    const dateRangeMatch = periodStr.match(/(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{4})-(\d{2})-(\d{2})/);
    if (dateRangeMatch) {
      const startDateObj = new Date(dateRangeMatch[1], dateRangeMatch[2] - 1, dateRangeMatch[3]);
      const endDateObj = new Date(dateRangeMatch[4], dateRangeMatch[5] - 1, dateRangeMatch[6]);
      
      const year = startDateObj.getFullYear();
      const month = startDateObj.getMonth() + 1;
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-${startDateObj.getDate().toString().padStart(2, '0')}`;
      const endDate = `${endDateObj.getFullYear()}-${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}-${endDateObj.getDate().toString().padStart(2, '0')}`;
      
      // Calculate duration in days
      const durationMs = endDateObj.getTime() - startDateObj.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      
      // Generate unique period identifier
      const periodIdentifier = `${startDate}_${endDate}`;
      
      // Determine period type based on duration
      let periodType = 'custom';
      if (durationDays <= 7) {
        periodType = 'weekly';
      } else if (durationDays <= 14) {
        periodType = 'bi-weekly';
      } else if (durationDays <= 31) {
        periodType = 'monthly';
      }
      
      return {
        year,
        month,
        startDate,
        endDate,
        periodIdentifier,
        durationDays,
        periodType
      };
    }
    
    // Fallback to current date
    const now = new Date();
    const startDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      startDate,
      endDate: startDate,
      periodIdentifier: `${startDate}_${startDate}`,
      durationDays: 1,
      periodType: 'daily'
    };
  }, []);

  // Save to database - MEMOIZED callback
  const saveToDatabase = useCallback(async () => {
    addDebugLog('Save button clicked');
    if (!dataToUse || dataToUse.length === 0) {
      showNotification('No eligible creators to save', 'error');
      return;
    }
    
    // Set upload active state to extend session timeout
    localStorage.setItem('adminUploadActive', 'true');
    localStorage.setItem('adminLastActivity', Date.now().toString());
    
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    setSaveProgress({ current: 0, total: dataToUse.length });
    setDebugLogs([]);
    let successfulSaves = 0;
    try {
      for (const [idx, creator] of dataToUse.entries()) {
        try {
          const normalizedCreator = normalizeCreator(creator);
          // Parse period string from raw_data['Data period']
          const periodStr = creator.raw_data && creator.raw_data['Data period'] ? String(creator.raw_data['Data period']).trim() : (creator.period || '');
          const periodData = parsePeriodString(periodStr);
          
          addDebugLog(`[SAVE] Processing #${idx + 1}: ${normalizedCreator.username_tiktok} (${normalizedCreator.creator_id}) | Period: ${periodStr} | Parsed: ${periodData.periodIdentifier} (${periodData.periodType}, ${periodData.durationDays} days)`);
          
          const { creator: dbCreator, error: creatorError } = await findOrCreateCreator({
            creator_id: normalizedCreator.creator_id,
            username_tiktok: normalizedCreator.username_tiktok,
            followers_count: normalizedCreator.newFollowers,
            konten_kategori: normalizedCreator.group || normalizedCreator.konten_kategori,
            game_preference: normalizedCreator.game_preference,
            joined_date: normalizedCreator.joined_time || normalizedCreator.joined_date,
            days_since_joining: normalizedCreator.days_since_joining,
            graduation_status: normalizedCreator.graduationStatus,
            status: normalizedCreator.status,
            link_tiktok: normalizedCreator.link_tiktok,
            nomor_wa: normalizedCreator.nomor_wa
          });
          
          addDebugLog(`[SAVE] findOrCreateCreator result: ${dbCreator ? dbCreator.id : 'null'} ${creatorError ? 'ERROR: ' + creatorError : ''}`);
          if (creatorError) {
            addDebugLog(`Error managing creator ${normalizedCreator.username_tiktok}: ${creatorError}`, 'error');
            continue;
          }
          if (!dbCreator || !dbCreator.id) {
            addDebugLog(`[SAVE] Failed to get/create creator or missing dbCreator.id for ${normalizedCreator.username_tiktok}`, 'error');
            continue;
          }
          
          let liveHours = 0;
          if (normalizedCreator.liveDuration) {
            const durationStr = String(normalizedCreator.liveDuration);
            const hoursMatch = durationStr.match(/(\d+)h/);
            const minutesMatch = durationStr.match(/(\d+)m/);
            if (hoursMatch) {
              liveHours = parseInt(hoursMatch[1]);
              if (minutesMatch) {
                liveHours += parseInt(minutesMatch[1]) / 60;
              }
            } else if (minutesMatch) {
              liveHours = parseInt(minutesMatch[1]) / 60;
            } else {
              const numMatch = durationStr.match(/(\d+(?:\.\d+)?)/);
              if (numMatch) {
                liveHours = parseFloat(numMatch[1]);
              }
            }
          }
          
          const perfData = {
            creator_id: dbCreator.id,
            period_year: periodData.year,
            period_month: periodData.month,
            period_identifier: periodData.periodIdentifier,
            period_type: periodData.periodType,
            period_duration_days: periodData.durationDays,
            period_start_date: periodData.startDate,
            period_end_date: periodData.endDate,
            diamonds: normalizedCreator.diamonds || 0,
            valid_days: normalizedCreator.validDays || 0,
            live_hours: liveHours,
            viewers_count: normalizedCreator.viewersCount || 0,
            new_followers: normalizedCreator.newFollowers || 0,
            diamonds_vs_last_month: parseFloat((normalizedCreator.diamondsVsLastMonth || '0').replace('%','').replace('+','')) || null,
            hours_vs_last_month: parseFloat((normalizedCreator.durationVsLastMonth || '0').replace('%','').replace('+','')) || null,
            raw_data: creator
          };
          
          addDebugLog(`[SAVE] Attempting to upsert performance for: ${dbCreator.id} ${normalizedCreator.username_tiktok} | Period: ${periodData.periodIdentifier} (${periodData.periodType}, ${periodData.durationDays} days)`);
          
          // Use upsert with the new period identifier conflict resolution
          const { error: perfError } = await supabase
            .from('creator_performance')
            .upsert(perfData, { 
              onConflict: 'creator_id,period_identifier',
              ignoreDuplicates: false 
            });
            
          if (perfError) {
            addDebugLog(`[SAVE] Performance save error: ${perfError.message}`, 'error');
            console.error('Full error details:', perfError);
          } else {
            addDebugLog(`[SAVE] Performance data upserted for: ${dbCreator.id} ${normalizedCreator.username_tiktok} | Period: ${periodData.periodIdentifier} (${periodData.periodType})`);
            successfulSaves++;
          }
        } catch (error) {
          addDebugLog(`[SAVE] Error processing ${creator.username_tiktok}: ${error.message}`, 'error');
          console.error('Processing error:', error);
        }
        setSaveProgress(prev => ({ ...prev, current: idx + 1 }));
      }
      setSaveSuccess(`🎉 Successfully saved ${successfulSaves} creators to database!`);
      setIsSaved(true);
      showNotification(`Successfully saved ${successfulSaves} creators to database!`, 'success');
      if (onSaveComplete) {
        onSaveComplete();
      }
      setTimeout(() => {
        setSaveSuccess('');
      }, 5000);
    } catch (error) {
      addDebugLog('Save error: ' + error.message, 'error');
      setSaveError('Error saving to database: ' + error.message);
      showNotification('Error saving to database: ' + error.message, 'error');
      console.error('Database save error:', error);
    } finally {
      // Clear upload active state when done
      localStorage.removeItem('adminUploadActive');
      setSaveLoading(false);
      setSaveProgress({ current: 0, total: 0 });
      // Refresh available periods after successful save
      loadAvailablePeriods();
    }
  }, [dataToUse, addDebugLog, showNotification, onSaveComplete, normalizeCreator, parsePeriodString, loadAvailablePeriods]);

  // Copy to clipboard - MEMOIZED callbacks
  const copyPersonalizedMessage = useCallback((index) => {
    addDebugLog(`Copy personalized message button clicked for index ${index}`);
    navigator.clipboard.writeText(editingPersonalizedMessages[index]);
    showNotification('Personalized message copied!');
  }, [editingPersonalizedMessages, addDebugLog, showNotification]);
  
  const copyAllPersonalizedMessages = useCallback(() => {
    addDebugLog('Copy all personalized messages button clicked');
    const allPersonalized = editingPersonalizedMessages.join('\n\n---\n\n');
    navigator.clipboard.writeText(allPersonalized);
    showNotification('All personalized messages copied!');
  }, [editingPersonalizedMessages, addDebugLog, showNotification]);
  
  const copyGroupSummaryMessage = useCallback(() => {
    addDebugLog('Copy group summary message button clicked');
    navigator.clipboard.writeText(editingGroupSummaryMessage);
    showNotification('Group summary message copied!');
  }, [editingGroupSummaryMessage, addDebugLog, showNotification]);

  // WhatsApp - MEMOIZED callbacks
  const sendPersonalizedViaWhatsApp = useCallback((index) => {
    addDebugLog(`Send personalized WhatsApp button clicked for index ${index}`);
    const msg = encodeURIComponent(editingPersonalizedMessages[index]);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }, [editingPersonalizedMessages, addDebugLog]);
  
  const sendGroupSummaryViaWhatsApp = useCallback(() => {
    addDebugLog('Send group summary WhatsApp button clicked');
    const msg = encodeURIComponent(editingGroupSummaryMessage);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }, [editingGroupSummaryMessage, addDebugLog]);

  // Export - MEMOIZED callback
  const exportMessages = useCallback(() => {
    addDebugLog('Export messages button clicked');
    const exportData = {
      personalizedMessages: editingPersonalizedMessages,
      groupSummary: editingGroupSummaryMessage,
      exportedAt: new Date().toISOString(),
      totalCreators: uploadedData.length
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messages-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Messages exported successfully!');
  }, [editingPersonalizedMessages, editingGroupSummaryMessage, uploadedData.length, addDebugLog, showNotification]);

  // Templates - MEMOIZED callbacks
  const saveTemplate = useCallback(() => {
    addDebugLog('Save template button clicked');
    const name = prompt('Template name?');
    if (!name) return;
    const newTemplates = [...templates, {
      name,
      personalizedMessages: [...editingPersonalizedMessages],
      groupSummary: editingGroupSummaryMessage,
      createdAt: new Date().toISOString()
    }];
    setTemplates(newTemplates);
    localStorage.setItem('wa_templates', JSON.stringify(newTemplates));
    showNotification('Template saved successfully!');
  }, [templates, editingPersonalizedMessages, editingGroupSummaryMessage, addDebugLog, showNotification]);
  
  const applyTemplate = useCallback((idx) => {
    addDebugLog(`Apply template button clicked for index ${idx}`);
    const template = templates[idx];
    if (template.personalizedMessages) {
      setEditingPersonalizedMessages([...template.personalizedMessages]);
    }
    if (template.groupSummary) {
      setEditingGroupSummaryMessage(template.groupSummary);
    }
    showNotification(`Template "${template.name}" applied!`);
  }, [templates, addDebugLog, showNotification]);
  
  const deleteTemplate = useCallback((idx) => {
    addDebugLog(`Delete template button clicked for index ${idx}`);
    if (!window.confirm('Delete this template?')) return;
    const newTemplates = templates.filter((_, i) => i !== idx);
    setTemplates(newTemplates);
    localStorage.setItem('wa_templates', JSON.stringify(newTemplates));
    showNotification('Template deleted!');
  }, [templates, addDebugLog, showNotification]);

  // Edit message - MEMOIZED callbacks
  const handleEditPersonalizedMessage = useCallback((index, newValue) => {
    addDebugLog(`Edit personalized message at index ${index}`);
    const updated = [...editingPersonalizedMessages];
    updated[index] = newValue;
    setEditingPersonalizedMessages(updated);
  }, [editingPersonalizedMessages, addDebugLog]);
  
  const handleEditGroupSummaryMessage = useCallback((newValue) => {
    addDebugLog('Edit group summary message');
    setEditingGroupSummaryMessage(newValue);
  }, [addDebugLog]);

  // Render the full original UI, always interactive
  return (
    <div className="space-y-6">
      {showManagerWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-4 text-yellow-800">
          <b>Warning:</b> No creators matched the manager filter ("{MANAGER_EMAIL}"). Showing all uploaded creators instead. Please check your Excel column names and values if you expect filtering.
        </div>
      )}
      
      {/* Current Period Info & Stats */}
      {dataToUse.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Current Upload Period</h3>
              <p className="text-blue-600">
                📅 <strong>{dataToUse[0]?.raw_data?.['Data period'] || dataToUse[0]?.period || 'Unknown Period'}</strong>
              </p>
              <p className="text-sm text-blue-500 mt-1">
                This data will be saved as: <code className="bg-blue-100 px-2 py-1 rounded text-xs">{parsePeriodString(dataToUse[0]?.raw_data?.['Data period'] || dataToUse[0]?.period || '')?.periodIdentifier || 'Unknown'}</code>
              </p>
            </div>
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              stats.isSaved 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            }`}>
              {stats.isSaved ? '✅ Saved to Database' : '⏳ Not Saved Yet'}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.totalCreators}</div>
          <div className="text-sm text-blue-600">Total Creators</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.topPerformers}</div>
          <div className="text-sm text-green-600">Top Performers</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{stats.totalMessages}</div>
          <div className="text-sm text-purple-600">Personal Messages</div>
        </div>
        <div className={`rounded-lg p-4 border ${stats.isSaved ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="text-2xl font-bold text-orange-700">{stats.templatesCount}</div>
          <div className="text-sm text-orange-600">Saved Templates</div>
        </div>
      </div>
      
      {/* Save to Database Section - Hide after successful save */}
      {!isSaved && (
        <CompactCard title="💾 Save to Database" subtitle="Save creator performance data to database for period tracking" compact>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="mb-3">
                <p className="text-sm text-blue-700 mb-2">⚠️ <strong>Period Tracking System:</strong></p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Each period range gets a unique identifier</li>
                  <li>• Different date ranges won't overwrite each other</li>
                  <li>• Supports weekly, bi-weekly, monthly, and custom periods</li>
                  <li>• Session timeout extended to 60 minutes during uploads</li>
                </ul>
              </div>
              <Button 
                onClick={saveToDatabase} 
                variant="primary" 
                size="lg" 
                loading={saveLoading}
                disabled={!dataToUse || dataToUse.length === 0}
                className="w-full"
              >
                {saveLoading ? `Saving... (${saveProgress.current}/${saveProgress.total})` : `Save ${dataToUse.length} Creators to Database`}
              </Button>
            </div>
          
          {saveLoading && (
            <div className="bg-white p-4 rounded border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-blue-700">
                  Processing creators... {saveProgress.current} of {saveProgress.total}
                </div>
                <div className="text-xs text-blue-500">
                  {Math.round((saveProgress.current / saveProgress.total) * 100)}%
                </div>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                🔒 Session extended automatically during upload process
              </div>
            </div>
          )}
          
          {saveError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <div className="flex items-start space-x-2">
                <div className="text-red-500 text-xl">⚠️</div>
                <div>
                  <div className="font-semibold text-red-800">Save Failed</div>
                  <div className="text-sm text-red-700 mt-1">{saveError}</div>
                  <div className="text-xs text-red-600 mt-2">
                    💡 <strong>Tip:</strong> Check debug logs below for detailed error information
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 p-4 rounded"
            >
              <div className="flex items-start space-x-2">
                <div className="text-green-500 text-xl">✅</div>
                <div>
                  <div className="font-semibold text-green-800">Save Successful!</div>
                  <div className="text-sm text-green-700 mt-1">{saveSuccess}</div>
                  <div className="text-xs text-green-600 mt-2">
                    🔄 Data is now available in the database and can be used for bonus calculations
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CompactCard>
      )}
      
      {/* Save Success State */}
      {isSaved && (
        <CompactCard title="✅ Database Save Complete" subtitle="Data successfully saved and ready for use" compact>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="text-green-500 text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-green-800">Successfully Saved!</h4>
                <p className="text-sm text-green-700 mt-1">
                  All {dataToUse.length} creators have been saved to the database.
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Period: {parsePeriodString(dataToUse[0]?.raw_data?.['Data period'] || dataToUse[0]?.period || '')?.periodIdentifier || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CompactCard>
      )}
      
      {/* Message Generation & Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personalized Messages */}
        <CompactCard title="🌟 Personalized Messages (Top 10)" subtitle="Individual congratulatory messages for top performers" compact>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={copyAllPersonalizedMessages} variant="primary" size="sm" disabled={personalizedMessages.length === 0}>
                Copy All Messages
              </Button>
              <Button onClick={exportMessages} variant="secondary" size="sm" disabled={personalizedMessages.length === 0}>
                Export as File
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {personalizedMessages.length > 0 ? personalizedMessages.map((_, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex gap-2 mb-2">
                    <Button onClick={() => copyPersonalizedMessage(index)} variant="ghost" size="sm">
                      Copy #{index + 1}
                    </Button>
                    <Button onClick={() => sendPersonalizedViaWhatsApp(index)} variant="secondary" size="sm">
                      WhatsApp
                    </Button>
                  </div>
                  <Textarea 
                    value={editingPersonalizedMessages[index] || ''} 
                    onChange={e => handleEditPersonalizedMessage(index, e.target.value)}
                    rows={4}
                    className="text-xs"
                  />
                </div>
              )) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  No messages generated yet. Upload data first.
                </div>
              )}
            </div>
          </div>
        </CompactCard>
        
        {/* Group Summary */}
        <CompactCard title="👥 Group Summary Message" subtitle="Overall performance summary for WhatsApp group" compact>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={copyGroupSummaryMessage} variant="primary" size="sm" disabled={!groupSummaryMessage}>
                Copy Summary
              </Button>
              <Button onClick={sendGroupSummaryViaWhatsApp} variant="secondary" size="sm" disabled={!groupSummaryMessage}>
                WhatsApp Group
              </Button>
            </div>
            
            <Textarea 
              value={editingGroupSummaryMessage} 
              onChange={e => handleEditGroupSummaryMessage(e.target.value)}
              rows={8}
              placeholder="Group summary will be generated after data upload..."
            />
          </div>
        </CompactCard>
      </div>
      
      {/* Templates Section */}
      <CompactCard title="📋 Message Templates" subtitle="Save and reuse message templates" compact collapsible defaultCollapsed>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={saveTemplate} variant="primary" size="sm" disabled={personalizedMessages.length === 0}>
              Save Current as Template
            </Button>
          </div>
          
          {templates.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Saved Templates:</h4>
              {templates.map((tpl, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm font-medium">{tpl.name}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => applyTemplate(idx)} variant="ghost" size="sm">
                      Apply
                    </Button>
                    <Button onClick={() => deleteTemplate(idx)} variant="ghost" size="sm" className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CompactCard>
      
      {/* Current Upload Data Table */}
      {dataToUse.length > 0 && (
        <CompactCard 
          title={`📊 Current Upload Data (${dataToUse.length} creators)`} 
          subtitle={`Period: ${dataToUse[0]?.raw_data?.['Data period'] || dataToUse[0]?.period || 'Unknown'}`}
          compact
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamonds</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Days</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Hours</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Followers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData
                  .sort((a, b) => b.diamonds - a.diamonds)
                  .map((creator, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">@{creator.username}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{creator.diamonds.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{creator.validDays}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{typeof creator.liveHours === 'number' ? creator.liveHours.toFixed(1) : creator.liveHours}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{creator.newFollowers.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CompactCard>
      )}
      
      {/* Historical Data Viewer */}
      <CompactCard title="📅 View Historical Performance Data" subtitle="Browse and filter data by different periods" compact collapsible>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                setShowHistoricalView(!showHistoricalView);
                if (!showHistoricalView) loadAvailablePeriods();
              }}
              variant={showHistoricalView ? "primary" : "secondary"}
              size="sm"
            >
              {showHistoricalView ? 'Hide Historical View' : 'Show Historical Data'}
            </Button>
            
            {showHistoricalView && (
              <div className="text-sm text-gray-600">
                Found {availablePeriods.length} period(s) in database
              </div>
            )}
          </div>
          
          {showHistoricalView && (
            <div className="space-y-4">
              {/* Period Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePeriods.map((period) => (
                  <button
                    key={period.period_identifier}
                    onClick={() => loadHistoricalData(period.period_identifier)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedPeriod === period.period_identifier
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {period.period_start_date && period.period_end_date 
                        ? `${period.period_start_date} ~ ${period.period_end_date}`
                        : period.period_identifier
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {period.period_type} • {period.creator_count} creators
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Historical Data Table */}
              {selectedPeriod && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">
                      Period: {selectedPeriod} ({historicalData.length} creators)
                    </h4>
                  </div>
                  
                  {historicalLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div className="mt-2 text-sm text-gray-600">Loading historical data...</div>
                    </div>
                  ) : historicalData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamonds</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Days</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Hours</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Followers</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {historicalData.map((creator, index) => (
                            <tr key={creator.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">@{creator.username_tiktok}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{(creator.diamonds || 0).toLocaleString('id-ID')}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{creator.valid_days || 0}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{Number(creator.live_hours || 0).toFixed(1)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{(creator.new_followers || 0).toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No data found for this period
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CompactCard>

      {/* Debug Logs (only show if there are logs) */}
      {debugLogs.length > 0 && (
        <CompactCard title="🔍 Debug Logs" compact collapsible defaultCollapsed>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {debugLogs.map((log, idx) => (
              <div key={idx} className={`text-xs p-2 rounded ${
                log.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
              }`}>
                <span className="font-mono">[{log.ts}]</span> {log.msg}
              </div>
            ))}
          </div>
        </CompactCard>
      )}
      
      {/* Notification */}
      {notification.isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg flex items-center ${
            notification.type === 'success' ? 'bg-green-50 text-green-700' :
            notification.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {notification.message}
        </motion.div>
      )}
    </div>
  );
};

export default MessagesExportTab;