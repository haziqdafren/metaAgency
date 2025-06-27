import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { supabase } from '../../lib/supabase';


// Helper functions for mapping
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

const CreatorDataUpload = () => {
  const [loading, setLoading] = useState(false);
  const [creatorData, setCreatorData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editingMessages, setEditingMessages] = useState([]);
  const [personalizedMessages, setPersonalizedMessages] = useState([]);
  const [groupSummaryMessage, setGroupSummaryMessage] = useState('');
  const [editingPersonalizedMessages, setEditingPersonalizedMessages] = useState([]);
  const [editingGroupSummaryMessage, setEditingGroupSummaryMessage] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [isPreview, setIsPreview] = useState(false);
  const [templates, setTemplates] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('wa_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPageSize = 10;
  const previewTotalPages = Math.ceil(creatorData.length / previewPageSize);
  const paginatedCreatorData = creatorData.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize);
  const [messagesPage, setMessagesPage] = useState(1);
  const messagesPageSize = 10;
  const messagesTotalPages = Math.ceil(messages.length / messagesPageSize);
  const paginatedMessages = messages.slice((messagesPage - 1) * messagesPageSize, messagesPage * messagesPageSize);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  useEffect(() => { setPreviewPage(1); }, [creatorData]);
  useEffect(() => { setMessagesPage(1); }, [messages]);

  // Parse Creator Data Excel (from TikTok export)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setNotification({ message: 'Parsing Excel file...', type: 'info', isVisible: true });
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log('First 3 rows:', rows.slice(0, 3));

      // Find the header row (look for a row that contains 'Creator ID' and 'Creator\'s username')
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
      const dataRows = rows.slice(headerRowIdx + 1);

      // Map each data row to an object using the detected headers
      const processedData = dataRows.map(rowArr => {
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = rowArr[idx];
        });
        // Now use your existing mapping logic, e.g.:
        return {
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
          graduationStatus: row['Graduation status'] || ''
        };
      });

      setCreatorData(processedData);
      setIsPreview(true);
      setNotification({ message: `Parsed ${processedData.length} creators successfully!`, type: 'success', isVisible: true });
      generateWhatsAppMessages(processedData);
    } catch (error) {
      setNotification({ message: 'Error processing file. Please check the format.', type: 'error', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessages = (data) => {
    // Sort data by diamonds in descending order
    const sortedData = [...data].sort((a, b) => b.diamonds - a.diamonds);
    
    // Generate personalized messages for top 10
    const top10Data = sortedData.slice(0, 10);
    const personalizedMsgs = top10Data.map(creator => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      return {
        username: creator.username_tiktok,
        rank: sortedData.findIndex(c => c.username_tiktok === creator.username_tiktok) + 1,
        message: `🎉 *CONGRATULATIONS @${creator.username_tiktok}!*\n\n🏆 *Rank #${sortedData.findIndex(c => c.username_tiktok === creator.username_tiktok) + 1}* in this month's performance!\n\n📊 *PERFORMANCE REPORT ${creator.period}*\n\n👤 *Creator:* @${creator.username_tiktok}\n🎓 *Status:* ${creator.graduationStatus}\n\n💎 *Diamonds:* ${creator.diamonds.toLocaleString('id-ID')}\n${creator.diamondsVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.diamondsVsLastMonth}\n🎯 *Target Achieved:* ${creator.diamondsAchieved}\n\n📅 *Valid Days:* ${creator.validDays} hari\n⏱️ *Live Duration:* ${liveDurationParsed}\n${creator.durationVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.durationVsLastMonth}\n\n👥 *New Followers:* ${creator.newFollowers.toLocaleString('id-ID')}\n${creator.followersVsLastMonth.includes('-') ? '📉' : '📈'} *Growth:* ${creator.followersVsLastMonth}\n\n🎬 *Total Streams:* ${creator.liveStreams}\n💰 *Subscription Revenue:* $${creator.subscriptionRevenue}\n\n${getMotivationalMessage(creator)}\n\n_Keep up the amazing work!_ 🚀`
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
    
    // Set all message types
    setPersonalizedMessages(personalizedMsgs);
    setGroupSummaryMessage(groupSummaryMsg);
    setEditingPersonalizedMessages(personalizedMsgs.map(m => m.message));
    setEditingGroupSummaryMessage(groupSummaryMsg);
    
    // Keep the old messages array for backward compatibility
    const formattedMessages = data.map(creator => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      return {
        username: creator.username_tiktok,
        message: `📊 *LAPORAN PERFORMA ${creator.period}*\n\n👤 *Creator:* ${creator.username_tiktok}\n🎓 *Status:* ${creator.graduationStatus}\n\n💎 *Diamonds:* ${creator.diamonds.toLocaleString('id-ID')}\n${creator.diamondsVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.diamondsVsLastMonth}\n🎯 *Target Achieved:* ${creator.diamondsAchieved}\n\n📅 *Valid Days:* ${creator.validDays} hari\n⏱️ *Live Duration:* ${liveDurationParsed}\n${creator.durationVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.durationVsLastMonth}\n\n👥 *New Followers:* ${creator.newFollowers.toLocaleString('id-ID')}\n${creator.followersVsLastMonth.includes('-') ? '📉' : '📈'} *Growth:* ${creator.followersVsLastMonth}\n\n🎬 *Total Streams:* ${creator.liveStreams}\n💰 *Subscription Revenue:* $${creator.subscriptionRevenue}\n\n${getMotivationalMessage(creator)}\n\n_Keep up the great work!_ 🚀`
      };
    });
    setMessages(formattedMessages);
    setEditingMessages(formattedMessages.map(m => m.message));
  };

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

  const saveToDatabase = async () => {
    setLoading(true);
    setNotification({ message: 'Saving to database...', type: 'info', isVisible: true });
    setProgressTotal(creatorData.length);
    setProgressCurrent(0);
    const period = creatorData[0]?.period || '';
    const [year, month] = period.split('-').slice(0, 2);
    try {
      const { data: uploadData, error: uploadError } = await supabase.from('creator_data_uploads').insert({
        period,
        year: parseInt(year),
        month: parseInt(month),
        uploaded_at: new Date().toISOString(),
        messages: editingMessages,
        creators_count: creatorData.length
      });
      if (uploadError && (typeof uploadError !== 'object' || Object.keys(uploadError).length > 0)) {
        let errorMsg = '';
        if (typeof uploadError === 'string') {
          errorMsg = uploadError;
        } else if (uploadError && uploadError.message) {
          errorMsg = uploadError.message;
        } else {
          errorMsg = JSON.stringify(uploadError);
        }
        setNotification({ message: 'Error saving upload context: ' + errorMsg, type: 'error', isVisible: true });
      } else {
        setNotification({ message: 'Upload context saved successfully!', type: 'success', isVisible: true });
      }

      // Step 1 & 2: For each row, find or create creator
      for (const [idx, creator] of creatorData.entries()) {
        let dbCreator = null;
        // Try to find by creator_id (from Excel)
        if (creator.creator_id) {
          const { data: foundById, error: errById } = await supabase
            .from('creators')
            .select('*')
            .eq('creator_id', creator.creator_id)
            .single();
          if (foundById) dbCreator = foundById;
        }
        // If not found, try to find by username_tiktok
        if (!dbCreator && creator.username_tiktok) {
          const { data: foundByUsername, error: errByUsername } = await supabase
            .from('creators')
            .select('*')
            .eq('username_tiktok', creator.username_tiktok)
            .single();
          if (foundByUsername) dbCreator = foundByUsername;
        }
        // If still not found, create new creator
        if (!dbCreator) {
          const { data: newCreator, error: insertError } = await supabase
            .from('creators')
            .insert({
              creator_id: creator.creator_id || null,
              username_tiktok: creator.username_tiktok || null,
              graduation_status: creator.graduationStatus || creator.graduation_status || null
            })
            .select()
            .single();
          dbCreator = newCreator;
          console.log('Created new creator:', dbCreator);
        } else {
          console.log('Found creator:', dbCreator);
        }
        // Step 3: If username changed, update and log
        if (dbCreator && creator.username_tiktok && dbCreator.username_tiktok !== creator.username_tiktok) {
          // Log to username_history
          await supabase.from('username_history').insert({
            creator_id: dbCreator.id,
            old_username: dbCreator.username_tiktok,
            new_username: creator.username_tiktok
          });
          // Update creators table
          await supabase.from('creators').update({
            username_tiktok: creator.username_tiktok
          }).eq('id', dbCreator.id);
          console.log(`Username updated for creator_id ${dbCreator.id}: ${dbCreator.username_tiktok} -> ${creator.username_tiktok}`);
        }
        // Step 4: Insert performance data using the UUID
        if (dbCreator) {
          const perfObj = {
            creator_id: dbCreator.id,
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
            .insert(perfObj);
          if (perfError) {
            console.error('Supabase upsert error:', perfError, perfObj);
          } else {
            console.log('Performance data inserted:', perfObj);
          }
        }
        setProgressCurrent(idx + 1);
      }
    } catch (err) {
      setNotification({ message: 'Error saving upload context: ' + err.message, type: 'error', isVisible: true });
    } finally {
      setLoading(false);
      setProgressCurrent(0);
      setProgressTotal(0);
    }
  };

  const copyMessage = (index) => {
    navigator.clipboard.writeText(editingMessages[index]);
    setNotification({ message: 'Message copied!', type: 'success', isVisible: true });
  };

  const copyPersonalizedMessage = (index) => {
    navigator.clipboard.writeText(editingPersonalizedMessages[index]);
    setNotification({ message: 'Personalized message copied!', type: 'success', isVisible: true });
  };

  const copyAllMessages = () => {
    const allMessages = editingMessages.join('\n\n---\n\n');
    navigator.clipboard.writeText(allMessages);
    setNotification({ message: 'All messages copied to clipboard!', type: 'success', isVisible: true });
  };

  const copyAllPersonalizedMessages = () => {
    const allPersonalized = editingPersonalizedMessages.join('\n\n---\n\n');
    navigator.clipboard.writeText(allPersonalized);
    setNotification({ message: 'All personalized messages copied to clipboard!', type: 'success', isVisible: true });
  };

  const copyGroupSummaryMessage = () => {
    navigator.clipboard.writeText(editingGroupSummaryMessage);
    setNotification({ message: 'Group summary message copied to clipboard!', type: 'success', isVisible: true });
  };

  const sendViaWhatsApp = (index) => {
    const msg = encodeURIComponent(editingMessages[index]);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const sendPersonalizedViaWhatsApp = (index) => {
    const msg = encodeURIComponent(editingPersonalizedMessages[index]);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const sendGroupSummaryViaWhatsApp = () => {
    const msg = encodeURIComponent(editingGroupSummaryMessage);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const filterByPerformance = (minDiamonds) => {
    return messages.filter(m => {
      const creator = creatorData.find(c => c.username_tiktok === m.username);
      return creator && creator.diamonds >= minDiamonds;
    });
  };

  const handleEditMessage = (index, newValue) => {
    const updated = [...editingMessages];
    updated[index] = newValue;
    setEditingMessages(updated);
  };

  const handleEditPersonalizedMessage = (index, newValue) => {
    const updated = [...editingPersonalizedMessages];
    updated[index] = newValue;
    setEditingPersonalizedMessages(updated);
  };

  const handleEditGroupSummaryMessage = (newValue) => {
    setEditingGroupSummaryMessage(newValue);
  };

  // Save current messages as a template
  const saveTemplate = () => {
    const name = prompt('Template name?');
    if (!name) return;
    const newTemplates = [...templates, { name, messages: [...editingMessages] }];
    setTemplates(newTemplates);
    localStorage.setItem('wa_templates', JSON.stringify(newTemplates));
    setNotification({ message: 'Template saved!', type: 'success', isVisible: true });
  };

  // Apply a template
  const applyTemplate = (idx) => {
    setEditingMessages([...templates[idx].messages]);
    setSelectedTemplate(idx);
    setNotification({ message: `Template "${templates[idx].name}" applied!`, type: 'info', isVisible: true });
  };

  // Delete a template
  const deleteTemplate = (idx) => {
    if (!window.confirm('Delete this template?')) return;
    const newTemplates = templates.filter((_, i) => i !== idx);
    setTemplates(newTemplates);
    localStorage.setItem('wa_templates', JSON.stringify(newTemplates));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <motion.div className="rounded-xl shadow-md p-8 mb-8 bg-white border border-gray-200" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-6">Upload Creator Performance Data</h2>
        <div className="mb-8">
          <label className="block mb-4">
            <span className={`text-base font-medium`}>Upload Creator Data Excel (from TikTok Backstage)</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className={`mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              disabled={loading}
            />
          </label>
          {loading && (
            <>
              {progressTotal > 0 && (
                <div className="flex justify-center mb-2 text-blue-700 font-semibold">
                  Uploading creator {progressCurrent} of {progressTotal}...
                </div>
              )}
              <div className="flex justify-center mt-4"><LoadingSpinner size="md" /></div>
            </>
          )}
        </div>
        {isPreview && creatorData.length > 0 && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-semibold mb-4">Preview Data</h3>
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className={`min-w-full divide-y divide-gray-200`}>
                <thead className={`bg-gray-100`}>
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Username</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Creator ID</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Period</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Diamonds</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Valid Days</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Live Duration</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">New Followers</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Live Streams</th>
                    <th className="px-4 py-2 text-xs font-medium uppercase">Graduation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCreatorData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm">{row.username_tiktok}</td>
                      <td className="px-4 py-2 text-sm">{row.creator_id}</td>
                      <td className="px-4 py-2 text-sm">{row.period}</td>
                      <td className="px-4 py-2 text-sm">{row.diamonds}</td>
                      <td className="px-4 py-2 text-sm">{row.validDays}</td>
                      <td className="px-4 py-2 text-sm">{row.liveDuration}</td>
                      <td className="px-4 py-2 text-sm">{row.newFollowers}</td>
                      <td className="px-4 py-2 text-sm">{row.liveStreams}</td>
                      <td className="px-4 py-2 text-sm">{row.graduationStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={saveToDatabase} variant="primary" loading={loading}>Save to Database</Button>
            </div>
            {previewTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setPreviewPage(p => Math.max(1, p - 1))} disabled={previewPage === 1} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {previewPage} of {previewTotalPages}</span>
                <button onClick={() => setPreviewPage(p => Math.min(previewTotalPages, p + 1))} disabled={previewPage === previewTotalPages} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
              </div>
            )}
          </motion.div>
        )}
        {creatorData.length > 0 && (
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 rounded shadow bg-blue-50">
              <div className="text-2xl font-bold text-blue-700">{creatorData.length}</div>
              <div className="text-gray-600">Total Creators</div>
            </div>
            <div className="p-4 rounded shadow bg-green-50">
              <div className="text-2xl font-bold text-green-700">{creatorData.filter(c => c.validDays >= 20).length}</div>
              <div className="text-gray-600">Active Creators (20+ days)</div>
            </div>
            <div className="p-4 rounded shadow bg-purple-50">
              <div className="text-2xl font-bold text-purple-700">{creatorData.reduce((sum, c) => sum + c.diamonds, 0).toLocaleString('id-ID')}</div>
              <div className="text-gray-600">Total Diamonds</div>
            </div>
            <div className="p-4 rounded shadow bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-700">{personalizedMessages.length}</div>
              <div className="text-gray-600">Personalized Messages</div>
            </div>
          </motion.div>
        )}
        {messages.length > 0 && (
          <div className="flex gap-4 mb-8">
            <Button onClick={copyAllMessages} variant="primary">Copy All Messages</Button>
            <Button onClick={() => setMessages(filterByPerformance(50000))} variant="secondary">Filter High Performers (50K+)</Button>
            <Button onClick={() => generateWhatsAppMessages(creatorData)} variant="outline">Reset Filter</Button>
          </div>
        )}
        
        {/* New Dual Message System */}
        {personalizedMessages.length > 0 && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">🎉 Personalized Messages (Top 10)</h3>
              <div className="flex gap-2">
                <Button onClick={copyAllPersonalizedMessages} variant="primary" size="sm">Copy All Personalized</Button>
              </div>
            </div>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {personalizedMessages.map((msg, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-yellow-800">#{msg.rank} @{msg.username}</span>
                      <span className="text-xs text-gray-500 ml-2">(Personal Message)</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => copyPersonalizedMessage(index)} variant="ghost" size="sm">Copy</Button>
                      <Button onClick={() => sendPersonalizedViaWhatsApp(index)} variant="outline" size="sm">WhatsApp</Button>
                    </div>
                  </div>
                  <Textarea
                    className="w-full text-sm text-gray-700 font-sans mb-2"
                    value={editingPersonalizedMessages[index]}
                    onChange={e => handleEditPersonalizedMessage(index, e.target.value)}
                    rows={8}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Templates Section */}
        {personalizedMessages.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Button onClick={saveTemplate} variant="outline" size="sm">Save as Template</Button>
              {templates.length > 0 && <span className="text-sm text-gray-600 ml-2">Templates:</span>}
              {templates.map((tpl, idx) => (
                <span key={idx} className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs mr-2">
                  <button className="font-semibold text-blue-600 hover:underline mr-1" onClick={() => applyTemplate(idx)}>{tpl.name}</button>
                  <button className="text-red-400 ml-1" onClick={() => deleteTemplate(idx)} title="Delete">&times;</button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Group Summary Message */}
        {groupSummaryMessage && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📊 Group Summary Message (All Creators)</h3>
              <div className="flex gap-2">
                <Button onClick={copyGroupSummaryMessage} variant="primary" size="sm">Copy Group Summary</Button>
                <Button onClick={sendGroupSummaryViaWhatsApp} variant="outline" size="sm">Send to WhatsApp</Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 hover:bg-blue-50 border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">(Send this one message to the group)</span>
              </div>
              <Textarea
                className="w-full text-sm text-gray-700 font-sans mb-2"
                value={editingGroupSummaryMessage}
                onChange={e => handleEditGroupSummaryMessage(e.target.value)}
                rows={12}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatorDataUpload; 