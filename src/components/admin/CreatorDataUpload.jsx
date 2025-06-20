import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';


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
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [creatorData, setCreatorData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [isPreview, setIsPreview] = useState(false);

  // Parse Creator Data Excel (from TikTok export)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setNotification({ message: 'Parsing Excel file...', type: 'info', isVisible: true });
    try {
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
    const formattedMessages = data.map(creator => {
      const liveDurationParsed = parseLiveDuration(creator.liveDuration);
      return {
        username: creator.username_tiktok,
        message: `📊 *LAPORAN PERFORMA ${creator.period}*\n\n👤 *Creator:* ${creator.username_tiktok}\n🎓 *Status:* ${creator.graduationStatus}\n\n💎 *Diamonds:* ${creator.diamonds.toLocaleString('id-ID')}\n${creator.diamondsVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.diamondsVsLastMonth}\n🎯 *Target Achieved:* ${creator.diamondsAchieved}\n\n📅 *Valid Days:* ${creator.validDays} hari\n⏱️ *Live Duration:* ${liveDurationParsed}\n${creator.durationVsLastMonth.includes('-') ? '📉' : '📈'} *Vs Bulan Lalu:* ${creator.durationVsLastMonth}\n\n👥 *New Followers:* ${creator.newFollowers.toLocaleString('id-ID')}\n${creator.followersVsLastMonth.includes('-') ? '📉' : '📈'} *Growth:* ${creator.followersVsLastMonth}\n\n🎬 *Total Streams:* ${creator.liveStreams}\n💰 *Subscription Revenue:* $${creator.subscriptionRevenue}\n\n${getMotivationalMessage(creator)}\n\n_Keep up the great work!_ 🚀`
      };
    });
    setMessages(formattedMessages);
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
    const period = creatorData[0]?.period || '';
    const [year, month] = period.split('-').slice(0, 2);
    for (const creator of creatorData) {
      try {
        console.log('Raw Excel row:', creator);
        // Map to DB object
        const mappedCreator = {
          creator_id: creator.creator_id,
          username_tiktok: creator.username_tiktok,
          graduation_status: creator.graduationStatus
        };
        console.log('Mapped object:', mappedCreator);
        const { data: existingCreator, error: selectError } = await supabase
          .from('creators')
          .select('id')
          .eq('username_tiktok', creator.username_tiktok)
          .single();
        if (selectError) {
          console.error('Supabase select error:', selectError, mappedCreator);
        }
        let creatorId;
        if (!existingCreator) {
          const { data: newCreator, error: insertError } = await supabase
            .from('creators')
            .insert(mappedCreator)
            .select()
            .single();
          if (insertError) {
            console.error('Supabase insert error:', insertError, mappedCreator);
          }
          creatorId = newCreator?.id;
        } else {
          creatorId = existingCreator.id;
        }
        const perfObj = {
          creator_id: creatorId,
          period_month: parseInt(month),
          period_year: parseInt(year),
          diamonds: creator.diamonds,
          valid_days: creator.validDays,
          live_hours: parseFloat(creator.liveDuration.match(/(\d+)/)?.[1] || 0),
          new_followers: creator.newFollowers,
          diamonds_vs_last_month: parseFloat(creator.diamondsVsLastMonth),
          raw_data: creator
        };
        console.log('Performance object:', perfObj);
        const { error: perfError } = await supabase
          .from('creator_performance')
          .upsert(perfObj);
        if (perfError) {
          console.error('Supabase upsert error:', perfError, perfObj);
        }
      } catch (error) {
        console.error('General error:', error);
        setNotification({ message: `Error saving creator ${creator.username_tiktok}: ${error.message}`, type: 'error', isVisible: true });
      }
    }
    setLoading(false);
    setNotification({ message: 'Data saved successfully!', type: 'success', isVisible: true });
    setIsPreview(false);
  };

  const copyMessage = (message) => {
    navigator.clipboard.writeText(message);
    setNotification({ message: 'Message copied!', type: 'success', isVisible: true });
  };

  const copyAllMessages = () => {
    const allMessages = messages.map(m => m.message).join('\n\n---\n\n');
    navigator.clipboard.writeText(allMessages);
    setNotification({ message: 'All messages copied to clipboard!', type: 'success', isVisible: true });
  };

  const filterByPerformance = (minDiamonds) => {
    return messages.filter(m => {
      const creator = creatorData.find(c => c.username_tiktok === m.username);
      return creator && creator.diamonds >= minDiamonds;
    });
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto transition-colors duration-500`}>
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <motion.div
        className={`rounded-2xl shadow-2xl p-10 mb-8 transition-colors duration-500`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
          {loading && <div className="flex justify-center mt-4"><LoadingSpinner size="md" /></div>}
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
                  {creatorData.map((row, idx) => (
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
          </motion.div>
        )}
        {creatorData.length > 0 && (
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-4 rounded shadow`}>
              <div className="text-2xl font-bold">{creatorData.length}</div>
              <div className="text-gray-600">Total Creators</div>
            </div>
            <div className={`p-4 rounded shadow`}>
              <div className="text-2xl font-bold">{creatorData.filter(c => c.validDays >= 20).length}</div>
              <div className="text-gray-600">Active Creators (20+ days)</div>
            </div>
            <div className={`p-4 rounded shadow`}>
              <div className="text-2xl font-bold">{creatorData.reduce((sum, c) => sum + c.diamonds, 0).toLocaleString('id-ID')}</div>
              <div className="text-gray-600">Total Diamonds</div>
            </div>
            <div className={`p-4 rounded shadow`}>
              <div className="text-2xl font-bold">{messages.length}</div>
              <div className="text-gray-600">Messages Generated</div>
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
        {messages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Generated WhatsApp Messages</h3>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{msg.username}</span>
                    <Button onClick={() => copyMessage(msg.message)} variant="ghost" size="sm">Copy</Button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{msg.message}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatorDataUpload; 