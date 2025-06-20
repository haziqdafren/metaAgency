import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Notification from '../common/Notification';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { Link } from 'react-router-dom';

const TalentManagement = () => {
  const { theme } = useThemeStore();
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

  useEffect(() => {
    loadTalents();
    loadUsernameChanges();
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
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      for (const row of jsonData) {
        try {
          console.log('Raw Excel row:', row);
          const creatorData = {
            creator_id: row['Creator ID:'] || row['Creator ID'],
            username_tiktok: row["Creator's username"] || '',
            followers_count: parseInt(row['Followers']) || 0,
            konten_kategori: mapCategory(row['Group'] || ''),
            game_preference: extractGames(row['Notes'] || ''),
            joined_date: parseDate(row['Joined time']),
            days_since_joining: parseInt(row['Days since joining']) || 0,
            graduation_status: row['Graduation status'] || '',
            status: row['Relationship status'] === 'Effective' ? 'active' : 'inactive'
          };
          console.log('Mapped object:', creatorData);
          const { data: existing, error: selectError } = await supabase
            .from('creators')
            .select('id, username_tiktok')
            .eq('creator_id', creatorData.creator_id)
            .single();
          if (selectError) {
            console.error('Supabase select error:', selectError, creatorData);
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
          const { data: upsertData, error: upsertError } = await supabase
            .from('creators')
            .upsert(creatorData, { onConflict: 'creator_id' });
          if (upsertError) {
            console.error('Supabase upsert error:', upsertError, creatorData);
          }
        } catch (rowError) {
          console.error('General row error:', rowError, row);
        }
      }
      setNotification({ message: `Imported ${jsonData.length} creators successfully!`, type: 'success', isVisible: true });
      loadTalents();
      loadUsernameChanges();
    } catch (error) {
      console.error('General file error:', error);
      setNotification({ message: 'Error processing file. Please check the format.', type: 'error', isVisible: true });
      setLoading(false);
    }
    setLoading(false);
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
      const cleaned = dateStr.replace(/[()]/g, '').split(' ')[0];
      return cleaned.replace(/:/g, '-');
    } catch {
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

  const exportResults = () => {
    const exportData = filteredTalents.map(talent => ({
      'Creator ID': talent.creator_id,
      'Username': talent.username_tiktok,
      'Followers': talent.followers_count,
      'Category': talent.konten_kategori,
      'Games': talent.game_preference,
      'Status': talent.status,
      'Days Since Joining': talent.days_since_joining,
      'Graduation Status': talent.graduation_status,
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

  return (
    <div className={`p-6 max-w-7xl mx-auto transition-colors duration-500`}>
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <motion.div
        className={`rounded-2xl shadow-2xl p-10 mb-8 transition-colors duration-500`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
        </div>
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
              {filteredTalents.slice(0, 50).map((talent) => (
                <tr key={talent.id} className="hover:bg-gray-50">
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
          {filteredTalents.length > 50 && (
            <div className="text-center py-4 text-gray-600">Showing first 50 results. Export to see all {filteredTalents.length} results.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TalentManagement; 