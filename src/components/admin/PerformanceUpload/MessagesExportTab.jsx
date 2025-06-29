import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Copy, Send, Download, Star, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../common/Button';
import Textarea from '../../common/Textarea';
import CompactCard from '../CompactCard';
import { supabase, findOrCreateCreator } from '../../../lib/supabase';
import EnhancedPerformanceTable from './EnhancedPerformanceTable';

const MessagesExportTab = ({ uploadedData, messages, onMessagesGenerated, onSaveComplete }) => {
  const [personalizedMessages, setPersonalizedMessages] = useState([]);
  const [groupSummaryMessage, setGroupSummaryMessage] = useState('');
  const [editingPersonalizedMessages, setEditingPersonalizedMessages] = useState([]);
  const [editingGroupSummaryMessage, setEditingGroupSummaryMessage] = useState('');
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('wa_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [loading, setLoading] = useState(false);
  
  // Save to database states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Utility to get value by possible keys (case-insensitive, trimmed)
  const getValueByKeys = (obj, possibleKeys) => {
    const keys = Object.keys(obj);
    for (let key of keys) {
      for (let possibleKey of possibleKeys) {
        if (key.trim().toLowerCase() === possibleKey.trim().toLowerCase()) {
          return obj[key];
        }
      }
    }
    return undefined;
  };

  // Ultra-robust normalization: always fall back to raw_data for key fields
  const normalizeCreator = (creator) => ({
    username_tiktok: creator.username_tiktok,
    diamonds: creator.diamonds,
    validDays: (creator.valid_days && creator.valid_days !== 0)
      ? creator.valid_days
      : (creator.raw_data && (creator.raw_data['Valid go LIVE days'] || creator.raw_data['Valid go LIVE days'.trim()])),
    liveDuration: (creator.live_duration && creator.live_duration !== '0h 0m')
      ? creator.live_duration
      : (creator.raw_data && (creator.raw_data['LIVE duration'] || creator.raw_data['LIVE duration'.trim()])),
    liveStreams: (creator.live_streams && creator.live_streams !== 0)
      ? creator.live_streams
      : (creator.raw_data && (creator.raw_data['LIVE streams'] || creator.raw_data['LIVE streams'.trim()])),
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
  });

  // Filter uploadedData to only include creators managed by mediaentertainmenttalentagency@gmail.com
  const filteredData = uploadedData.filter(row => {
    const manager = row.raw_data && row.raw_data['Creator Network manager'];
    return manager && manager.trim().toLowerCase() === 'mediaentertainmenttalentagency@gmail.com';
  });

  // Map normalized data to table fields (only for filteredData)
  const tableData = filteredData.map(row => {
    const norm = normalizeCreator(row);
    // Parse liveDuration to hours (number)
    let liveHours = 0;
    if (typeof norm.liveDuration === 'string') {
      const hourMatch = norm.liveDuration.match(/(\d+)h/);
      const minMatch = norm.liveDuration.match(/(\d+)m/);
      liveHours = (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) / 60 : 0);
    } else {
      liveHours = Number(norm.liveDuration) || 0;
    }
    return {
      username: norm.username_tiktok,
      validDays: Number(norm.validDays) || 0,
      liveHours,
      diamonds: Number(norm.diamonds) || 0,
      grade: norm.grade || '-',
      breakdown: norm.breakdown || '-',
      paymentStatus: norm.paymentStatus || '-',
      // Add any other fields you want to show
    };
  });

  // Use filteredData for all stats and message generation
  const stats = {
    totalMessages: tableData.length,
    totalCreators: tableData.length,
    topPerformers: Math.min(10, tableData.length),
    templatesCount: templates.length,
    isSaved: isSaved
  };

  useEffect(() => {
    if (filteredData.length > 0) {
      generateAdvancedMessages(filteredData);
    }
  }, [filteredData]);

  const parseLiveDuration = (duration) => {
    if (!duration) return '0 jam';
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return `${hours + Math.round(minutes / 60 * 10) / 10} jam`;
    }
    return duration;
  };

  const getMotivationalMessage = (creator) => {
    const diamondGrowth = parseFloat(creator.diamondsVsLastMonth);
    const validDays = creator.validDays;
    
    if (diamondGrowth > 50) {
      return "🏆 *OUTSTANDING PERFORMANCE!* Pertumbuhan luar biasa!";
    } else if (diamondGrowth > 0) {
      return "✨ *GOOD JOB!* Terus tingkatkan performa!";
    } else if (validDays >= 25) {
      return "💪 *KONSISTEN!* Dedikasi yang luar biasa!";
    } else {
      return "📈 *SEMANGAT!* Target bulan depan pasti tercapai!";
    }
  };

  const generateAdvancedMessages = (data) => {
    // Log the first row for debugging field names
    if (data && data.length > 0) {
      console.log('All keys in first row:', Object.keys(data[0]));
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        const norm = normalizeCreator(row);
        console.log(`Row ${i}:`);
        console.log('  Raw Valid go LIVE days:', row['Valid go LIVE days']);
        console.log('  Raw LIVE duration:', row['LIVE duration']);
        console.log('  Raw Creator Network manager:', row['Creator Network manager']);
        console.log('  Normalized validDays:', norm.validDays);
        console.log('  Normalized liveDuration:', norm.liveDuration);
        console.log('  Normalized manager:', norm.manager);
      }
      console.log('All unique Creator Network manager values:', [...new Set(data.map(item => normalizeCreator(item).manager))]);
    }
    
    // Filter data to only include creators managed by mediaentertainmenttalentagency@gmail.com
    const filteredData = data.filter(creator => {
      const managerValue = normalizeCreator(creator).manager;
      console.log(`Checking creator ${normalizeCreator(creator).username_tiktok}: manager = "${managerValue}"`);
      return managerValue && managerValue.toLowerCase().includes('mediaentertainmenttalentagency@gmail.com');
    });
    
    console.log(`Filtered ${filteredData.length} creators out of ${data.length} total`);
    
    // If no creators found, use all data as fallback
    const dataToUse = filteredData.length > 0 ? filteredData : data;
    console.log(`Using ${dataToUse.length} creators for processing`);
    
    // Sort data by diamonds in descending order
    const sortedData = [...dataToUse].map(normalizeCreator).sort((a, b) => b.diamonds - a.diamonds);
    
    // Generate personalized messages for top 10
    const top10Data = sortedData.slice(0, 10);
    const personalizedMsgs = top10Data.map((creator, idx) => {
      // Parse liveDuration to hours (number)
      let liveHours = 0;
      if (typeof creator.liveDuration === 'string') {
        const hourMatch = creator.liveDuration.match(/(\d+)h/);
        const minMatch = creator.liveDuration.match(/(\d+)m/);
        liveHours = (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) / 60 : 0);
      } else {
        liveHours = Number(creator.liveDuration) || 0;
      }
      return {
        username: creator.username_tiktok,
        rank: idx + 1,
        message: `🎉 *CONGRATULATIONS @${creator.username_tiktok}!*

🏆 *Rank #${idx + 1}* in this month's performance!

📊 *PERFORMANCE REPORT ${creator.period}*

👤 *Creator:* @${creator.username_tiktok}
🎓 *Status:* ${creator.graduationStatus || '-'}

💎 *Diamonds:* ${Number(creator.diamonds).toLocaleString('id-ID')}
${typeof creator.diamondsVsLastMonth === 'string' && creator.diamondsVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.diamondsVsLastMonth || '-'}
🎯 *Target Achieved:* ${creator.diamondsAchieved || '-'}

📅 *Valid Days:* ${creator.validDays || 0} hari
⏱️ *Live Duration:* ${liveHours} jam
${typeof creator.durationVsLastMonth === 'string' && creator.durationVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.durationVsLastMonth || '-'}

👥 *New Followers:* ${Number(creator.newFollowers)?.toLocaleString('id-ID') || '0'}
${typeof creator.followersVsLastMonth === 'string' && creator.followersVsLastMonth.includes('-') ? '📉' : '📈'} *Growth:* ${creator.followersVsLastMonth || '-'}

🎬 *Total Streams:* ${creator.liveStreams || 0}
💰 *Subscription Revenue:* $${creator.subscriptionRevenue || 0}

${getMotivationalMessage(creator)}

_Keep up the amazing work!_`
      };
    });
    
    // Generate group summary message for all creators
    const groupSummaryLines = sortedData.map((creator, index) => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      const rank = index + 1;
      const performanceSummary = `${creator.diamonds.toLocaleString('id-ID')} 💎 | ${creator.validDays}d | ${liveDurationParsed}`;
      return `${rank}. @${creator.username_tiktok} - ${performanceSummary}`;
    });
    
    const groupSummaryMsg = `📊 *MONTHLY PERFORMANCE REPORT - ALL CREATORS*\n\n*${dataToUse[0]?.period || 'Current Period'}*\n\n${groupSummaryLines.join('\n')}\n\n🏆 *Top 10 will receive personalized messages*\n\n_Great work everyone! Keep pushing forward!_ 🚀`;
    
    setPersonalizedMessages(personalizedMsgs);
    setGroupSummaryMessage(groupSummaryMsg);
    setEditingPersonalizedMessages(personalizedMsgs.map(m => m.message));
    setEditingGroupSummaryMessage(groupSummaryMsg);
    
    if (onMessagesGenerated) {
      onMessagesGenerated();
    }
  };

  const saveToDatabase = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      setSaveError('No data to save');
      return;
    }
    for (let i = 0; i < Math.min(5, uploadedData.length); i++) {
      const row = uploadedData[i];
      const norm = normalizeCreator(row);
      console.log(`[SAVE] Row ${i}:`);
      console.log('  Raw Valid go LIVE days:', row['Valid go LIVE days']);
      console.log('  Raw LIVE duration:', row['LIVE duration']);
      console.log('  Raw Creator Network manager:', row['Creator Network manager']);
      console.log('  Normalized validDays:', norm.validDays);
      console.log('  Normalized liveDuration:', norm.liveDuration);
      console.log('  Normalized manager:', norm.manager);
    }

    const filteredData = uploadedData.filter(creator => {
      const managerValue = normalizeCreator(creator).manager;
      return managerValue && managerValue.toLowerCase().includes('mediaentertainmenttalentagency@gmail.com');
    });
    const dataToUse = filteredData.length > 0 ? filteredData : uploadedData;
    console.log(`Saving ${dataToUse.length} creators (filtered: ${filteredData.length}, total: ${uploadedData.length})`);

    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    setSaveProgress({ current: 0, total: dataToUse.length });

    // Extract period, year, and month from uploaded data
    const period = normalizeCreator(dataToUse[0]).period || '';
    const [year, month] = period.split('-').slice(0, 2);

    try {
      // Save upload context
      await supabase.from('creator_data_uploads').insert({
        period,
        year: parseInt(year),
        month: parseInt(month),
        uploaded_at: new Date().toISOString(),
        creators_count: dataToUse.length
      });

      // Process each creator using centralized management
      for (const [idx, creator] of dataToUse.entries()) {
        try {
          const normalizedCreator = normalizeCreator(creator);
          
          // Use centralized creator management
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
          
          if (creatorError) {
            console.error(`Error managing creator ${normalizedCreator.username_tiktok}:`, creatorError);
            continue;
          }
          
          if (!dbCreator) {
            console.error(`Failed to get/create creator for ${normalizedCreator.username_tiktok}`);
            continue;
          }
          
          // Parse live duration to extract hours
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
              // Try to parse as number
              const numMatch = durationStr.match(/(\d+(?:\.\d+)?)/);
              if (numMatch) {
                liveHours = parseFloat(numMatch[1]);
              }
            }
          }
          
          // Insert performance data using the internal database ID (foreign key constraint requirement)
          const perfData = {
            creator_id: dbCreator.id, // Use internal database ID for foreign key relationship
            period_month: parseInt(month),
            period_year: parseInt(year),
            diamonds: normalizedCreator.diamonds,
            valid_days: normalizedCreator.validDays,
            live_hours: liveHours,
            new_followers: normalizedCreator.newFollowers,
            diamonds_vs_last_month: parseFloat((normalizedCreator.diamondsVsLastMonth || '').replace('%','').replace('+','')),
            live_streams: normalizedCreator.liveStreams,
            subscription_revenue: normalizedCreator.subscriptionRevenue,
            raw_data: creator
          };
          
          const { error: perfError } = await supabase
            .from('creator_performance')
            .insert(perfData);
          
          if (perfError) {
            console.error(`Performance save error for ${normalizedCreator.username_tiktok}:`, perfError);
          }
          
        } catch (error) {
          console.error(`Error processing ${creator['Creator\'s username'] || creator.username_tiktok}:`, error);
        }
        
        setSaveProgress(prev => ({ ...prev, current: idx + 1 }));
      }
      
      setSaveSuccess(`🎉 Successfully saved ${dataToUse.length} creators to database!`);
      setIsSaved(true);
      showNotification(`Successfully saved ${dataToUse.length} creators to database!`, 'success');
      
      if (onSaveComplete) {
        onSaveComplete();
      }
      
      // Clear success message after delay
      setTimeout(() => {
        setSaveSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('Error saving to database: ' + error.message);
      showNotification('Error saving to database: ' + error.message, 'error');
    } finally {
      setSaveLoading(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const copyPersonalizedMessage = (index) => {
    navigator.clipboard.writeText(editingPersonalizedMessages[index]);
    showNotification('Personalized message copied!');
  };

  const copyAllPersonalizedMessages = () => {
    const allPersonalized = editingPersonalizedMessages.join('\n\n---\n\n');
    navigator.clipboard.writeText(allPersonalized);
    showNotification('All personalized messages copied!');
  };

  const copyGroupSummaryMessage = () => {
    navigator.clipboard.writeText(editingGroupSummaryMessage);
    showNotification('Group summary message copied!');
  };

  const sendPersonalizedViaWhatsApp = (index) => {
    const msg = encodeURIComponent(editingPersonalizedMessages[index]);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const sendGroupSummaryViaWhatsApp = () => {
    const msg = encodeURIComponent(editingGroupSummaryMessage);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleEditPersonalizedMessage = (index, newValue) => {
    const updated = [...editingPersonalizedMessages];
    updated[index] = newValue;
    setEditingPersonalizedMessages(updated);
  };

  const handleEditGroupSummaryMessage = (newValue) => {
    setEditingGroupSummaryMessage(newValue);
  };

  const saveTemplate = () => {
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
  };

  const applyTemplate = (idx) => {
    const template = templates[idx];
    if (template.personalizedMessages) {
      setEditingPersonalizedMessages([...template.personalizedMessages]);
    }
    if (template.groupSummary) {
      setEditingGroupSummaryMessage(template.groupSummary);
    }
    setSelectedTemplate(idx);
    showNotification(`Template "${template.name}" applied!`);
  };

  const deleteTemplate = (idx) => {
    if (!window.confirm('Delete this template?')) return;
    
    const newTemplates = templates.filter((_, i) => i !== idx);
    setTemplates(newTemplates);
    localStorage.setItem('wa_templates', JSON.stringify(newTemplates));
    showNotification('Template deleted!');
  };

  const exportMessages = () => {
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
  };

  // Debug: Print first 3 rows of uploadedData directly after upload
  if (uploadedData && uploadedData.length > 0) {
    console.log('First 3 rows of uploadedData (raw):', uploadedData.slice(0, 3));
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Creators</h3>
        <p className="text-gray-500 mb-6">No creators matched the manager filter. Please check your upload.</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Go to Upload Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {notification.message}
        </motion.div>
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
        <div className={`rounded-lg p-4 border ${
          stats.isSaved 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="text-2xl font-bold text-orange-700">{stats.templatesCount}</div>
          <div className="text-sm text-orange-600">Saved Templates</div>
        </div>
      </div>

      {/* Save to Database Section */}
      <CompactCard 
        title="💾 Save to Database" 
        subtitle="Save creator performance data to database"
        compact
      >
        <div className="space-y-4">
          {!isSaved ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Ready to Save?</h4>
                  <p className="text-sm text-blue-700">
                    Save {uploadedData.length} creators to database for permanent storage and future access.
                  </p>
                </div>
                <Button 
                  onClick={saveToDatabase} 
                  variant="primary" 
                  loading={saveLoading}
                  disabled={uploadedData.length === 0}
                  size="lg"
                  className="whitespace-nowrap"
                >
                  💾 Save to Database
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">✅ Saved Successfully!</h4>
                  <p className="text-sm text-green-700">
                    {uploadedData.length} creators have been saved to the database.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {saveLoading && saveProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Saving creator {saveProgress.current} of {saveProgress.total}...</span>
                <span>{Math.round((saveProgress.current / saveProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {saveError && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              {saveError}
            </div>
          )}
          
          {/* Success Message */}
          {saveSuccess && (
            <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              {saveSuccess}
            </div>
          )}
        </div>
      </CompactCard>

      {/* Templates Section */}
      <CompactCard title="Message Templates" compact>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={saveTemplate} variant="primary" size="sm">
              Save Current as Template
            </Button>
            <Button onClick={exportMessages} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export Messages
            </Button>
          </div>
          
          {templates.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Available Templates:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl, idx) => (
                  <div key={idx} className="inline-flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    <button 
                      className="font-medium text-blue-600 hover:underline mr-2" 
                      onClick={() => applyTemplate(idx)}
                    >
                      {tpl.name}
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-600" 
                      onClick={() => deleteTemplate(idx)}
                      title="Delete template"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CompactCard>

      {/* Personalized Messages */}
      <CompactCard 
        title="🌟 Personalized Messages (Top 10)" 
        compact
        actions={
          <div className="flex gap-2">
            <Button onClick={copyAllPersonalizedMessages} variant="primary" size="sm">
              <Copy className="w-4 h-4 mr-1" />
              Copy All
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {personalizedMessages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-800">
                    #{msg.rank} @{msg.username}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyPersonalizedMessage(index)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => sendPersonalizedViaWhatsApp(index)} 
                    variant="secondary" 
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                className="w-full text-sm font-mono"
                value={editingPersonalizedMessages[index]}
                onChange={e => handleEditPersonalizedMessage(index, e.target.value)}
                rows={12}
              />
            </motion.div>
          ))}
        </div>
      </CompactCard>

      {/* Group Summary Message */}
      <CompactCard 
        title="👥 Group Summary Message" 
        subtitle="Send this to the main group chat"
        compact
        actions={
          <div className="flex gap-2">
            <Button onClick={copyGroupSummaryMessage} variant="primary" size="sm">
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button onClick={sendGroupSummaryViaWhatsApp} variant="secondary" size="sm">
              <Send className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        }
      >
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Textarea
            className="w-full text-sm font-mono"
            value={editingGroupSummaryMessage}
            onChange={e => handleEditGroupSummaryMessage(e.target.value)}
            rows={15}
          />
        </div>
      </CompactCard>

      {/* Enhanced Performance Table */}
      <EnhancedPerformanceTable
        data={tableData}
        loading={loading}
        onRefresh={() => {/* reload data logic here */}}
      />
    </div>
  );
};

export default MessagesExportTab;