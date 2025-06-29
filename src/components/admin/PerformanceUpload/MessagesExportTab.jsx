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

  useEffect(() => {
    if (uploadedData.length > 0) {
      generateAdvancedMessages(uploadedData);
    }
  }, [uploadedData]);

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
    // Sort data by diamonds in descending order
    const sortedData = [...data].sort((a, b) => b.diamonds - a.diamonds);
    
    // Generate personalized messages for top 10
    const top10Data = sortedData.slice(0, 10);
    const personalizedMsgs = top10Data.map(creator => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      const rank = sortedData.findIndex(c => c.username_tiktok === creator.username_tiktok) + 1;
      
      return {
        username: creator.username_tiktok,
        rank: rank,
        message: `🎉 *CONGRATULATIONS @${creator.username_tiktok}!*\n\n🏆 *Rank #${rank}* in this month's performance!\n\n📊 *PERFORMANCE REPORT ${creator.period}*\n\n👤 *Creator:* @${creator.username_tiktok}\n🎓 *Status:* ${creator.graduationStatus}\n\n💎 *Diamonds:* ${creator.diamonds.toLocaleString('id-ID')}\n${creator.diamondsVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.diamondsVsLastMonth}\n🎯 *Target Achieved:* ${creator.diamondsAchieved}\n\n📅 *Valid Days:* ${creator.validDays} hari\n⏱️ *Live Duration:* ${liveDurationParsed}\n${creator.durationVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.durationVsLastMonth}\n\n👥 *New Followers:* ${creator.newFollowers.toLocaleString('id-ID')}\n${creator.followersVsLastMonth.includes('-') ? '📉' : '📈'} *Growth:* ${creator.followersVsLastMonth}\n\n🎬 *Total Streams:* ${creator.liveStreams}\n💰 *Subscription Revenue:* $${creator.subscriptionRevenue}\n\n${getMotivationalMessage(creator)}\n\n_Keep up the amazing work!_ 🚀`
      };
    });
    
    // Generate group summary message for all creators
    const groupSummaryLines = sortedData.map((creator, index) => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      const rank = index + 1;
      const performanceSummary = `${creator.diamonds.toLocaleString('id-ID')} 💎 | ${creator.validDays}d | ${liveDurationParsed}`;
      return `${rank}. @${creator.username_tiktok} - ${performanceSummary}`;
    });
    
    const groupSummaryMsg = `📊 *MONTHLY PERFORMANCE REPORT - ALL CREATORS*\n\n*${data[0]?.period || 'Current Period'}*\n\n${groupSummaryLines.join('\n')}\n\n🏆 *Top 10 will receive personalized messages*\n\n_Great work everyone! Keep pushing forward!_ 🚀`;
    
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

    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    setSaveProgress({ current: 0, total: uploadedData.length });

    // Extract period, year, and month from uploaded data
    const period = uploadedData[0]?.period || '';
    const [year, month] = period.split('-').slice(0, 2);

    try {
      // Save upload context
      await supabase.from('creator_data_uploads').insert({
        period,
        year: parseInt(year),
        month: parseInt(month),
        uploaded_at: new Date().toISOString(),
        creators_count: uploadedData.length
      });

      // Process each creator using centralized management
      for (const [idx, creator] of uploadedData.entries()) {
        try {
          // Use centralized creator management
          const { creator: dbCreator, error: creatorError } = await findOrCreateCreator({
            creator_id: creator.creator_id,
            username_tiktok: creator.username_tiktok,
            followers_count: creator.followers_count,
            konten_kategori: creator.konten_kategori,
            game_preference: creator.game_preference,
            joined_date: creator.joined_date,
            days_since_joining: creator.days_since_joining,
            graduation_status: creator.graduationStatus,
            status: creator.status,
            link_tiktok: creator.link_tiktok,
            nomor_wa: creator.nomor_wa
          });
          
          if (creatorError) {
            console.error(`Error managing creator ${creator.username_tiktok}:`, creatorError);
            continue;
          }
          
          if (!dbCreator) {
            console.error(`Failed to get/create creator for ${creator.username_tiktok}`);
            continue;
          }
          
          // Insert performance data using the internal database ID (foreign key constraint requirement)
          const perfData = {
            creator_id: dbCreator.id, // Use internal database ID for foreign key relationship
            period_month: parseInt(month),
            period_year: parseInt(year),
            diamonds: creator.diamonds,
            valid_days: creator.validDays,
            live_hours: parseFloat(creator.liveDuration?.match(/(\d+)/)?.[1] || 0),
            new_followers: creator.newFollowers,
            diamonds_vs_last_month: parseFloat((creator.diamondsVsLastMonth || '').replace('%','')),
            raw_data: creator
          };
          
          const { error: perfError } = await supabase
            .from('creator_performance')
            .insert(perfData);
          
          if (perfError) {
            console.error(`Performance save error for ${creator.username_tiktok}:`, perfError);
          }
          
        } catch (error) {
          console.error(`Error processing ${creator.username_tiktok}:`, error);
        }
        
        setSaveProgress(prev => ({ ...prev, current: idx + 1 }));
      }
      
      setSaveSuccess(`🎉 Successfully saved ${uploadedData.length} creators to database!`);
      setIsSaved(true);
      showNotification(`Successfully saved ${uploadedData.length} creators to database!`, 'success');
      
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

  const stats = {
    totalMessages: personalizedMessages.length,
    totalCreators: uploadedData.length,
    topPerformers: personalizedMessages.length,
    templatesCount: templates.length,
    isSaved: isSaved
  };

  if (uploadedData.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500 mb-6">Upload performance data first to generate messages</p>
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
        data={uploadedData}
        loading={loading}
        onRefresh={() => {/* reload data logic here */}}
      />
    </div>
  );
};

export default MessagesExportTab;